import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BigButton, Card, Icon, PressableScale, ScreenContainer, ScreenHeader, SectionTitle } from '@/components/common';
import { MAX_FONT_SCALE, MIN_PARENT_TARGET, SPACING } from '@/constants/sizes';
import { useSubscription } from '@/context/SubscriptionContext';
import type { RootScreenProps } from '@/navigation/types';
import { ALWAYS_FREE, PLUS_BENEFITS, PLUS_PRODUCTS, displayPrice, type BillingPeriod } from '@/subscription';
import { Fonts, Radius, useTheme } from '@/theme';
import { alertMessage } from '@/utils/confirm';

/**
 * TalkEasy Plus — what it is, what it costs, and what stays free either way.
 *
 * It is a GROWN-UP'S SCREEN and is dressed as one: ScreenContainer, no adventure zone, calm colours
 * (AGENTS.md — that contrast is how a child can tell the two apart). A child who taps a locked
 * activity lands here, sees immediately that it is not their part of the app, and can leave with
 * "Maybe later". Nothing on this screen is designed to make leaving hard.
 *
 * The tone is deliberate: a parent of a child with speech needs is being asked to pay for their
 * child's practice. Nothing here says "don't miss out" or suggests a child will fall behind,
 * because that is a sentence no parent in that position should be shown.
 *
 * The honesty rules are the reason some of this looks unusual for a paywall:
 * - the "always free" list is shown as prominently as the benefits, because what a family is NOT
 *   being charged for is what makes the ask believable;
 * - prices come from the store when there is one, and are labelled a placeholder when there is not;
 * - with no billing connected the button says so, rather than opening a checkout that cannot work.
 */
