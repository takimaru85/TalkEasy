import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BigButton, Card, SectionTitle } from '@/components/common';
import { ChoiceCard, ChoiceGrid, type ChoiceState } from '@/components/adaptive/ChoiceCard';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { useSizes } from '@/hooks/useSizes';
import { useI18n } from '@/i18n';
import type { ChooseExercise, SpeechItem } from '@/speechpractice/types';
import { Fonts, useTheme } from '@/theme';
import { ItemPicture } from './ItemPicture';
import { MicPanel, PRAISE } from './MicPanel';
import type { PracticeKit } from './kit';
import { useChoiceLayout } from './useChoiceLayout';

/** After this many taps on something else, the right card gets a 💡 — never a red cross. */
const HINT_AFTER = 2;

/**
 * Hear or see a prompt, then tap a picture or word. Used by Listening, Sound Matching, Picture
 * Naming, WH Questions, Following Directions, Memory, rhymes and the questions after a story.
 *
 * Wrong taps are never marked wrong: the child hears the prompt again and, after a couple of
 * tries, the right answer is gently highlighted. No timer, no score, no red.
 */
export function ChooseExerciseView({ exercise, kit, onSolved }: { exercise: ChooseExercise; kit: PracticeKit; onSolved?: () => void }) {
  const sizes = useSizes();
  const theme = useTheme();
  const { t } = useI18n();
  const [phase, setPhase] = useState<'preview' | 'answer'>(exercise.preview?.length ? 'preview' : 'answer');
  const [found, setFound] = useState<string[]>([]);
  const [misses, setMisses] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  const solved = found.length === exercise.answerIds.length;
  const prompt = exercise.promptKey ? t(exercise.promptKey) : exercise.prompt ?? '';
  const pictureCards = exercise.display === 'picture';
  const layout = useChoiceLayout(exercise.choices.length);

  const again = () => (exercise.listen.length ? kit.play(exercise.listen) : kit.speakUi(prompt));

  const tap = (choice: SpeechItem) => {
    // Already found (Memory): a second tap is not a miss.
    if (solved || found.includes(choice.id)) return;
    kit.attempt(choice.text);
    const expected = exercise.ordered ? exercise.answerIds[found.length] : null;
    const right = expected ? choice.id === expected : exercise.answerIds.includes(choice.id) && !found.includes(choice.id);
    if (right) {
      const next = [...found, choice.id];
      setFound(next);
      if (next.length === exercise.answerIds.length) {
        kit.nextPraise();
        setMessage(`✅ ${t(PRAISE[(kit.praiseIndex + 1) % PRAISE.length])}`);
        // The child hears the word they picked — the model again, and the voice of the answer.
        kit.play([choice]);
        onSolved?.();
      } else {
        setMessage(t('spFoundSome', { found: next.length }));
        kit.play([choice]);
      }
      return;
    }
    setMisses((m) => m + 1);
    setMessage(exercise.listen.length ? t('spLetsListenAgain') : t('soundTryItAgain'));
    again();
  };

  const stateOf = (choice: SpeechItem): ChoiceState => {
    if (found.includes(choice.id)) return 'correct';
    if (!solved && misses >= HINT_AFTER) {
      const nextId = exercise.ordered ? exercise.answerIds[found.length] : null;
      if (nextId ? choice.id === nextId : exercise.answerIds.includes(choice.id)) return 'hint';
    }
    return 'idle';
  };

  if (phase === 'preview') {
    return (
      <View style={styles.wrap}>
        <SectionTitle title={t('spLookCarefully')} emoji="👀" />
        <Card color={theme.colors.primarySoft} style={styles.row}>
          {exercise.preview!.map((p) => (
            <View key={p.id} style={styles.previewItem} accessible accessibilityLabel={p.text}>
              <ItemPicture item={p} size={sizes.iconSize + 12} />
              <Text style={[styles.previewLabel, { fontSize: sizes.body, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {kit.label(p)}
              </Text>
            </View>
          ))}
        </Card>
        {/* No timer: the child (or grown-up) decides when the pictures hide. */}
        <BigButton label={t('spImReady')} icon="eye-off" minHeight={88} onPress={() => { setPhase('answer'); kit.speakUi(prompt); }} />
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={[styles.prompt, { fontSize: sizes.heading - 2, color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE} accessibilityRole="header">
        {prompt}
      </Text>
      {exercise.preview?.length && exercise.answerIds.length > 1 ? (
        <Text style={[styles.sub, { fontSize: sizes.body, color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {t('spFindThem', { count: exercise.answerIds.length })}
        </Text>
      ) : null}

      {exercise.show?.length ? (
        <Card color={theme.colors.primarySoft} style={styles.row}>
          {exercise.show.map((s) => (
            <View key={s.id} accessible accessibilityLabel={s.text || undefined}>
              <ItemPicture item={s} size={exercise.show!.length === 1 ? sizes.iconSize + 44 : sizes.iconSize + 12} />
            </View>
          ))}
        </Card>
      ) : null}

      {exercise.listen.length ? (
        <BigButton label={t('spListenAgain')} icon="volume-high" variant="secondary" minHeight={72} onPress={() => kit.play(exercise.listen)} />
      ) : null}

      <ChoiceGrid>
        {exercise.choices.map((choice) => (
          <ChoiceCard
            key={choice.id}
            label={kit.label(choice)}
            emoji={pictureCards && choice.picture && !choice.imageUri ? choice.picture : undefined}
            pictureMode={pictureCards && layout.pictureMode}
            state={stateOf(choice)}
            width={layout.width}
            onPress={() => tap(choice)}
            disabled={solved}
          />
        ))}
      </ChoiceGrid>

      {message ? (
        <Text
          style={[styles.message, { fontSize: sizes.body + 4, color: solved ? theme.colors.success : theme.colors.text }]}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
          accessibilityLiveRegion="polite"
        >
          {message}
        </Text>
      ) : null}

      {exercise.allowSay ? (
        <>
          <SectionTitle title={t('soundYourTurn')} emoji="🎤" />
          <BigButton
            label={t('spHearIt')}
            icon="volume-high"
            variant="outline"
            minHeight={64}
            onPress={() => kit.play(exercise.choices.filter((c) => exercise.answerIds.includes(c.id)))}
          />
          <MicPanel
            recorder={kit.recorder}
            declined={kit.micDeclined}
            onDecline={kit.declineMic}
            praiseIndex={kit.praiseIndex}
            onAttempt={(ms) => {
              kit.nextPraise();
              kit.attempt(exercise.choices.find((c) => exercise.answerIds.includes(c.id))?.text ?? '', ms);
            }}
          />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: SPACING.md },
  prompt: { fontFamily: Fonts.black, textAlign: 'center' },
  sub: { fontFamily: Fonts.semibold, textAlign: 'center' },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: SPACING.lg },
  previewItem: { alignItems: 'center', gap: SPACING.xs },
  previewLabel: { fontFamily: Fonts.extrabold },
  message: { fontFamily: Fonts.black, textAlign: 'center' },
});
