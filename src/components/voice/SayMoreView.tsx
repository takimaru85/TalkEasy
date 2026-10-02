import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card, PressableScale } from '@/components/common';
import { MAX_FONT_SCALE, MIN_CHILD_TARGET, SPACING } from '@/constants/sizes';
import { useSizes } from '@/hooks/useSizes';
import { useI18n } from '@/i18n';
import { Fonts, useTheme } from '@/theme';
import { Adventure, AdventureRadius, type AdventureKey } from '@/theme/adventure';
import type { SayMoreExercise, VoiceLine } from '@/practice/types';

interface Props {
  exercise: SayMoreExercise;
  say: (line: VoiceLine) => void;
  accent: AdventureKey;
  onPicked: () => void;
}

/**
 * Say what you see — one word, two words, or the whole sentence.
 *
 * Every rung is a right answer. The ladder exists so that one picture works for a child saying
 * single words AND for one building sentences: they take the rung they can manage today, hear it
 * said properly, and have a go if they want to.
 *
 * NOTHING RECORDS WHICH RUNG WAS CHOSEN. Storing that would turn a choice about what feels
 * possible today into a measurement of the child, and a parent looking at the history would read
 * "chose one word again" as a verdict. The app records that the picture was practised.
 *
 * The rungs are shown as a ladder — shortest at the bottom, longest at the top — because that is
 * the direction the language grows, and a child can see there is further to go without being told
 * they should be further along.
 */
export function SayMoreView({ exercise, say, accent, onPicked }: Props) {
  const sizes = useSizes();
  const theme = useTheme();
  const { t } = useI18n();
  const night = !!theme.night;
  const c = Adventure[accent];
  const [chosen, setChosen] = useState<string | null>(null);

  return (
    <>
      <Card>
        <View style={styles.body}>
          <Text style={styles.picture} allowFontScaling={false}>{exercise.picture}</Text>
          <Text
            style={[styles.prompt, { fontSize: sizes.body + 2, color: theme.colors.text }]}
            maxFontSizeMultiplier={MAX_FONT_SCALE}
          >
            {t(exercise.promptKey)}
          </Text>
        </View>
      </Card>

      <Text
        style={[styles.hint, { color: night ? 'rgba(255,255,255,0.86)' : theme.colors.textMuted }]}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        {t('vcPickARung')}
      </Text>

      {/* Longest at the top: the ladder reads upward, the way the sentence grows. */}
      <View style={styles.ladder}>
        {[...exercise.rungs].reverse().map((r, i) => {
          const step = exercise.rungs.length - i;
          const picked = chosen === r.id;
          return (
            <PressableScale
              key={r.id}
              onPress={() => {
                setChosen(r.id);
                say(r);
                onPicked();
              }}
              accessibilityRole="button"
              accessibilityLabel={r.text}
            >
              <View
                style={[
                  styles.rung,
                  {
                    backgroundColor: picked ? c.from : night ? 'rgba(255,255,255,0.1)' : theme.colors.surface,
                    borderColor: picked ? c.to : night ? 'rgba(255,255,255,0.2)' : theme.colors.borderSoft,
                    // A longer rung is a wider step, so the ladder is legible without reading it.
                    marginHorizontal: (exercise.rungs.length - step) * 6,
                  },
                ]}
              >
                <Text
                  style={[styles.rungText, { fontSize: sizes.body, color: picked ? '#FFFFFF' : night ? '#FFFFFF' : theme.colors.text }]}
                  maxFontSizeMultiplier={MAX_FONT_SCALE}
                  numberOfLines={2}
                >
                  {r.text}
                </Text>
              </View>
            </PressableScale>
          );
        })}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  body: { alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.sm },
  picture: { fontSize: 78 },
  prompt: { fontFamily: Fonts.black, textAlign: 'center', alignSelf: 'stretch' },
  hint: { fontFamily: Fonts.bold, fontSize: 13, textAlign: 'center' },
  ladder: { gap: SPACING.sm },
  rung: {
    minHeight: MIN_CHILD_TARGET - 8,
    borderRadius: AdventureRadius.card,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  rungText: { fontFamily: Fonts.black, textAlign: 'center', alignSelf: 'stretch' },
});
