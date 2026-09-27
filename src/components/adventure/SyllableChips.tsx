import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PressableScale } from '@/components/common/PressableScale';
import { MAX_FONT_SCALE, MIN_CHILD_TARGET, SPACING } from '@/constants/sizes';
import { useSettings } from '@/context/SettingsContext';
import { soundPracticeAudio } from '@/services/soundPracticeAudio';
import { modelKey } from '@/speechpractice/pronunciation';
import type { SpeechItem } from '@/speechpractice/types';
import { Fonts } from '@/theme';
import { Adventure, AdventureRadius, shade, type AdventureKey } from '@/theme/adventure';
import { GradientSurface } from './GradientSurface';

/** BA BE BI BO BU — the first syllable row a child learns, one colour each. */
const ROW: { id: string; display: string; color: AdventureKey }[] = [
  { id: 'ba', display: 'BA', color: 'sky' },
  { id: 'be', display: 'BE', color: 'coral' },
  { id: 'bi', display: 'BI', color: 'sun' },
  { id: 'bo', display: 'BO', color: 'grass' },
  { id: 'bu', display: 'BU', color: 'grape' },
];

/**
 * The five syllables, tappable, right on the home screen.
 *
 * Tapping one SPEAKS it — and speaks it correctly. The engine is never handed the raw syllable
 * ("BI" would be read as the English word "bye"); it gets the pronunciation dictionary's spoken
 * form for the chosen set, which is the whole reason that dictionary exists. `strict` means a
 * syllable with no dictionary entry stays silent rather than being guessed at.
 *
 * This is the shortest path in the app from opening it to hearing a correct model — no screens
 * in between.
 */
export function SyllableChips() {
  const { settings } = useSettings();

  const say = (id: string) => {
    const item: SpeechItem = { id, text: id.toUpperCase(), modelKey: modelKey('syllable', id), strict: true };
    soundPracticeAudio.playItem(item, settings).catch(() => {});
  };

  return (
    <View style={styles.row}>
      {ROW.map((s) => {
        const c = Adventure[s.color];
        return (
          <PressableScale
            key={s.id}
            onPress={() => say(s.id)}
            accessibilityRole="button"
            accessibilityLabel={`Say ${s.display}`}
            hitSlop={4}
            style={styles.chipWrap}
          >
            {/* A white rim sets each pill apart from the card it sits on; the darker base underneath makes it
                a raised button. The press animation comes from PressableScale. */}
            <View style={[styles.chip, { shadowColor: shade(c.to, 0.55), borderBottomColor: shade(c.to, 0.68) }]}>
              <GradientSurface from={c.from} to={c.to} direction="vertical" />
              {/* A highlight that fades down the pill: a lit, glossy button, not a flat swatch. */}
              <View style={styles.chipShine} pointerEvents="none">
                <GradientSurface from="#FFFFFF" to="#FFFFFF" direction="vertical" fromOpacity={0.45} toOpacity={0} />
              </View>
              <Text style={styles.label} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1} allowFontScaling={false}>
                {s.display}
              </Text>
            </View>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  // One row, five EQUAL buttons: each takes the same share of the width (flex 1, basis 0), and one
  // fixed height, so no chip can grow or wrap onto a second line.
  row: { flexDirection: 'row', gap: SPACING.sm },
  chipWrap: { flex: 1, flexBasis: 0 },
  chip: {
    height: MIN_CHILD_TARGET - 4,
    borderRadius: AdventureRadius.pill,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
    borderBottomWidth: 4,
    shadowOpacity: 0.5,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  chipShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  label: { fontFamily: Fonts.black, color: '#FFFFFF', fontSize: 18, letterSpacing: 0.5, textShadowColor: 'rgba(0,0,0,0.35)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
});
