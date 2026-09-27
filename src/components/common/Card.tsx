import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Radius } from '@/theme/tokens';
import { AdventureRadius, AdventureShadow, shade, useIsAdventure, useTheme } from '@/theme';
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

/**
 * Rounded surface with soft depth. Every child-facing panel is a Card.
 *
 * On the night sky it is a solid game panel: a lighter rim and a darker base underneath, like the
 * home screen's cards; a highlighted card gets the gold rim used for "selected" everywhere there.
 */
export function Card({ children, style, color, highlighted, padding = SPACING.lg }: Props) {
  const theme = useTheme();
  const adventure = useIsAdventure();
  const bg = color ? theme.tint(color) : theme.colors.surface;
  return (
    <View
      style={[
        styles.card,
        adventure && !theme.highContrast ? AdventureShadow : theme.shadow,
        adventure ? { borderRadius: AdventureRadius.card } : null,
        {
          backgroundColor: bg,
          borderColor: highlighted ? theme.colors.primaryDark : theme.highContrast ? theme.colors.border : theme.colors.borderSoft,
          borderWidth: highlighted ? 3 : theme.highContrast ? theme.borderWidth : 1,
          padding,
        },
        theme.night && {
          borderColor: highlighted ? theme.colors.selected : shade(bg, 1.45),
          borderWidth: highlighted ? 3 : 1.5,
          borderBottomColor: highlighted ? theme.colors.selected : shade(bg, 0.62),
          borderBottomWidth: highlighted ? 5 : 4.5,
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
