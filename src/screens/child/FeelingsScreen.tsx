import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BigButton, ChildScreen, EmptyState } from '@/components/common';
import { PhraseBanner, TileGrid } from '@/components/communication';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { useProfile } from '@/context/ProfileContext';
import { useCategoryByKey, useSizes, useSpeak, useVisibleButtons } from '@/hooks';
import type { RootScreenProps } from '@/navigation/types';
import { Fonts, useTheme } from '@/theme';
import type { CommunicationButton } from '@/types/models';

/** Gentle follow-ups after a feeling is shared — spoken, and offered as one big button. */
const FOLLOW_UP: Record<string, { say: string; offer: string; phrase: string }> = {
  sad: { say: "It's okay to feel sad.", offer: 'I want a hug', phrase: 'I want a hug.' },
  angry: { say: "It's okay. Let's take a deep breath.", offer: 'I need a break', phrase: 'I need a break.' },
  scared: { say: "You're safe. I'm here.", offer: 'Stay with me', phrase: 'Please stay with me.' },
  tired: { say: 'Rest sounds good.', offer: 'I want to rest', phrase: 'I want to rest.' },
  sick: { say: "Let's tell someone.", offer: 'I need help', phrase: 'I need help. I feel sick.' },
};

/**
 * Feelings: big faces first, then (for hard feelings) one calming follow-up phrase.
 * Same board component as Talk so the interaction is identical.
 */
export function FeelingsScreen(_props: RootScreenProps<'Feelings'>) {
  const sizes = useSizes();
  const theme = useTheme();
  const { displayName } = useProfile();
  const { data: category } = useCategoryByKey('feelings');
  const { data: buttons, loading } = useVisibleButtons(category?.id);
  const { lastPhrase, lastButtonId, speakButton, speakPhrase, speakFeedback, repeat } = useSpeak();

  const last = buttons.find((b) => b.id === lastButtonId);
  const follow = last ? FOLLOW_UP[last.label.toLowerCase()] : undefined;

  const onPress = async (b: CommunicationButton) => {
    await speakButton(b);
    const f = FOLLOW_UP[b.label.toLowerCase()];
    if (f) setTimeout(() => speakFeedback(f.say), 900);
  };

  return (
    <ChildScreen title="Feelings" emoji="😊">
      <PhraseBanner phrase={lastPhrase} onRepeat={repeat} placeholder={`How do you feel, ${displayName}?`} />
      {follow ? (
        <View style={[styles.follow, { marginHorizontal: sizes.horizontalPadding }]}>
          <Text style={[styles.followText, { fontSize: sizes.body, color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {follow.say}
          </Text>
          <BigButton label={follow.offer} icon="hand-heart" variant="secondary" minHeight={64} onPress={() => speakPhrase(follow.phrase)} />
        </View>
      ) : null}
      {!loading && category && buttons.length === 0 ? (
        <EmptyState icon="emoticon-happy" title="No feelings yet" message="A parent can add feelings in Parent Mode." />
      ) : (
        <TileGrid buttons={category ? buttons : []} selectedId={lastButtonId} onPress={onPress} />
      )}
    </ChildScreen>
  );
}

const styles = StyleSheet.create({
  follow: { gap: SPACING.sm, marginBottom: SPACING.sm },
  followText: { fontFamily: Fonts.bold, textAlign: 'center' },
});
