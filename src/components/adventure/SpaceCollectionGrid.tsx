import React, { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Icon } from '@/components/common';
import { CATEGORIES, RARITIES, getCollectible, trophyId, type CollectionCategory, type Destination } from '@/collection/registry';
import type { CollectibleState } from '@/collection/evaluate';
import { MAX_FONT_SCALE, MIN_CHILD_TARGET, MIN_SUPPORTED_WIDTH, SPACING } from '@/constants/sizes';
import { useSpaceCollection } from '@/context/CollectionContext';
import { useSizes } from '@/hooks';
import { Fonts } from '@/theme';
import { CollectibleArt } from './CollectibleArt';

const rarityOf = (r: CollectibleState['rarity']) => RARITIES.find((x) => x.id === r)!;

function foundOn(item: CollectibleState, backfilled: boolean): string {
  if (backfilled || !item.discoveredAt) return 'Found earlier';
  const d = new Date(item.discoveredAt);
  return Number.isNaN(d.getTime()) ? 'Found' : `Found ${d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}`;
}

/**
 * The Space Collection: every collectible by category, found ones in full colour and the rest as faint
 * silhouettes with a hint. Tap a card for the details (fun fact and date, or what to do and how far along).
 *
 * Discovery is celebrated here, kindly: new finds since the last visit appear in a banner and are then marked
 * seen. Nothing on this screen can take an item away, and a locked card is a way INTO a learning activity
 * (the details sheet has a button to go there), not a shop.
 */
