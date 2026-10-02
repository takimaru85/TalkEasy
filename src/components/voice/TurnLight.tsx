import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { useI18n } from '@/i18n';
import { Fonts, useTheme } from '@/theme';
import { AdventureRadius } from '@/theme/adventure';

export type TurnPhase = 'listen' | 'ready' | 'speak';

interface Props {
  phase: TurnPhase;
  size?: number;
  /**
   * The child's companion in the active adventure theme ("dinosaur", "puppy"). When given, GREEN
   * says "Your dinosaur's turn!" instead of "Your turn!" — the same skill, spoken in the world
   * the child chose. Nothing else about the exercise changes.
   */
  companion?: string;
}

const LAMPS: { phase: TurnPhase; on: string; off: string; labelKey: 'vcWait' | 'vcGetReady' | 'vcSpeak' }[] = [
  { phase: 'listen', on: '#FF5A4E', off: '#5A2A28', labelKey: 'vcWait' },
  { phase: 'ready', on: '#FFC94D', off: '#5A4A20', labelKey: 'vcGetReady' },
  { phase: 'speak', on: '#4BD97A', off: '#1F4A32', labelKey: 'vcSpeak' },
];

/**
 * A traffic light for whose turn it is: red listen, amber get ready, green your turn.
 *
 * Turn-taking is invisible — it lives in timing, and a child who is still learning it cannot see
 * what they are supposed to be noticing. A traffic light is the one piece of turn-taking machinery
 * most children already understand, which is why the whole activity hangs off it.
 *
 * The lit lamp is marked THREE ways — colour, size and a word — never by colour alone, so it
 * works for a colour-blind child and for one who cannot yet read.
 */
export function TurnLight({ phase, size = 34, companion }: Props) {
  const theme = useTheme();
  const { t } = useI18n();
  const current = LAMPS.find((l) => l.phase === phase);

  return (
    <View style={styles.wrap}>
      <View style={[styles.housing, { backgroundColor: theme.night ? '#101743' : '#2A2F42', borderColor: theme.night ? 'rgba(130,160,255,0.35)' : '#1A1F2E' }]}>
        {LAMPS.map((lamp) => {
          const lit = lamp.phase === phase;
          return (
            <View
              key={lamp.phase}
              style={[
                styles.lamp,
                {
                  width: lit ? size : size * 0.72,
                  height: lit ? size : size * 0.72,
                  borderRadius: size,
                  backgroundColor: lit ? lamp.on : lamp.off,
                  borderColor: lit ? '#FFFFFF' : 'transparent',
                },
              ]}
            />
          );
        })}
      </View>
      {current ? (
        <Text
          style={[styles.label, { color: current.on }]}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
          numberOfLines={1}
          accessibilityLiveRegion="polite"
        >
          {current.phase === 'speak' && companion ? t('vcThemedTurn', { thing: companion }) : t(current.labelKey)}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: SPACING.sm },
  housing: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: AdventureRadius.pill,
    borderWidth: 2,
    minHeight: 64,
  },
  lamp: { borderWidth: 3 },
  label: { fontFamily: Fonts.black, fontSize: 20, letterSpacing: 0.5 },
});
