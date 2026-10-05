import React, { useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BigButton, Card, Icon, ListRow, ScreenContainer, ScreenHeader, SectionTitle } from '@/components/common';
import { MAX_FONT_SCALE, MIN_PARENT_TARGET, SPACING } from '@/constants/sizes';
import { useSubscription } from '@/context/SubscriptionContext';
import type { ParentScreenProps } from '@/navigation/types';
import { GATED_AREAS, setMockPlan, subscription } from '@/subscription';
import { Fonts, useTheme } from '@/theme';
import { alertMessage } from '@/utils/confirm';

/**
 * Where a grown-up manages TalkEasy Plus. PIN-protected, like the rest of Parent Mode.
 *
 * This screen is the only place the subscription can be CHANGED, which is the point: a child can
 * reach the Plus screen by tapping a locked activity, but nothing they can do from there alters a
 * plan or spends money.
 *
 * While billing is not connected it also carries the development switch. That switch writes
 * `source: 'mock'` and this screen says so in as many words — a developer entitlement must never be
 * able to pass for a paid one, here or anywhere else.
 */
export function SubscriptionScreen({ navigation }: ParentScreenProps<'Subscription'>) {
  const theme = useTheme();
  const c = theme.colors;
  const { status, isPlus, restore } = useSubscription();
  const [busy, setBusy] = useState(false);

  const onRestore = async () => {
    setBusy(true);
    try {
      await restore();
      alertMessage(
        subscription.canPurchase ? 'Restore finished' : 'Nothing to restore',
        subscription.canPurchase
          ? 'Any subscription bought with this store account has been restored.'
          : 'App store billing is not connected yet, so there are no purchases to restore.',
      );
    } finally {
      setBusy(false);
    }
  };

  const toggleMock = async (plan: 'free' | 'plus') => {
    await setMockPlan(plan);
  };

  return (
    <ScreenContainer>
      <ScreenHeader title="Subscription" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Card color={isPlus ? c.successSoft : undefined}>
          <Text style={[styles.label, { color: c.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            CURRENT PLAN
          </Text>
          <View style={styles.planRow}>
            <Icon name={isPlus ? 'star-four-points' : 'account-child-outline'} size={26} color={isPlus ? c.success : c.primary} />
            <Text style={[styles.plan, { color: c.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {isPlus ? 'TalkEasy Plus active' : 'Free'}
            </Text>
          </View>
          {/* Said plainly, never buried: a test entitlement is not a purchase. */}
          {status.source === 'mock' ? (
            <Text style={[styles.warn, { color: c.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              This is a test entitlement switched on for development — not a purchase.
            </Text>
          ) : null}
          {status.expiresAt ? (
            <Text style={[styles.warn, { color: c.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              Renews or ends on {status.expiresAt.slice(0, 10)}.
            </Text>
          ) : null}
        </Card>

        {isPlus ? null : (
          <BigButton
            label="Unlock TalkEasy Plus"
            icon="star-four-points"
            minHeight={MIN_PARENT_TARGET}
            onPress={() => navigation.navigate('Plus')}
          />
        )}

        <SectionTitle title="What Free includes" emoji="format-list-checks" />
        <Card>
          {Object.entries(GATED_AREAS).map(([key, spec]) => (
            <Text key={key} style={[styles.allowance, { color: c.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              • {spec.label}: first {spec.freeCount} {spec.unit}
            </Text>
          ))}
          <Text style={[styles.warn, { color: c.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            Talk, Feelings, My Day, every adventure world, Parent Mode and lessons you add yourself are always free.
          </Text>
        </Card>

        <SectionTitle title="Manage" emoji="cog-outline" />
        <ListRow
          title="Restore purchases"
          subtitle="If you have subscribed before on this store account"
          icon="restore"
          onPress={busy ? undefined : onRestore}
        />
        <ListRow
          title="Manage subscription"
          subtitle="Opens your App Store or Google Play account"
          icon="open-in-new"
          onPress={() => {
            // The store's own subscription settings are the ONLY place a subscription can be
            // cancelled; an in-app "cancel" would be a lie, so it links out instead.
            Linking.openURL('https://support.apple.com/billing').catch(() =>
              alertMessage('Could not open', 'Manage subscriptions in your App Store or Google Play account settings.'),
            );
          }}
        />
        <SectionTitle title="Terms and privacy" emoji="shield-check-outline" />
        <Card>
          {/*
            No invented links here. TalkEasy has no website serving a terms page, and a row that
            opens nothing is worse than a row that is not there. What IS true is stated instead.
          */}
          <Text style={[styles.allowance, { color: c.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            Billing terms are your app store&apos;s. A subscription is charged, renewed and cancelled by Apple or
            Google — TalkEasy never sees or stores a card.
          </Text>
          <Text style={[styles.warn, { color: c.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            Subscribing changes nothing about your child&apos;s data: practice, recordings and progress stay on this
            device exactly as before. The full privacy summary is in Parent Mode → Settings → Privacy.
          </Text>
        </Card>

        {/* Development only — disappears by itself the moment a real provider is wired in. */}
        {subscription.canPurchase || !__DEV__ ? null : (
          <>
            <SectionTitle title="Development" emoji="hammer-wrench" />
            <Card>
              <Text style={[styles.warn, { color: c.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                App store billing is not connected ({subscription.name}). Switch plans here to check how the app looks
                on each. This block vanishes once a real provider is wired in.
              </Text>
              <View style={styles.devRow}>
                <BigButton
                  label="Use Free"
                  icon="account-child-outline"
                  variant="secondary"
                  minHeight={MIN_PARENT_TARGET}
                  onPress={() => toggleMock('free')}
                />
                <BigButton
                  label="Use Plus"
                  icon="star-four-points"
                  variant="secondary"
                  minHeight={MIN_PARENT_TARGET}
                  onPress={() => toggleMock('plus')}
                />
              </View>
            </Card>
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { padding: SPACING.lg, gap: SPACING.md, paddingBottom: SPACING.xl },
  label: { fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 0.8 },
  planRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginTop: 4 },
  plan: { fontFamily: Fonts.black, fontSize: 20 },
  warn: { fontFamily: Fonts.bold, fontSize: 13, lineHeight: 19, marginTop: SPACING.sm },
  allowance: { fontFamily: Fonts.bold, fontSize: 14, lineHeight: 22 },
  devRow: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.md },
});
