import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PressableScale } from '@/components/common';
import { MAX_FONT_SCALE, MIN_CHILD_TARGET, SPACING } from '@/constants/sizes';
import { useSizes } from '@/hooks/useSizes';
import { Fonts, useTheme } from '@/theme';
import { Adventure, AdventureRadius } from '@/theme/adventure';

interface Props {
  /** The sentence, split on spaces by the caller's own rule. */
  words: string[];
  /** Index of the word carrying the weight, or -1 for none. */
  focusWord: number;
  /** When set, each word is tappable — "which one sounded strongest?". */
  onPickWord?: (index: number) => void;
  /** A word the child has tapped, shown as their answer until the next exercise. */
  picked?: number;
  /** Reveal the focus word. Until then it is drawn plain, so the child has to LISTEN for it. */
  reveal?: boolean;
}

/**
 * A sentence where one word carries the weight.
 *
 * The focus word is marked THREE ways — bigger, bolder and on a filled plate — never by colour
 * alone. Prominence is the thing being taught, so the picture of it has to be unmissable for a
 * child who cannot yet hear it.
 *
 * When `reveal` is false the sentence is drawn plain: in the listening activities the child has to
 * find the strong word by ear, and showing it first would answer the question for them.
 */
export function FocusSentence({ words, focusWord, onPickWord, picked, reveal = true }: Props) {
  const sizes = useSizes();
  const theme = useTheme();
  const night = !!theme.night;
  const base = sizes.body + 2;

  return (
    <View style={styles.row}>
      {words.map((word, i) => {
        const strong = reveal && i === focusWord;
        const chosen = picked === i;
        const body = (
          <View
            style={[
              styles.word,
              strong && [styles.strong, { backgroundColor: Adventure.sun.from, borderColor: Adventure.sun.to }],
              chosen && !strong && [styles.picked, { borderColor: night ? '#FFFFFF' : theme.colors.border }],
              onPickWord ? { minHeight: MIN_CHILD_TARGET - 16 } : null,
            ]}
          >
            <Text
              style={[
                styles.text,
                {
                  fontSize: strong ? base + 8 : base,
                  fontFamily: strong ? Fonts.black : Fonts.bold,
                  color: strong ? Adventure.sun.ink : night ? '#FFFFFF' : theme.colors.text,
                },
              ]}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
              numberOfLines={1}
            >
              {word}
            </Text>
          </View>
        );

        if (!onPickWord) return <View key={`${word}-${i}`}>{body}</View>;
        return (
          <PressableScale
            key={`${word}-${i}`}
            onPress={() => onPickWord(i)}
            accessibilityRole="button"
            accessibilityLabel={word}
            hitSlop={4}
          >
            {body}
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  // Wraps, so a long sentence never runs off a narrow phone.
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: SPACING.xs },
  word: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: AdventureRadius.disc,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  strong: { borderWidth: 2.5, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  picked: { borderStyle: 'dashed' },
  text: { textAlign: 'center' },
});
