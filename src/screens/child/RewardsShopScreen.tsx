import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { ChildScreen, Icon, PinPad } from '@/components/common';
import { GalaxyFooter } from '@/components/adventure';
import { ColorArt } from '@/components/adventure/ColorArt';
import { EquippedBadge } from '@/components/adventure/EquippedBadge';
import { BackgroundPicture, ThemeScene } from '@/components/adventure/ThemeScene';
import { AvatarArt } from '@/components/adventure/AvatarArt';
import { MAX_FONT_SCALE, MIN_CHILD_TARGET, MIN_SUPPORTED_WIDTH, SPACING } from '@/constants/sizes';
import { useSettings } from '@/context/SettingsContext';
import { shopRepo } from '@/database';
import { verifyPin } from '@/services/pin';
import { CASH_PURCHASES_ENABLED } from '@/subscription/release';
import { useShopEquipped, useShopOwned, useSizes, useStarSummary } from '@/hooks';
import { usePetWardrobe } from '@/hooks/usePet';
import { useAdventureMap } from '@/hooks/useTodayAdventure';
import { petShopEntries } from '@/adventure/pet';
import { SpacePet } from '@/components/adventure/SpacePet';
import type { RootScreenProps } from '@/navigation/types';
import { getCashProvider } from '@/shop';
import { SHOP_CATEGORIES, SHOP_ITEMS, methodsFor, type AcquireMethod, type ShopCategory, type ShopItem } from '@/shop/catalog';
import { DEFAULT_THEME, THEME_SLOT } from '@/shop/themes';
import { AVATAR_SLOT } from '@/shop/avatars';
import { Fonts } from '@/theme';

type Filter = 'all' | ShopCategory | 'pet';
type Pending = { item: ShopItem; method: AcquireMethod; step: 'gate' | 'confirm' | 'working' } | null;

const RARITY_LABEL = { common: 'Common', rare: 'Rare', epic: 'Epic' } as const;

/**
 * The Rewards Shop: two ways to get an item, ONE inventory.
 *
 * STARS spend the same balance the Home counter shows (`useStarSummary`); REAL MONEY goes through the
 * platform store behind a grown-up check and is granted only on the store's confirmation. Either way the
 * item lands in `shop_purchases`, so what is owned cannot depend on how it was obtained and nothing is
 * charged for twice. Every purchase asks first, showing the item and the exact cost.
 *
 * A child's tap can never spend real money: the cash button opens a PIN check (the same Parent PIN as
 * Parent Mode), then a confirmation that says "real money" and shows the final price, then the store's
 * own payment sheet.
 */
