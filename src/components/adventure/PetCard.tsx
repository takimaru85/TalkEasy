import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Icon, PressableScale } from '@/components/common';
import type { PetMood } from '@/adventure/pet';
import { MAX_FONT_SCALE, MIN_CHILD_TARGET, SPACING } from '@/constants/sizes';
import { Fonts, useTheme } from '@/theme';
import { fitFontSize } from '@/utils/fitText';
import { AdventureRadius } from '@/theme/adventure';
import { SpacePet } from './SpacePet';

interface Props {
  mood: PetMood;
  message: string;
  burst: number;
  equipped: string[];
  label: string;
  onPress: () => void;
}

/**
 * The Space Pet on Home: the pet and one friendly line, and a tap anywhere opens the dress-up
 * screen. Small on purpose (a row, not a panel) so Home is not crowded, and optional: nothing on it
 * asks the child to do anything.
 */
export function PetCard({ mood, message, burst, equipped, label, onPress }: Props) {
  const theme = useTheme();
  const plain = theme.highContrast;
  // The robot and the message share one row with the arrow. On a narrow phone the robot gives up some
  // room and the message is sized so its longest word never breaks mid-word ("explorin / g!").
  const [width, setWidth] = useState(0);
  const petSize = width > 0 ? Math.round(Math.min(92, Math.max(64, width * 0.3))) : 92;
  const textWidth = width - SPACING.md * 2 - SPACING.sm * 2 - petSize - 26;
  const messageSize = fitFontSize(message, textWidth, 17, 'word', 12);
  return (
    <PressableScale onPress={onPress} accessibilityRole="button" accessibilityLabel={`${label}. ${message}`} hitSlop={4}>
      <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={[styles.row, { backgroundColor: plain ? theme.colors.surface : 'rgba(14,10,60,0.72)', borderColor: plain ? theme.colors.border : 'rgba(255,255,255,0.28)' }]}>
        <SpacePet size={petSize} mood={mood} equipped={equipped} burst={burst} />
        <View style={styles.bubble}>
          <Text style={[styles.message, { fontSize: messageSize, color: plain ? theme.colors.text : '#FFFFFF' }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {message}
          </Text>
          <Text style={[styles.cta, { color: plain ? theme.colors.textMuted : 'rgba(255,255,255,0.8)' }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {label}
          </Text>
        </View>
        <Icon name="chevron-right" size={26} color={plain ? theme.colors.textMuted : '#FFFFFF'} />
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, minHeight: MIN_CHILD_TARGET + 24, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: AdventureRadius.card, borderWidth: 2 },
  bubble: { flex: 1, minWidth: 0, gap: 2 },
  message: { fontFamily: Fonts.black, fontSize: 17 },
  cta: { fontFamily: Fonts.bold, fontSize: 14 },
});
