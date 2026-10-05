import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BigButton, FormField, ListRow, ProgressBar, ScreenContainer, ScreenHeader, SectionTitle, StatTile } from '@/components/common';
import { MAX_FONT_SCALE, MIN_PARENT_TARGET, SPACING } from '@/constants/sizes';
import { useProfile } from '@/context/ProfileContext';
import { rewardsRepo } from '@/database';
import { useAwaitingClaims, useRewardList, useShopEquipped, useShopOwned, useSizes, useStarHistory, useStarSummary } from '@/hooks';
import { SHOP_ITEMS } from '@/shop/catalog';
import { formatDateTime as fmtTime } from '@/utils/date';
import type { ParentScreenProps } from '@/navigation/types';
import { Fonts, Radius, useTheme } from '@/theme';
import type { Reward } from '@/types/models';
import { alertMessage, confirm } from '@/utils/confirm';
import { formatDateTime } from '@/utils/date';

const REWARD_EMOJI = ['🎮', '🍪', '🎨', '📺', '🧸', '🍦', '🎈', '🚗', '📚', '🎵', '⚽', '🌟'];

/**
 * Rewards: the star balance, the reward list (define / edit / delete / "give"), and the read-only shop
 * summary. There is NO control to add or remove stars by hand: stars come only from verified activity
 * (or a confirmed task below) and are spent only on a chosen reward or in the Shop.
 */