export function SpaceCollectionGrid({ onGo }: { onGo: (d: Destination) => void }) {
  const sizes = useSizes();
  const { width } = useWindowDimensions();
  const { state, unseen, discoveries, markSeen } = useSpaceCollection();
  const [category, setCategory] = useState<CollectionCategory | 'all'>('all');
  const [selected, setSelected] = useState<CollectibleState | null>(null);
  const [celebrate, setCelebrate] = useState<string[]>([]);

  // Capture what is new when the screen opens, show it, and mark it seen so it is celebrated once.
  const marked = useRef(false);
  useEffect(() => {
    if (marked.current || unseen.length === 0) return;
    marked.current = true;
    setCelebrate(unseen);
    void markSeen(unseen);
  }, [unseen, markSeen]);

  // Floored: the window reports 0 on a first frame (see MIN_SUPPORTED_WIDTH).
  const contentWidth = Math.max(MIN_SUPPORTED_WIDTH, width) - sizes.horizontalPadding * 2;
  const columns = contentWidth >= 600 ? 4 : contentWidth >= 340 ? 3 : 2;
  const gap = 10;
  const cardWidth = Math.floor((contentWidth - gap * (columns - 1)) / columns);
  const shown = state.items.filter((i) => category === 'all' || i.category === category);
  const names = celebrate.map((id) => getCollectible(id)?.name).filter(Boolean) as string[];
  const trophies = celebrate.filter((id) => id.startsWith('trophy-')).length;

  return (
    <View style={{ gap: SPACING.sm }}>
      {names.length || trophies ? (
        <View style={styles.celebrate} accessibilityLiveRegion="polite">
          <Text style={styles.celebrateText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {names.length === 1 ? `You discovered the ${names[0]}! 🎉` : names.length > 1 ? `You discovered ${names.length} new things: ${names.slice(0, 3).join(', ')}${names.length > 3 ? '…' : ''}! 🎉` : ''}
            {trophies ? `  🏆 A category trophy!` : ''}
          </Text>
        </View>
      ) : null}

      {/* One horizontally scrolling row: seven wrapped chips made a column taller than the screen on a phone. */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {[{ id: 'all' as const, label: 'All', emoji: '⭐', n: state.found, total: state.total }, ...CATEGORIES.map((c) => ({ id: c.id, label: c.label, emoji: c.emoji, n: state.items.filter((i) => i.category === c.id && i.found).length, total: state.items.filter((i) => i.category === c.id).length }))].map((c) => (
          <Pressable
            key={c.id}
            onPress={() => setCategory(c.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: category === c.id }}
            accessibilityLabel={`${c.label}, ${c.n} of ${c.total} found`}
            style={[styles.chip, category === c.id && styles.chipOn]}
          >
            <Text style={[styles.chipText, category === c.id && styles.chipTextOn]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
              {c.emoji} {c.label} {c.n}/{c.total}
              {c.id !== 'all' && state.completeCategories.includes(c.id) ? ' 🏆' : ''}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={[styles.grid, { gap }]}>
        {shown.map((item) => {
          const rar = rarityOf(item.rarity);
          const mystery = !item.found && item.rarity === 'legendary';
          return (
            <Pressable
              key={item.id}
              onPress={() => setSelected(item)}
              accessibilityRole="button"
              accessibilityLabel={item.found ? `${item.name}. Collected. ${rar.label}.` : `${mystery ? 'A mystery legendary' : item.name}. Not found yet. ${item.hint}`}
              style={[styles.card, { width: cardWidth, minHeight: MIN_CHILD_TARGET + 70 }, item.found ? { borderColor: rar.color, backgroundColor: '#27336F' } : styles.cardLocked]}
            >
              <View style={styles.art}>
                <CollectibleArt art={item.art} size={Math.min(64, cardWidth - 24)} locked={!item.found} />
                {!item.found ? (
                  <View style={styles.q}>
                    <Text style={styles.qText} allowFontScaling={false}>?</Text>
                  </View>
                ) : null}
              </View>
              <Text style={[styles.name, !item.found && { color: '#A9B5DD' }]} numberOfLines={2} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {mystery ? 'Mystery' : item.name}
              </Text>
              <View style={[styles.rarity, { borderColor: rar.color }]}>
                <Text style={[styles.rarityText, { color: item.found ? rar.color : '#A9B5DD' }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{rar.label}</Text>
              </View>
              <Text style={[styles.status, { color: item.found ? '#FFE27A' : '#8FA0D8' }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{item.found ? '★ Collected' : 'Not yet'}</Text>
            </Pressable>
          );
        })}
      </View>

      <Modal visible={selected !== null} transparent animationType="fade" onRequestClose={() => setSelected(null)}>
        <View style={styles.scrim}>
          {selected ? (
            <View style={styles.sheet} accessibilityViewIsModal>
              <CollectibleArt art={selected.art} size={110} locked={!selected.found} />
              <Text style={styles.sheetName} maxFontSizeMultiplier={MAX_FONT_SCALE}>{!selected.found && selected.rarity === 'legendary' ? 'Mystery collectible' : selected.name}</Text>
              <View style={[styles.rarity, { borderColor: rarityOf(selected.rarity).color }]}>
                <Text style={[styles.rarityText, { color: '#1B2350' }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{rarityOf(selected.rarity).label} · {CATEGORIES.find((c) => c.id === selected.category)?.label}</Text>
              </View>
              {selected.found ? (
                <>
                  <Text style={styles.sheetBody} maxFontSizeMultiplier={MAX_FONT_SCALE}>{selected.fact}</Text>
                  <Text style={styles.sheetDate} maxFontSizeMultiplier={MAX_FONT_SCALE}>★ {foundOn(selected, !!discoveries.get(selected.id)?.backfilled)}</Text>
                </>
              ) : (
                <>
                  <Text style={styles.sheetBody} maxFontSizeMultiplier={MAX_FONT_SCALE}>{selected.hint}</Text>
                  {selected.target > 1 ? <Text style={styles.sheetDate} maxFontSizeMultiplier={MAX_FONT_SCALE}>{selected.current} of {selected.target}</Text> : null}
                  <Pressable onPress={() => { const d = selected.destination; setSelected(null); onGo(d); }} accessibilityRole="button" style={styles.go}>
                    <Icon name="play" size={20} color="#FFFFFF" />
                    <Text style={styles.goText} maxFontSizeMultiplier={MAX_FONT_SCALE}>Let's go!</Text>
                  </Pressable>
                </>
              )}
              <Pressable onPress={() => setSelected(null)} accessibilityRole="button" style={styles.close}>
                <Text style={styles.closeText} maxFontSizeMultiplier={MAX_FONT_SCALE}>Close</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  celebrate: { backgroundColor: 'rgba(255,216,77,0.95)', borderRadius: 18, padding: 12 },
  celebrateText: { color: '#3A2A00', fontFamily: Fonts.black, fontSize: 16, textAlign: 'center' },
  chips: { flexDirection: 'row', gap: 6, paddingVertical: 2, paddingRight: 4 },
  chip: { minHeight: 40, paddingHorizontal: 12, borderRadius: 999, justifyContent: 'center', backgroundColor: 'rgba(12,18,52,0.82)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  chipOn: { backgroundColor: '#FFD84D', borderColor: '#FFD84D' },
  chipText: { color: '#FFFFFF', fontFamily: Fonts.extrabold, fontSize: 13 },
  chipTextOn: { color: '#3A2A00' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' },
  card: { borderRadius: 18, borderWidth: 2, padding: 8, alignItems: 'center', gap: 4 },
  cardLocked: { backgroundColor: '#161F4E', borderColor: '#3A4A96' },
  art: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center' },
  q: { position: 'absolute', width: 26, height: 26, borderRadius: 13, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  qText: { fontFamily: Fonts.black, fontSize: 16, color: '#3A4A96' },
  name: { color: '#FFFFFF', fontFamily: Fonts.black, fontSize: 13, textAlign: 'center', minHeight: 32 },
  rarity: { borderWidth: 1.5, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 1, backgroundColor: 'rgba(255,255,255,0.9)' },
  rarityText: { fontFamily: Fonts.extrabold, fontSize: 11 },
  status: { fontFamily: Fonts.extrabold, fontSize: 12 },
  scrim: { flex: 1, backgroundColor: 'rgba(8,12,40,0.75)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  sheet: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, alignItems: 'center', gap: 10, width: '100%', maxWidth: 380 },
  sheetName: { color: '#1B2350', fontFamily: Fonts.black, fontSize: 22, textAlign: 'center' },
  sheetBody: { color: '#2B3560', fontFamily: Fonts.bold, fontSize: 16, textAlign: 'center' },
  sheetDate: { color: '#B97809', fontFamily: Fonts.black, fontSize: 15 },
  go: { alignSelf: 'stretch', minHeight: 52, borderRadius: 14, backgroundColor: '#7B4FE0', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  goText: { color: '#FFFFFF', fontFamily: Fonts.black, fontSize: 17 },
  close: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 16 },
  closeText: { color: '#4A5280', fontFamily: Fonts.extrabold, fontSize: 15 },
});