export function RewardsShopScreen(_props: RootScreenProps<'RewardsShop'>) {
  const sizes = useSizes();
  const { width, height } = useWindowDimensions();
  const { settings } = useSettings();
  const { data: summary } = useStarSummary();
  const { data: owned } = useShopOwned();
  const { data: equipped } = useShopEquipped();
  const [filter, setFilter] = useState<Filter>('all');
  // Pet accessories are earned by practice (adventure/pet.ts), never bought, so they take no stars and no cash.
  const petMap = useAdventureMap();
  const wardrobe = usePetWardrobe(petMap);
  const petEntries = petShopEntries(wardrobe.unlocked, wardrobe.equipped);
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState<Pending>(null);
  // Previewing a theme draws it in a sheet of its own. It never touches the active theme.
  const [preview, setPreview] = useState<ShopItem | null>(null);
  const [pinKey, setPinKey] = useState(0);
  const [prices, setPrices] = useState<Record<string, string>>({});
  const provider = getCashProvider();
  // Having found the Shop is the end of the discovery hint on Home.
  const { updateSetting, settings: shopSettings } = useSettings();
  useEffect(() => {
    if (shopSettings.shopHint !== 'done') void updateSetting('shopHint', 'done');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let live = true;
    provider.getPrices(SHOP_ITEMS.flatMap((i) => (i.cash ? [i.cash.productId] : []))).then((p) => live && setPrices(p)).catch(() => {});
    return () => {
      live = false;
    };
  }, [provider]);

  // Floored: the window reports 0 on a first frame (see MIN_SUPPORTED_WIDTH).
  const contentWidth = Math.max(MIN_SUPPORTED_WIDTH, width) - sizes.horizontalPadding * 2;
  const columns = contentWidth >= 600 ? 4 : contentWidth >= 340 ? 2 : 1;
  const cardWidth = Math.floor((contentWidth - sizes.gap * (columns - 1)) / columns);
  const items = SHOP_ITEMS.filter((i) => filter === 'all' || i.category === filter);
  const showPets = filter === 'all' || filter === 'pet';
  const cashPrice = (item: ShopItem) => (item.cash ? prices[item.cash.productId] ?? item.cash.fallbackPrice : '');

  const start = (item: ShopItem, method: AcquireMethod) => {
    setMessage('');
    setPinKey((k) => k + 1);
    setPending({ item, method, step: method === 'cash' ? 'gate' : 'confirm' });
  };

  const close = () => setPending(null);

  const confirm = async () => {
    if (!pending || pending.step === 'working') return;
    const { item, method } = pending;
    setPending({ ...pending, step: 'working' }); // blocks a second tap while the first is in flight
    try {
      if (method === 'stars') {
        const r = await shopRepo.buy(item.id);
        setMessage(r === 'bought' ? `Nice choice, Explorer! You've unlocked ${item.name}! 🎉` : r === 'owned' ? `You already have ${item.name}.` : 'Keep practising to earn more stars!');
      } else {
        const outcome = await provider.purchase(item.cash!.productId);
        if (outcome.kind === 'purchased') {
          // Ownership comes from the STORE's order id, never from the tap.
          const g = await shopRepo.grantCash(item.id, outcome.source, outcome.orderId);
          setMessage(g === 'granted' ? `Thank you! ${item.name} is now yours.` : `You already have ${item.name}. You were not charged twice.`);
        } else if (outcome.kind === 'cancelled') setMessage('Purchase cancelled. Nothing was charged.');
        else if (outcome.kind === 'pending') setMessage('Your payment is waiting for approval. The item will appear when the store confirms it.');
        else if (outcome.kind === 'unavailable') setMessage('Store purchases are not set up in this version of TalkEasy yet. Nothing was charged.');
        else setMessage('The purchase did not go through. Nothing was charged.');
      }
    } catch {
      setMessage('Something went wrong. Nothing was charged.');
    } finally {
      close();
    }
  };

  const restore = async () => {
    setMessage('');
    try {
      const found = await provider.restore();
      if (!provider.canPurchase) return setMessage('Restoring purchases is not available in this version of TalkEasy yet.');
      let granted = 0;
      for (const r of found) {
        const item = SHOP_ITEMS.find((i) => i.cash?.productId === r.productId);
        if (item && (await shopRepo.grantCash(item.id, r.source, r.orderId)) === 'granted') granted += 1;
      }
      setMessage(granted ? `Restored ${granted} item${granted === 1 ? '' : 's'}.` : 'Nothing new to restore.');
    } catch {
      setMessage('Could not restore purchases right now.');
    }
  };

  // What 'worn' means depends on what the item is: a theme or avatar has its own slot, the free starter avatar
  // is worn when no other is, and anything else is the badge beside the child's name.
  const themeActive = (item: ShopItem) =>
    item.themeId ? equipped[THEME_SLOT] === item.id : item.avatarId ? equipped[AVATAR_SLOT] === item.id || (!!item.free && !equipped[AVATAR_SLOT]) : equipped.badge === item.id;
  const isOwned = (item: ShopItem) => !!item.free || owned.includes(item.id);

  const equip = async (item: ShopItem) => {
    if (item.free) {
      // The free starter avatar is what shows when no other is equipped: switching to it takes the other off.
      if (equipped[AVATAR_SLOT]) await shopRepo.toggleEquip(equipped[AVATAR_SLOT]);
      setMessage(`${item.name} is with you!`);
      return;
    }
    const r = await shopRepo.toggleEquip(item.id);
    if (item.themeId) setMessage(r === 'equipped' ? `${item.name} is on!` : r === 'unequipped' ? `Back to ${DEFAULT_THEME.name}.` : '');
    else if (item.avatarId) setMessage(r === 'equipped' ? `${item.name} is now your buddy!` : r === 'unequipped' ? `Back to Astro Explorer.` : '');
    else setMessage(r === 'equipped' ? `Now wearing ${item.name}!` : r === 'unequipped' ? `Took off ${item.name}.` : '');
  };

  return (
    <ChildScreen title="Rewards Shop" subtitle="Spend your stars on rewards" art="progress" back>
      <View style={styles.flex}>
        <GalaxyFooter />
        <ScrollView style={styles.flex} contentContainerStyle={[styles.content, { paddingHorizontal: sizes.horizontalPadding }]}>
          <View style={styles.balanceRow}>
            <View style={styles.balance} accessible accessibilityRole="text" accessibilityLabel={`My Stars: ${summary.total}`}>
              <Icon name="star" size={26} color="#FFC933" />
              <Text style={styles.balanceLabel} maxFontSizeMultiplier={MAX_FONT_SCALE}>My Stars</Text>
              <Text style={styles.balanceValue} maxFontSizeMultiplier={MAX_FONT_SCALE}>{summary.total}</Text>
            </View>
            <EquippedBadge size={44} />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pills}>
            {[{ id: 'all' as const, label: 'All' }, ...SHOP_CATEGORIES.slice(0, 2), { id: 'pet' as const, label: 'Pet Accessories' }, ...SHOP_CATEGORIES.slice(2)].map((c) => (
              <Pressable key={c.id} onPress={() => setFilter(c.id)} accessibilityRole="button" accessibilityState={{ selected: filter === c.id }} style={[styles.pill, filter === c.id && styles.pillOn]}>
                <Text style={[styles.pillText, filter === c.id && styles.pillTextOn]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{c.label}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {message ? <Text style={styles.message} accessibilityLiveRegion="polite" maxFontSizeMultiplier={MAX_FONT_SCALE}>{message}</Text> : null}

          {filter === 'all' || filter === 'themes' ? (
            <View style={[styles.card, styles.defaultTheme, { width: contentWidth }]}>
              <View style={styles.scene}>
                <BackgroundPicture file={DEFAULT_THEME.background.file} scrim={DEFAULT_THEME.background.scrim} base="#0B1230" width={Math.min(contentWidth - 20, 220)} height={150} fill={false} />
              </View>
              <Text style={styles.name} maxFontSizeMultiplier={MAX_FONT_SCALE}>{DEFAULT_THEME.name} · Free</Text>
              <Text style={styles.desc} maxFontSizeMultiplier={MAX_FONT_SCALE}>{DEFAULT_THEME.description}</Text>
              <Pressable
                onPress={equipped[THEME_SLOT] ? () => shopRepo.toggleEquip(equipped[THEME_SLOT]).then(() => setMessage(`Back to ${DEFAULT_THEME.name}.`)) : undefined}
                accessibilityRole="button"
                accessibilityLabel={equipped[THEME_SLOT] ? `Use ${DEFAULT_THEME.name}` : `${DEFAULT_THEME.name} is in use`}
                accessibilityState={{ selected: !equipped[THEME_SLOT] }}
                style={[styles.button, equipped[THEME_SLOT] ? styles.buttonGet : styles.buttonOwned]}
              >
                <Text style={styles.buttonText} maxFontSizeMultiplier={MAX_FONT_SCALE}>{equipped[THEME_SLOT] ? 'Use Space Explorer' : 'Using ✓'}</Text>
              </Pressable>
            </View>
          ) : null}

          <View style={[styles.grid, { gap: sizes.gap }]}>
            {(filter === 'pet' ? [] : items).map((item) => {
              const have = isOwned(item);
              const worn = themeActive(item);
              const methods = methodsFor(item);
              const missing = (item.stars ?? 0) - summary.total;
              return (
                <View key={item.id} style={[styles.card, { width: cardWidth }, have && styles.cardOwned]}>
                  <View style={styles.art}>
                    {item.themeId ? (
                      <View style={styles.scene}>
                        <ThemeScene theme={item.themeId} width={cardWidth - 20} height={Math.round((cardWidth - 20) * 1.15)} fill={false} />
                      </View>
                    ) : item.avatarId ? (
                      <AvatarArt id={item.avatarId} size={Math.min(92, cardWidth - 28)} />
                    ) : item.art ? (
                      <ColorArt name={item.art} size={Math.min(84, cardWidth - 28)} />
                    ) : null}
                  </View>
                  <Text style={styles.name} numberOfLines={2} maxFontSizeMultiplier={MAX_FONT_SCALE}>{item.name}</Text>
                  <Text style={styles.rarity} maxFontSizeMultiplier={MAX_FONT_SCALE}>{RARITY_LABEL[item.rarity]}</Text>
                  <Text style={styles.desc} numberOfLines={2} maxFontSizeMultiplier={MAX_FONT_SCALE}>{item.description}</Text>

                  <Text style={styles.status} maxFontSizeMultiplier={MAX_FONT_SCALE}>{worn ? 'Equipped' : have ? 'Unlocked' : 'Locked'}</Text>
                  {item.themeId || item.avatarId ? (
                    <Pressable onPress={() => setPreview(item)} accessibilityRole="button" accessibilityLabel={`Preview ${item.name}`} style={[styles.button, styles.buttonPreview]}>
                      <Text style={styles.buttonText} maxFontSizeMultiplier={MAX_FONT_SCALE}>Preview</Text>
                    </Pressable>
                  ) : null}
                  {have ? (
                    <Pressable
                      onPress={() => equip(item)}
                      accessibilityRole="button"
                      accessibilityLabel={item.themeId || item.avatarId ? (worn ? `${item.name} is in use` : `Use ${item.name}`) : worn ? `Take off ${item.name}` : `Wear ${item.name}`}
                      accessibilityState={{ selected: worn }}
                      style={[styles.button, worn ? styles.buttonOwned : styles.buttonGet]}
                    >
                      <Text style={styles.buttonText} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>{item.themeId || item.avatarId ? (worn ? 'Using ✓' : item.themeId ? 'Use this theme' : 'Use this buddy') : worn ? 'Wearing ✓' : 'Wear it'}</Text>
                    </Pressable>
                  ) : (
                    methods.map((m) =>
                      m === 'stars' ? (
                        <Pressable
                          key="stars"
                          onPress={missing <= 0 ? () => start(item, 'stars') : () => setMessage(`You need ${missing} more star${missing === 1 ? '' : 's'} for ${item.name}. Keep practising to earn more stars!`)}
                          accessibilityRole="button"
                          accessibilityLabel={missing <= 0 ? `Redeem ${item.name} with ${item.stars} stars` : `${item.name}, ${item.stars} stars. You need ${missing} more`}
                          style={[styles.button, missing <= 0 ? styles.buttonGet : styles.buttonLocked]}
                        >
                          <Text style={styles.buttonText} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2}>
                            {missing <= 0 ? `Redeem with Stars  ⭐ ${item.stars}` : `⭐ ${item.stars} · ${missing} more`}
                          </Text>
                        </Pressable>
                      ) : (
                        <Pressable
                          key="cash"
                          onPress={() => start(item, 'cash')}
                          accessibilityRole="button"
                          accessibilityLabel={`Purchase ${item.name} for ${cashPrice(item)}. Real money. Asks a grown-up first.`}
                          style={[styles.button, styles.buttonCash]}
                        >
                          <Text style={styles.buttonText} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2}>{`Purchase  ${cashPrice(item)}`}</Text>
                        </Pressable>
                      ),
                    )
                  )}
                </View>
              );
            })}
          </View>

          {showPets ? (
            <View style={[styles.grid, { gap: sizes.gap, marginTop: sizes.gap }]}>
              {petEntries.map((p) => (
                <View key={p.id} style={[styles.card, { width: cardWidth }, p.status !== 'locked' && styles.cardOwned]}>
                  <View style={styles.art}>
                    <SpacePet size={Math.min(96, cardWidth - 28)} equipped={[p.id]} />
                  </View>
                  <Text style={styles.name} numberOfLines={2} maxFontSizeMultiplier={MAX_FONT_SCALE}>{p.name}</Text>
                  <Text style={styles.rarity} maxFontSizeMultiplier={MAX_FONT_SCALE}>Pet accessory</Text>
                  <Text style={styles.desc} numberOfLines={3} maxFontSizeMultiplier={MAX_FONT_SCALE}>{p.status === 'locked' ? p.hint : 'Earned by practising.'}</Text>
                  <Text style={styles.status} maxFontSizeMultiplier={MAX_FONT_SCALE}>{p.status === 'equipped' ? 'Equipped' : p.status === 'unlocked' ? 'Unlocked' : 'Locked'}</Text>
                  <Pressable
                    onPress={p.status === 'locked' ? () => setMessage(`${p.hint} Keep practising!`) : () => { wardrobe.toggle(p.id); setMessage(p.status === 'equipped' ? `Took off ${p.name}.` : `Now wearing ${p.name}!`); }}
                    accessibilityRole="button"
                    accessibilityLabel={p.status === 'locked' ? `${p.name}. Locked. ${p.hint}` : p.status === 'equipped' ? `Take off ${p.name}` : `Wear ${p.name}`}
                    accessibilityState={{ selected: p.status === 'equipped' }}
                    style={[styles.button, p.status === 'locked' ? styles.buttonLocked : p.status === 'equipped' ? styles.buttonOwned : styles.buttonGet]}
                  >
                    <Text style={styles.buttonText} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2}>{p.status === 'locked' ? 'How to unlock' : p.status === 'equipped' ? 'Wearing ✓' : 'Wear it'}</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          ) : null}

          {CASH_PURCHASES_ENABLED ? (
            <Pressable onPress={restore} accessibilityRole="button" style={styles.restore}>
              <Text style={styles.restoreText} maxFontSizeMultiplier={MAX_FONT_SCALE}>Restore purchases</Text>
            </Pressable>
          ) : null}
        </ScrollView>
      </View>

      <Modal visible={preview !== null} animationType="fade" onRequestClose={() => setPreview(null)}>
        {preview?.themeId || preview?.avatarId ? (
          <View style={styles.flex}>
            {preview.themeId ? (
              <ThemeScene theme={preview.themeId} width={Math.max(MIN_SUPPORTED_WIDTH, width)} height={Math.max(MIN_SUPPORTED_WIDTH, height)} />
            ) : (
              <View style={[StyleSheet.absoluteFill, { backgroundColor: '#0B1230' }]} />
            )}
            <View style={styles.previewBody}>
              <Text style={styles.previewTitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>{preview.name}</Text>
              {preview.avatarId ? <AvatarArt id={preview.avatarId} size={170} /> : null}
              <View style={styles.previewCard}>
                <Text style={styles.previewCardText} maxFontSizeMultiplier={MAX_FONT_SCALE}>{preview.avatarId ? 'LET\'S GO!' : 'Speech Practice'}</Text>
                <Text style={styles.previewCardSub} maxFontSizeMultiplier={MAX_FONT_SCALE}>This is how your screens will look.</Text>
              </View>
              <Text style={styles.previewNote} maxFontSizeMultiplier={MAX_FONT_SCALE}>{isOwned(preview) ? (preview.themeId ? 'You own this theme.' : 'You have this buddy.') : 'Preview only. Nothing has changed.'}</Text>
              {isOwned(preview) && !themeActive(preview) ? (
                <Pressable onPress={() => equip(preview).then(() => setPreview(null))} accessibilityRole="button" style={[styles.button, styles.buttonGet, styles.previewButton]}>
                  <Text style={styles.buttonText} maxFontSizeMultiplier={MAX_FONT_SCALE}>Use this theme</Text>
                </Pressable>
              ) : null}
              <Pressable onPress={() => setPreview(null)} accessibilityRole="button" accessibilityLabel="Close preview" style={[styles.button, styles.buttonPreview, styles.previewButton]}>
                <Text style={styles.buttonText} maxFontSizeMultiplier={MAX_FONT_SCALE}>Close preview</Text>
              </Pressable>
            </View>
          </View>
        ) : null}
      </Modal>

      <Modal visible={pending !== null} transparent animationType="fade" onRequestClose={close}>
        <View style={styles.scrim}>
          {pending ? (
            <View style={styles.sheet} accessibilityViewIsModal>
              {pending.item.art ? <ColorArt name={pending.item.art} size={72} /> : null}
              <Text style={styles.sheetTitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>{pending.item.name}</Text>

              {pending.step === 'gate' ? (
                <>
                  <Text style={styles.sheetBody} maxFontSizeMultiplier={MAX_FONT_SCALE}>This costs real money. Ask a grown-up to enter the Parent PIN.</Text>
                  <PinPad
                    resetKey={pinKey}
                    onComplete={(pin) => {
                      if (verifyPin(pin, settings.parentPin)) setPending({ ...pending, step: 'confirm' });
                      else setPinKey((k) => k + 1);
                    }}
                  />
                </>
              ) : (
                <>
                  {pending.method === 'cash' ? (
                    <>
                      <Text style={styles.cashFlag} maxFontSizeMultiplier={MAX_FONT_SCALE}>REAL-MONEY PURCHASE</Text>
                      <Text style={styles.sheetPrice} maxFontSizeMultiplier={MAX_FONT_SCALE}>{cashPrice(pending.item)}</Text>
                      <Text style={styles.sheetBody} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                        {prices[pending.item.cash!.productId] ? 'The store will ask you to confirm before anything is charged.' : 'Final price is shown by the store before you pay.'}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.sheetPrice} maxFontSizeMultiplier={MAX_FONT_SCALE}>⭐ {pending.item.stars}</Text>
                      <Text style={styles.sheetBody} maxFontSizeMultiplier={MAX_FONT_SCALE}>{`You will have ${summary.total - (pending.item.stars ?? 0)} stars left.`}</Text>
                    </>
                  )}
                  <Pressable onPress={confirm} disabled={pending.step === 'working'} accessibilityRole="button" style={[styles.button, pending.method === 'cash' ? styles.buttonCash : styles.buttonGet, styles.sheetButton]}>
                    <Text style={styles.buttonText} maxFontSizeMultiplier={MAX_FONT_SCALE}>{pending.step === 'working' ? 'Please wait…' : pending.method === 'cash' ? 'Continue to the store' : 'Yes, redeem'}</Text>
                  </Pressable>
                </>
              )}
              <Pressable onPress={close} accessibilityRole="button" style={styles.cancel}>
                <Text style={styles.cancelText} maxFontSizeMultiplier={MAX_FONT_SCALE}>Not now</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </Modal>
    </ChildScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingVertical: SPACING.md, gap: SPACING.md, paddingBottom: SPACING.xl * 2 },
  balanceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  balance: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#141B44', borderColor: '#FFC933', borderWidth: 2, borderRadius: 999, paddingHorizontal: 20, minHeight: MIN_CHILD_TARGET - 8 },
  balanceLabel: { color: '#FFFFFF', fontFamily: Fonts.extrabold, fontSize: 18 },
  balanceValue: { color: '#FFC933', fontFamily: Fonts.black, fontSize: 28 },
  pills: { flexDirection: 'row', gap: 8, paddingVertical: 2, paddingRight: 8 },
  pill: { minHeight: 44, paddingHorizontal: 18, borderRadius: 999, justifyContent: 'center', backgroundColor: 'rgba(12,18,52,0.78)' },
  pillOn: { backgroundColor: '#FFD84D' },
  pillText: { color: '#FFFFFF', fontFamily: Fonts.extrabold, fontSize: 15 },
  pillTextOn: { color: '#3A2A00' },
  message: { color: '#FFFFFF', textAlign: 'center', fontFamily: Fonts.extrabold, fontSize: 18, alignSelf: 'center', backgroundColor: 'rgba(12,18,52,0.9)', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 8, overflow: 'hidden' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 10, alignItems: 'center', gap: 6 },
  cardOwned: { backgroundColor: '#E6F8EC' },
  art: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#E8F0FF', borderRadius: 14, alignSelf: 'stretch', paddingVertical: 8 },
  name: { color: '#1B2350', fontFamily: Fonts.extrabold, fontSize: 15, textAlign: 'center' },
  rarity: { color: '#7B4FE0', fontFamily: Fonts.extrabold, fontSize: 12 },
  desc: { color: '#4A5280', fontFamily: Fonts.semibold, fontSize: 12, textAlign: 'center', minHeight: 30 },
  button: { alignSelf: 'stretch', minHeight: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8, paddingVertical: 6 },
  buttonGet: { backgroundColor: '#7B4FE0' },
  buttonOwned: { backgroundColor: '#2FA866' },
  buttonLocked: { backgroundColor: '#B9C0D8' },
  buttonCash: { backgroundColor: '#E8672B' },
  buttonText: { color: '#FFFFFF', fontFamily: Fonts.black, fontSize: 14, textAlign: 'center' },
  scene: { borderRadius: 12, overflow: 'hidden', alignSelf: 'center' },
  status: { color: '#2A6FD6', fontFamily: Fonts.black, fontSize: 12 },
  buttonPreview: { backgroundColor: '#4A5A98' },
  defaultTheme: { alignSelf: 'center' },
  previewBody: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24 },
  // Everything over a background picture sits on a SOLID dark panel: the art behind is busy and often bright.
  previewTitle: { color: '#FFFFFF', fontFamily: Fonts.black, fontSize: 28, textAlign: 'center', backgroundColor: 'rgba(12,18,52,0.92)', borderRadius: 18, paddingHorizontal: 20, paddingVertical: 8, overflow: 'hidden' },
  previewCard: { backgroundColor: 'rgba(12,18,52,0.92)', borderColor: 'rgba(255,255,255,0.35)', borderWidth: 1.5, borderRadius: 20, padding: 18, width: '100%', maxWidth: 360, gap: 4 },
  previewCardText: { color: '#FFFFFF', fontFamily: Fonts.black, fontSize: 20 },
  previewCardSub: { color: '#E4EAFF', fontFamily: Fonts.bold, fontSize: 15 },
  previewNote: { color: '#FFFFFF', fontFamily: Fonts.extrabold, fontSize: 16, textAlign: 'center', backgroundColor: 'rgba(12,18,52,0.92)', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 8, overflow: 'hidden' },
  previewButton: { alignSelf: 'center', width: '100%', maxWidth: 360, minHeight: 52 },
  // A solid dark pill with white text: the link has to read over ANY background picture, bright or dark.
  restore: { alignSelf: 'center', minHeight: 48, justifyContent: 'center', paddingHorizontal: 20, borderRadius: 999, backgroundColor: 'rgba(12,18,52,0.9)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)' },
  restoreText: { color: '#FFFFFF', fontFamily: Fonts.extrabold, fontSize: 15 },
  scrim: { flex: 1, backgroundColor: 'rgba(8,12,40,0.7)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  sheet: { backgroundColor: '#FFFFFF', borderRadius: 22, padding: 20, alignItems: 'center', gap: 10, width: '100%', maxWidth: 380 },
  sheetTitle: { color: '#1B2350', fontFamily: Fonts.black, fontSize: 22, textAlign: 'center' },
  sheetBody: { color: '#4A5280', fontFamily: Fonts.semibold, fontSize: 15, textAlign: 'center' },
  sheetPrice: { color: '#1B2350', fontFamily: Fonts.black, fontSize: 30 },
  cashFlag: { color: '#B3401A', fontFamily: Fonts.black, fontSize: 13, letterSpacing: 1 },
  sheetButton: { minHeight: 52 },
  cancel: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 16 },
  cancelText: { color: '#4A5280', fontFamily: Fonts.extrabold, fontSize: 15 },
});
