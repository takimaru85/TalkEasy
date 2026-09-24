import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BigButton, Card, SectionTitle } from '@/components/common';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { useSizes } from '@/hooks/useSizes';
import { useI18n } from '@/i18n';
import type { SayExercise } from '@/speechpractice/types';
import { Fonts, useTheme } from '@/theme';
import { ItemPicture } from './ItemPicture';
import { MicPanel, PRAISE } from './MicPanel';
import type { PracticeKit } from './kit';

/**
 * Listen → Look → Try → Repeat. Used by Syllables, Words, Vocabulary, Word Repetition, Phrases,
 * Imitation, Social Communication, Role Play and Voice Practice.
 *
 * 'action' exercises (clap, wave, smile) need no speech at all: the child copies the movement
 * and taps "I did it!".
 */
export function SayExerciseView({ exercise, kit }: { exercise: SayExercise; kit: PracticeKit }) {
  const sizes = useSizes();
  const theme = useTheme();
  const { t } = useI18n();
  const [didIt, setDidIt] = useState(false);
  const { item, context, hint, mode } = exercise;
  const talk = kit.talkButtonFor(item);
  // Letters and syllables are the whole picture; words and phrases sit under their picture.
  const short = item.text.length <= 3;

  return (
    <View style={styles.wrap}>
      {context ? (
        <Card color={theme.colors.surfaceAlt} style={styles.context}>
          <Text style={styles.contextEmoji} allowFontScaling={false}>{context.picture}</Text>
          <Text style={[styles.contextText, { fontSize: sizes.body + 2, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {context.text}
          </Text>
        </Card>
      ) : null}

      <Card color={theme.colors.primarySoft} style={styles.itemCard}>
        {item.picture || item.imageUri ? <ItemPicture item={item} size={short ? sizes.iconSize : sizes.iconSize + 28} /> : null}
        <Text
          style={[styles.itemText, { fontSize: short ? sizes.heading + 44 : sizes.phrase, color: theme.colors.text }]}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
          accessibilityRole="header"
        >
          {kit.label(item)}
        </Text>
        {hint ? (
          <Text style={[styles.hint, { fontSize: sizes.body, color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {hint}
          </Text>
        ) : null}
      </Card>

      <SectionTitle title={t('soundListen')} emoji="🔊" />
      {kit.modelStatus(item) === 'missing' ? (
        // No recording of this syllable yet: say so, instead of letting a voice engine guess at it.
        <Card color={theme.colors.surfaceAlt}>
          <Text style={[styles.hint, { fontSize: sizes.body, color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE} accessibilityLiveRegion="polite">
            {t('spModelMissing')}
          </Text>
        </Card>
      ) : (
        // Unlimited replays of the same model — a recording sounds identical every time.
        <BigButton label={t('spListenAgain')} icon="volume-high" variant="secondary" minHeight={80} onPress={() => kit.play([item])} />
      )}

      <SectionTitle title={t('soundYourTurn')} emoji={mode === 'action' ? '✋' : '🎤'} />
      {mode === 'action' ? (
        didIt ? (
          <Card>
            <Text style={[styles.praise, { fontSize: sizes.phrase - 6, color: theme.colors.success }]} maxFontSizeMultiplier={MAX_FONT_SCALE} accessibilityLiveRegion="polite">
              ⭐ {t(PRAISE[kit.praiseIndex % PRAISE.length])}
            </Text>
            <BigButton label={t('actionTryAgain')} icon="replay" variant="outline" minHeight={68} onPress={() => { setDidIt(false); kit.play([item]); }} />
          </Card>
        ) : (
          <>
            <Text style={[styles.hint, { fontSize: sizes.body, color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {t('spWatchThenDo')}
            </Text>
            <BigButton
              label={t('spIDidIt')}
              icon="hand-okay"
              minHeight={88}
              onPress={() => {
                setDidIt(true);
                kit.nextPraise();
                kit.attempt(item.text);
                kit.speakUi(t(PRAISE[(kit.praiseIndex + 1) % PRAISE.length]));
              }}
            />
          </>
        )
      ) : (
        <MicPanel
          recorder={kit.recorder}
          declined={kit.micDeclined}
          onDecline={kit.declineMic}
          praiseIndex={kit.praiseIndex}
          onAttempt={(ms) => {
            kit.nextPraise();
            kit.attempt(item.text, ms);
          }}
        />
      )}

      {/* Practice → Communicate: if Talk has this word, say it the way Talk does. */}
      {talk ? (
        <BigButton
          label={`${t('spSayIt')}: ${talk.label}`}
          icon="message-text"
          variant="outline"
          minHeight={68}
          onPress={() => {
            kit.sayAsTalk(talk);
            kit.attempt(item.text);
          }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: SPACING.md },
  context: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  contextEmoji: { fontSize: 40, lineHeight: 50 },
  contextText: { flex: 1, fontFamily: Fonts.extrabold },
  itemCard: { alignItems: 'center', gap: SPACING.sm },
  itemText: { fontFamily: Fonts.black, textAlign: 'center' },
  hint: { fontFamily: Fonts.semibold, textAlign: 'center' },
  praise: { fontFamily: Fonts.black, textAlign: 'center', marginBottom: SPACING.md },
});
