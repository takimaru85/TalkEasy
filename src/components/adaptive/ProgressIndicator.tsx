import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ProgressBar } from '@/components/common/ProgressBar';
import { GradientSurface } from '@/components/adventure/GradientSurface';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { Adventure, Fonts, useTheme } from '@/theme';

/**
 * ProgressIndicator — "question 1 of 4" for every question screen: a slim gold track and a
 * "1 / 4" pill on the same line. The bar includes the current question, so the first one already
 * shows a little progress. Quiet on purpose: it must never compete with the question.
 */
export function ProgressIndicator({ current, total }: { current: number; total: number }) {
  const theme = useTheme();
  const label = `${current} / ${total}`;
  if (!theme.night) return <ProgressBar value={(current - 1) / Math.max(1, total)} label={label} height={12} accessibilityLabel={`Question ${current} of ${total}`} />;
  const pct = Math.max(4, Math.round((current / Math.max(1, total)) * 100));
  return (
    <View style={styles.row} accessibilityRole="progressbar" accessibilityLabel={`Question ${current} of ${total}`} accessibilityValue={{ min: 0, max: total, now: current }}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%` }]}>
          <GradientSurface from={Adventure.sun.from} to={Adventure.sun.to} direction="vertical" />
        </View>
      </View>
      <View style={styles.pill}>
        <Text style={styles.pillText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {label}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  track: { flex: 1, height: 10, borderRadius: 5, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.14)' },
  fill: { height: '100%', borderRadius: 5, overflow: 'hidden' },
  pill: { minWidth: 56, alignItems: 'center', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, backgroundColor: '#FFFFFF' },
  pillText: { fontFamily: Fonts.black, fontSize: 14, color: '#27325F' },
});
