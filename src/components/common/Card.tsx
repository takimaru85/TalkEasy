import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Radius } from '@/theme/tokens';
import { useTheme } from '@/theme';
import { SPACING } from '@/constants/sizes';

interface Props {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Background tint (soft colour). Defaults to the surface colour. */
  color?: string;
  /** Emphasised border in the accent colour (e.g. "current" items). */
  highlighted?: boolean;
  padding?: number;
}

/** Rounded surface with soft depth. Every child-facing panel is a Card. */
export function Card({ children, style, color, highlighted, padding = SPACING.lg }: Props) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.card,
        theme.shadow,
        {
          backgroundColor: color ? theme.tint(color) : theme.colors.surface,
          borderColor: highlighted ? theme.colors.primaryDark : theme.highContrast ? theme.colors.border : theme.colors.borderSoft,
          borderWidth: highlighted ? 3 : theme.highContrast ? theme.borderWidth : 1,
          padding,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: Radius.lg },
});
