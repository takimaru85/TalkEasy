import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BigButton, Card, PressableScale } from '@/components/common';
import { MAX_FONT_SCALE, MIN_CHILD_TARGET, SPACING } from '@/constants/sizes';
import { useSizes } from '@/hooks/useSizes';
import { useI18n } from '@/i18n';
import { Fonts, useTheme } from '@/theme';
import { Adventure, AdventureRadius, type AdventureKey } from '@/theme/adventure';
import type { ArrangeExercise, VoiceLine } from '@/practice/types';

interface Props {
  exercise: ArrangeExercise;
  say: (line: VoiceLine) => void;
  accent: AdventureKey;
  onDone: () => void;
}

/**
 * Build the sentence by tapping its words.
 *
 * Word order made physical. A word tapped out of turn is simply not taken — it stays where it is
 * and the sentence so far is spoken again, so the child hears where they had got to. There is no
 * cross, no penalty and no way to end up stuck.
 *
 * The jumble is DETERMINISTIC (derived from the exercise id, not random), so a child who comes
 * back to this sentence tomorrow finds the words in the same places. A new arrangement every time
 * would make a familiar activity unfamiliar, which is the opposite of what repetition is for.
 */
export function ArrangeView({ exercise, say, accent, onDone }: Props) {
  const sizes = useSizes();
  const theme = useTheme();
  const { t } = useI18n();
  const night = !!theme.night;
  const c = Adventure[accent];
  const [placed, setPlaced] = useState<number[]>([]);

  // A fixed shuffle: same exercise, same layout, every time.
  const order = useMemo(() => {
    const seed = [...exercise.id].reduce((n, ch) => n + ch.charCodeAt(0), 0);
    return exercise.words
      .map((word, i) => ({ word, i, key: (seed * (i + 7) * 31) % 997 }))
      .sort((a, b) => a.key - b.key);
  }, [exercise.id, exercise.words]);

  const complete = placed.length === exercise.words.length;
  const sentenceSoFar = placed.map((i) => exercise.words[i]).join(' ');

  return (
    <>
      <Card>
        <View style={styles.body}>
          {exercise.picture ? <Text style={styles.picture} allowFontScaling={false}>{exercise.picture}</Text> : null}
          <Text
            style={[styles.prompt, { fontSize: sizes.body + 1, color: theme.colors.text }]}
            maxFontSizeMultiplier={MAX_FONT_SCALE}
          >
            {t(exercise.promptKey)}
          </Text>
          {/* The sentence as it stands. Blank slots show how much is still to come. */}
          <View style={styles.slots}>
            {exercise.words.map((_, i) => {
              const word = placed[i] !== undefined ? exercise.words[placed[i]] : null;
              return (
                <View
                  key={i}
                  style={[
                    styles.slot,
                    word
                      ? { backgroundColor: c.from, borderColor: c.to }
                      : { borderColor: theme.colors.borderSoft, borderStyle: 'dashed' },
                  ]}
                >
                  <Text
                    style={[styles.slotText, { color: word ? '#FFFFFF' : 'transparent' }]}
                    maxFontSizeMultiplier={MAX_FONT_SCALE}
                    numberOfLines={1}
                  >
                    {word ?? '—'}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </Card>

      {!complete ? (
        <>
          <Text style={[styles.hint, { color: night ? 'rgba(255,255,255,0.86)' : theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {t('vcTapWord')}
          </Text>
          <View style={styles.bank}>
            {order.map(({ word, i }) => {
              const used = placed.includes(i);
              if (used) return null;
              return (
                <PressableScale
                  key={i}
                  onPress={() => {
                    // Only the next word in the sentence is accepted; anything else replays what
                    // has been built so far rather than rejecting the child.
                    if (i === placed.length) {
                      const next = [...placed, i];
                      setPlaced(next);
                      if (next.length === exercise.words.length) {
                        say({ id: exercise.id, text: exercise.words.join(' ') });
                      }
                    } else if (sentenceSoFar) {
                      say({ id: `${exercise.id}-so-far`, text: sentenceSoFar });
                    }
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={word}
                >
                  <View style={[styles.word, { backgroundColor: night ? 'rgba(255,255,255,0.12)' : theme.colors.surface, borderColor: night ? 'rgba(255,255,255,0.22)' : theme.colors.borderSoft }]}>
                    <Text
                      style={[styles.wordText, { fontSize: sizes.body, color: night ? '#FFFFFF' : theme.colors.text }]}
                      maxFontSizeMultiplier={MAX_FONT_SCALE}
                      numberOfLines={1}
                    >
                      {word}
                    </Text>
                  </View>
                </PressableScale>
              );
            })}
          </View>
          {placed.length > 0 ? (
            <BigButton label={t('vcStartAgain')} icon="refresh" variant="secondary" minHeight={MIN_CHILD_TARGET} onPress={() => setPlaced([])} />
          ) : null}
        </>
      ) : (
        <>
          <Text style={[styles.done, { color: night ? '#FFFFFF' : theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            🎉 {t('vcSentenceDone')}
          </Text>
          <BigButton
            label={t('vcListenAgain')}
            icon="volume-high"
            variant="secondary"
            minHeight={MIN_CHILD_TARGET}
            onPress={() => say({ id: exercise.id, text: exercise.words.join(' ') })}
          />
          <BigButton label={t('vcNext')} icon="arrow-right" minHeight={MIN_CHILD_TARGET} onPress={onDone} />
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  body: { alignItems: 'center', gap: SPACING.md, paddingVertical: SPACING.sm },
  picture: { fontSize: 58 },
  prompt: { fontFamily: Fonts.black, textAlign: 'center', alignSelf: 'stretch' },
  slots: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: SPACING.xs },
  slot: {
    minWidth: 58, minHeight: 40,
    borderRadius: AdventureRadius.disc, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.sm,
  },
  slotText: { fontFamily: Fonts.black, fontSize: 15 },
  hint: { fontFamily: Fonts.bold, fontSize: 13, textAlign: 'center' },
  bank: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: SPACING.sm },
  word: {
    minHeight: MIN_CHILD_TARGET - 12, minWidth: 64,
    borderRadius: AdventureRadius.card, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.md,
  },
  wordText: { fontFamily: Fonts.black },
  done: { fontFamily: Fonts.black, fontSize: 20, textAlign: 'center' },
});