export function PlusScreen({ navigation }: RootScreenProps<'Plus'>) {
  const theme = useTheme();
  const c = theme.colors;
  const { isPlus, prices, canPurchase, purchase } = useSubscription();
  const [period, setPeriod] = useState<BillingPeriod>('yearly');
  const [busy, setBusy] = useState(false);

  const start = async () => {
    if (!canPurchase) {
      // No store account is connected yet. Saying so plainly beats a spinner that never resolves.
      alertMessage(
        'Not connected yet',
        'TalkEasy Plus is not on sale yet — app store billing has still to be set up. You can switch Plus on for testing in Parent Mode → Subscription.',
      );
      return;
    }
    setBusy(true);
    try {
      await purchase(PLUS_PRODUCTS.find((p) => p.period === period)!.productId);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenContainer>
      <ScreenHeader title="TalkEasy Plus" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {isPlus ? (
          <Card color={c.successSoft}>
            <View style={styles.activeRow}>
              <Icon name="check-decagram" size={28} color={c.success} />
              <Text style={[styles.activeText, { color: c.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                TalkEasy Plus is active. Everything is unlocked.
              </Text>
            </View>
          </Card>
        ) : null}

        <Text style={[styles.headline, { color: c.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          Help your child practise more
        </Text>
        <Text style={[styles.sub, { color: c.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          Plus opens every Speech Practice stage, all the Listen &amp; Talk areas and the full writing ladder.
        </Text>

        <SectionTitle title="What Plus adds" emoji="star-four-points" />
        {PLUS_BENEFITS.map((b) => (
          <View key={b} style={styles.line}>
            <Icon name="check-bold" size={18} color={c.success} />
            <Text style={[styles.lineText, { color: c.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {b}
            </Text>
          </View>
        ))}

        {/* Shown as prominently as the benefits, on purpose — see the note at the top of the file. */}
        <SectionTitle title="Always free" emoji="lock-open-variant" />
        {ALWAYS_FREE.map((b) => (
          <View key={b} style={styles.line}>
            <Icon name="heart" size={18} color={c.primary} />
            <Text style={[styles.lineText, { color: c.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {b}
            </Text>
          </View>
        ))}
        <Text style={[styles.note, { color: c.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          Talk is how your child says what they need. It is never locked, and it never will be.
        </Text>

        {isPlus ? null : (
          <>
            <SectionTitle title="Choose a plan" emoji="calendar-month" />
            <View style={styles.plans}>
              {PLUS_PRODUCTS.map((p) => {
                const price = displayPrice(p, prices);
                const selected = p.period === period;
                return (
                  <PressableScale
                    key={p.productId}
                    onPress={() => setPeriod(p.period)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    accessibilityLabel={`${p.label}, ${price.text}${p.bestValue ? ', best value' : ''}`}
                    style={styles.planWrap}
                  >
                    <View
                      style={[
                        styles.plan,
                        {
                          backgroundColor: selected ? theme.tint(c.primarySoft) : c.surface,
                          borderColor: selected ? c.primary : c.borderSoft,
                          borderWidth: selected ? 3 : 1.5,
                        },
                      ]}
                    >
                      {p.bestValue ? (
                        <View style={[styles.flag, { backgroundColor: c.primary }]}>
                          <Text style={styles.flagText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                            BEST VALUE
                          </Text>
                        </View>
                      ) : null}
                      <Text style={[styles.planLabel, { color: c.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                        {p.label}
                      </Text>
                      <Text style={[styles.planPrice, { color: c.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                        {price.text}
                      </Text>
                      {p.fallbackNote ? (
                        <Text style={[styles.planNote, { color: c.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                          {p.fallbackNote}
                        </Text>
                      ) : null}
                    </View>
                  </PressableScale>
                );
              })}
            </View>

            {/* Never let a placeholder price look like a firm one. */}
            {Object.keys(prices).length === 0 ? (
              <Text style={[styles.note, { color: c.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                Example prices. The real price in your own currency comes from the App Store or Google Play once
                billing is connected.
              </Text>
            ) : null}

            <BigButton
              label={busy ? 'Just a moment…' : 'Start TalkEasy Plus'}
              icon="star-four-points"
              minHeight={MIN_PARENT_TARGET}
              disabled={busy}
              onPress={start}
            />
            <BigButton
              label="Maybe later"
              icon="arrow-left"
              variant="secondary"
              minHeight={MIN_PARENT_TARGET}
              onPress={() => navigation.goBack()}
            />
          </>
        )}

        <Text style={[styles.smallprint, { color: c.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          A subscription renews until it is cancelled. You can cancel at any time in your App Store or Google Play
          account. Your child&apos;s practice stays on this device either way.
        </Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { padding: SPACING.lg, gap: SPACING.md, paddingBottom: SPACING.xl },
  headline: { fontFamily: Fonts.black, fontSize: 26, lineHeight: 32 },
  sub: { fontFamily: Fonts.bold, fontSize: 15, lineHeight: 21 },
  line: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm },
  lineText: { fontFamily: Fonts.bold, fontSize: 15, lineHeight: 21, flex: 1 },
  note: { fontFamily: Fonts.bold, fontSize: 13, lineHeight: 19, marginTop: SPACING.xs },
  plans: { flexDirection: 'row', gap: SPACING.md },
  planWrap: { flex: 1 },
  plan: { borderRadius: Radius.lg, padding: SPACING.md, gap: 2, minHeight: 104, justifyContent: 'center' },
  flag: { alignSelf: 'flex-start', borderRadius: Radius.sm, paddingHorizontal: SPACING.sm, paddingVertical: 2, marginBottom: 4 },
  flagText: { fontFamily: Fonts.black, fontSize: 10, color: '#FFFFFF', letterSpacing: 0.5 },
  planLabel: { fontFamily: Fonts.bold, fontSize: 13 },
  planPrice: { fontFamily: Fonts.black, fontSize: 22 },
  planNote: { fontFamily: Fonts.bold, fontSize: 12 },
  activeRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  activeText: { fontFamily: Fonts.extrabold, fontSize: 15, flex: 1 },
  smallprint: { fontFamily: Fonts.bold, fontSize: 12, lineHeight: 18, marginTop: SPACING.md },
});
