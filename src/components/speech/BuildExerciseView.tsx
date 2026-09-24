import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BigButton, Card, PressableScale, SectionTitle } from '@/components/common';
import { ChoiceCard, ChoiceGrid } from '@/components/adaptive/ChoiceCard';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { useSizes } from '@/hooks/useSizes';
import { useI18n } from '@/i18n';
import { composeSentence } from '@/speechpractice/engine';
import type { BuildExercise, SpeechItem } from '@/speechpractice/types';
import { Fonts, Radius, useTheme } from '@/theme';
import { ItemPicture } from './ItemPicture';
import { MicPanel } from './MicPanel';
import type { PracticeKit } from './kit';
import { useChoiceLayout } from './useChoiceLayout';

/**
 * Sentence Building: tap the starter (👦 ❤️ "I want"), then a picture (🍎), and hear the whole
 * sentence ("I want an apple."). Tap order is the sentence order — no dragging.
 */
export function BuildExerciseView({ exercise, kit }: { exercise: BuildExercise; kit: PracticeKit }) {
  const sizes = useSizes();
  const theme = useTheme();
  const { t } = useI18n();
  const [started, setStarted] = useState(false);
  const [word, setWord] = useState<SpeechItem | null>(null);
  const { frame } = exercise;
  const layout = useChoiceLayout(exercise.cards.length);
  const sentence = word ? composeSentence(frame, word) : null;

  const pick = (card: SpeechItem) => {
    setWord(card);
    const text = composeSentence(frame, card);
    kit.play([{ id: `sentence-${card.id}`, text }]);
    kit.attempt(text);
  };

  const reset = () => {
    setStarted(false);
    setWord(null);
    kit.recorder.discard();
  };

  return (
    <View style={styles.wrap}>
      {/* The sentence strip fills in as the child taps. */}
      <Card color={theme.colors.primarySoft}>
        <View style={styles.strip} accessible accessibilityLabel={sentence ?? (started ? `${frame.starter} …` : t('spTapStarter'))}>
          <View style={[styles.slot, { borderColor: theme.colors.border, backgroundColor: started ? theme.colors.surface : 'transparent' }]}>
            <Text style={styles.slotEmoji} allowFontScaling={false}>{started ? frame.pictures.join(' ') : '…'}</Text>
            <Text style={[styles.slotText, { fontSize: sizes.body + 2, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {started ? frame.starter : ' '}
            </Text>
          </View>
          <Text style={[styles.plus, { color: theme.colors.textMuted }]} allowFontScaling={false}>+</Text>
          <View style={[styles.slot, { borderColor: theme.colors.border, backgroundColor: word ? theme.colors.surface : 'transparent' }]}>
            {word ? <ItemPicture item={word} size={36} /> : <Text style={styles.slotEmoji} allowFontScaling={false}>…</Text>}
            <Text style={[styles.slotText, { fontSize: sizes.body + 2, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {word ? kit.label(word) : ' '}
            </Text>
          </View>
        </View>
        {sentence ? (
          <Text style={[styles.sentence, { fontSize: sizes.phrase - 4, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE} accessibilityLiveRegion="polite">
            {sentence}
          </Text>
        ) : null}
      </Card>

      {!started ? (
        <>
          <SectionTitle title={t('spTapStarter')} emoji="👆" />
          <PressableScale
            onPress={() => {
              setStarted(true);
              kit.play([{ id: `starter-${frame.id}`, text: frame.starter }]);
            }}
            accessibilityRole="button"
            accessibilityLabel={frame.starter}
          >
            <Card style={styles.starter}>
              <Text style={[styles.starterEmoji, { fontSize: sizes.iconSize }]} allowFontScaling={false}>{frame.pictures.join(' ')}</Text>
              <Text style={[styles.starterText, { fontSize: sizes.phrase - 4, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {frame.starter} …
              </Text>
            </Card>
          </PressableScale>
        </>
      ) : !word ? (
        <>
          <SectionTitle title={t('spChoosePicture')} emoji="🖼️" />
          <ChoiceGrid>
            {exercise.cards.map((card) => (
              <ChoiceCard
                key={card.id}
                label={kit.label(card)}
                emoji={card.imageUri ? undefined : card.picture}
                pictureMode={layout.pictureMode}
                width={layout.width}
                onPress={() => pick(card)}
              />
            ))}
          </ChoiceGrid>
        </>
      ) : (
        <>
          <BigButton label={t('spPlaySentence')} icon="play" variant="secondary" minHeight={80} onPress={() => kit.play([{ id: 'sentence', text: sentence! }])} />
          <SectionTitle title={t('soundYourTurn')} emoji="🎤" />
          <MicPanel
            recorder={kit.recorder}
            declined={kit.micDeclined}
            onDecline={kit.declineMic}
            praiseIndex={kit.praiseIndex}
            onAttempt={(ms) => {
              kit.nextPraise();
              kit.attempt(sentence!, ms);
            }}
          />
          <BigButton label={t('spStartOver')} icon="restart" variant="outline" minHeight={64} onPress={reset} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: SPACING.md },
  strip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm },
  slot: { flex: 1, minHeight: 96, borderWidth: 2, borderStyle: 'dashed', borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', padding: SPACING.sm, gap: 2 },
  slotEmoji: { fontSize: 30, lineHeight: 38 },
  slotText: { fontFamily: Fonts.extrabold, textAlign: 'center' },
  plus: { fontSize: 28, fontFamily: Fonts.black },
  sentence: { fontFamily: Fonts.black, textAlign: 'center', marginTop: SPACING.md },
  starter: { alignItems: 'center', gap: SPACING.sm, minHeight: 120, justifyContent: 'center' },
  starterEmoji: { lineHeight: 80 },
  starterText: { fontFamily: Fonts.black, textAlign: 'center' },
});