export function ManageRewardsScreen({ navigation }: ParentScreenProps<'ManageRewards'>) {
  const sizes = useSizes();
  const theme = useTheme();
  const { displayName } = useProfile();
  const { data: rewards } = useRewardList();
  const { data: summary } = useStarSummary();
  const { data: history } = useStarHistory(15);
  const { data: waiting } = useAwaitingClaims();
  const { data: ownedItems } = useShopOwned();
  const { data: wornItems } = useShopEquipped();
  const { data: shopHistory } = useStarHistory(200);

  const [editing, setEditing] = useState<Reward | 'new' | null>(null);
  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState('🎁');
  const [stars, setStars] = useState('10');

  const startNew = () => { setTitle(''); setIcon('🎁'); setStars('10'); setEditing('new'); };
  const startEdit = (r: Reward) => { setTitle(r.title); setIcon(r.icon); setStars(String(r.starsRequired)); setEditing(r); };

  const saveReward = async () => {
    if (!title.trim()) return alertMessage('Please type the reward, e.g. "Choose a game".');
    const n = Number(stars) || 1;
    if (editing === 'new') await rewardsRepo.createReward(title, icon, n);
    else if (editing) await rewardsRepo.updateReward(editing.id, title, icon, n);
    setEditing(null);
  };

  const give = async (r: Reward) => {
    if (summary.total < r.starsRequired) return alertMessage('Not enough stars yet', `${displayName} has ${summary.total} of ${r.starsRequired}.`);
    if (await confirm(`Give "${r.title}"?`, `${r.starsRequired} stars will be used.`, 'Give reward')) await rewardsRepo.redeem(r);
  };

  return (
    <ScreenContainer>
      <ScreenHeader title={`${displayName}'s stars`} onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled">
          <View style={styles.stats}>
            <StatTile label="Stars now" value={summary.total} emoji="⭐" color={theme.colors.primarySoft} />
            <StatTile label="Earned today" value={summary.earnedToday} emoji="📅" color="#DDF5E3" />
          </View>
          {summary.nextReward ? (
            <ProgressBar value={Math.min(1, summary.total / summary.nextReward.starsRequired)} label={`${Math.min(summary.total, summary.nextReward.starsRequired)} / ${summary.nextReward.starsRequired}`} color={theme.colors.selected} accessibilityLabel={`Progress to ${summary.nextReward.title}`} />
          ) : null}

          {/* Tasks the app cannot see (activities done away from the screen, homework). The star is only
              credited here, by a grown-up, once. Parent Mode is already behind the Parent PIN. */}
          <SectionTitle title="Waiting for you" emoji="⏳" trailing={waiting.length ? String(waiting.length) : undefined} />
          {waiting.length === 0 ? (
            <Text style={[styles.label, { fontSize: sizes.body, color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              Nothing to check right now. When {displayName} finishes an activity or homework away from the screen, it will appear here.
            </Text>
          ) : (
            waiting.map((w) => (
              <View key={w.key} style={[styles.panel, { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.borderSoft }]}>
                <Text style={[styles.label, { fontSize: sizes.body + 1, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  {w.reason} · {w.amount} {w.amount === 1 ? 'star' : 'stars'}
                </Text>
                <View style={styles.stats}>
                  <BigButton label="Confirm" icon="check-bold" variant="success" minHeight={MIN_PARENT_TARGET} onPress={() => rewardsRepo.confirmClaim(w.key)} style={styles.half} />
                  <BigButton label="Not this time" variant="outline" minHeight={MIN_PARENT_TARGET} onPress={() => rewardsRepo.declineClaim(w.key)} style={styles.half} />
                </View>
              </View>
            ))
          )}

          {/* Read-only: what the Rewards Shop has done. Prices and balances are not editable here. */}
          <SectionTitle title="Rewards Shop" emoji="🛍️" />
          <View style={[styles.panel, { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.borderSoft }]}>
            {[
              ['Stars earned in total', summary.lifetime],
              ['Stars available now', summary.total],
              ['Stars spent', Math.max(0, summary.lifetime - summary.total)],
            ].map(([label, value]) => (
              <Text key={label as string} style={[styles.label, { fontSize: sizes.body, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{label}: {value}</Text>
            ))}
            <Text style={[styles.label, { fontSize: sizes.body, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              Buddies unlocked: {['Astro Explorer (starter)', ...SHOP_ITEMS.filter((i) => i.avatarId && ownedItems.includes(i.id)).map((i) => i.name)].join(', ')}
            </Text>
            <Text style={[styles.label, { fontSize: sizes.body, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              Themes unlocked: {['Space Explorer (free)', ...SHOP_ITEMS.filter((i) => i.themeId && ownedItems.includes(i.id)).map((i) => i.name)].join(', ')}
            </Text>
            <Text style={[styles.label, { fontSize: sizes.body, color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              In use: {SHOP_ITEMS.filter((i) => Object.values(wornItems).includes(i.id)).map((i) => i.name).join(', ') || 'the free defaults'}
            </Text>
            {shopHistory.filter((e) => e.source === 'shop').length === 0 ? (
              <Text style={[styles.label, { fontSize: sizes.body, color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>No redemptions yet.</Text>
            ) : (
              shopHistory.filter((e) => e.source === 'shop').slice(0, 10).map((e) => (
                <Text key={e.id} style={[styles.label, { fontSize: sizes.body - 1, color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  {fmtTime(e.createdAt)} · {e.reason.replace(/^Shop: /, '')} · {Math.abs(e.amount)} stars
                </Text>
              ))
            )}
          </View>

          <SectionTitle title="Rewards" emoji="🎁" />
          {editing ? (
            <View style={[styles.panel, { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.borderSoft }]}>
              <FormField label="Reward" value={title} onChangeText={setTitle} placeholder="e.g. Choose a game" maxLength={60} />
              <FormField label="Stars needed" value={stars} onChangeText={setStars} keyboardType="number-pad" maxLength={3} />
              <Text style={[styles.label, { fontSize: sizes.body, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>Picture</Text>
              <View style={styles.emojiRow}>
                {REWARD_EMOJI.map((e) => (
                  <Pressable key={e} onPress={() => setIcon(e)} accessibilityRole="button" accessibilityLabel={`Picture ${e}`} accessibilityState={{ selected: icon === e }} style={[styles.emojiCell, { borderColor: icon === e ? theme.colors.primary : theme.colors.borderSoft, borderWidth: icon === e ? 3 : 1.5, backgroundColor: theme.colors.surface }]}>
                    <Text style={styles.emoji} allowFontScaling={false}>{e}</Text>
                  </Pressable>
                ))}
              </View>
              <BigButton label="Save reward" icon="content-save" minHeight={64} onPress={saveReward} />
              <BigButton label="Cancel" variant="outline" minHeight={56} onPress={() => setEditing(null)} />
            </View>
          ) : (
            <BigButton label="Add a reward" icon="plus-circle" minHeight={72} onPress={startNew} />
          )}
          {rewards.map((r, index) => (
            <ListRow
              key={r.id}
              title={`${r.icon} ${r.title}`}
              subtitle={`${r.starsRequired} stars${summary.total >= r.starsRequired ? ' · ready to give!' : ''}`}
              onPress={() => startEdit(r)}
              actions={[
                { icon: 'chevron-up', label: 'Move up', disabled: index === 0, onPress: () => rewardsRepo.moveReward(r.id, -1) },
                { icon: 'chevron-down', label: 'Move down', disabled: index === rewards.length - 1, onPress: () => rewardsRepo.moveReward(r.id, 1) },
                { icon: 'gift-outline', label: 'Give this reward now', color: theme.colors.success, onPress: () => give(r) },
                { icon: 'pencil-outline', label: 'Edit', onPress: () => startEdit(r) },
                { icon: 'delete-outline', label: 'Delete', color: theme.colors.danger, onPress: async () => { if (await confirm('Delete reward?', `"${r.title}" will be removed.`)) rewardsRepo.removeReward(r.id); } },
              ]}
            />
          ))}

          <SectionTitle title="History" emoji="🕒" />
          {history.length === 0 ? <Text style={[styles.hint, { color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>No stars yet.</Text> : null}
          {history.map((h) => (
            <ListRow key={h.id} title={`${h.amount > 0 ? '+' : ''}${h.amount} ⭐  ${h.reason}`} subtitle={formatDateTime(h.createdAt)} />
          ))}
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  half: { flex: 1 },
  flex: { flex: 1 },
  list: { padding: SPACING.lg, gap: SPACING.md, paddingBottom: SPACING.xl * 2 },
  stats: { flexDirection: 'row', gap: SPACING.sm },
  panel: { gap: SPACING.md, padding: SPACING.md, borderWidth: 1.5, borderRadius: Radius.md },
  label: { fontFamily: Fonts.bold },
  emojiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  emojiCell: { width: MIN_PARENT_TARGET, height: MIN_PARENT_TARGET, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 28, lineHeight: 34 },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: SPACING.sm },
  grow: { flex: 1 },
  small: { minWidth: 96 },
  hint: { fontFamily: Fonts.semibold, fontSize: 16 },
});
