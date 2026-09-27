import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PressableScale } from '@/components/common/PressableScale';
import { Icon } from '@/components/common/Icon';
import { MAX_FONT_SCALE, MIN_CHILD_TARGET, SPACING } from '@/constants/sizes';
import { useSizes } from '@/hooks/useSizes';
import { Fonts, useTheme } from '@/theme';
import { Adventure, AdventureInk, AdventureInkMuted, AdventureNight, AdventureRadius, AdventureShadow, type AdventureKey } from '@/theme/adventure';
import { fitFontSize } from '@/utils/fitText';
import { GradientSurface } from './GradientSurface';

interface Props {
  title: string;
  subtitle: string;
  icon: string;
  color: AdventureKey;
  onPress: () => void;
  /** Shown as a small chip on the right, e.g. "3 / 8" or "NEW". */
  badge?: string;
  /** Available width in px, for fitting the title. */
  width: number;
  /** Glass styling for the night sky instead of a white card. */
  night?: boolean;
}

/**
 * One quest on the home screen: a big, unmistakable target with a gradient icon tile, a title and
 * a line saying what it is for.
 *
 * Every quest is told apart three ways — colour, icon and words — never by colour alone, because
 * this app is used by children who may not read yet and by children who do not see colour the
 * same way. The whole card is the touch target, comfortably past the 64pt child minimum.
 */
export function QuestCard({ title, subtitle, icon, color, onPress, badge, width, night }: Props) {
  const theme = useTheme();
  const sizes = useSizes();
  const c = Adventure[color];

  const disc = Math.max(MIN_CHILD_TARGET, sizes.iconSize + 14);
  // The title shares the row with the tile, the gap and the chevron.
  const textWidth = Math.max(80, width - disc - SPACING.lg * 2 - SPACING.md * 2 - 26);
  const titleSize = fitFontSize(title, textWidth, sizes.tileLabel + 3, 'word', 15);

  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${subtitle}${badge ? `. ${badge}` : ''}`}
      hitSlop={4}
    >
      <View
        style={[
          styles.card,
          theme.highContrast ? { borderWidth: theme.borderWidth, borderColor: theme.colors.border } : AdventureShadow,
          night
            ? { backgroundColor: AdventureNight.card, borderWidth: 1.5, borderColor: AdventureNight.border, paddingHorizontal: SPACING.lg }
            : { backgroundColor: theme.colors.surface, paddingHorizontal: SPACING.lg },
        ]}
      >
        <View style={[styles.disc, { width: disc, height: disc, borderRadius: AdventureRadius.disc }]}>
          <GradientSurface from={c.from} to={c.to} />
          <Icon name={icon} size={Math.round(disc * 0.52)} color="#FFFFFF" />
        </View>

        <View style={styles.text}>
          <Text
            style={[styles.title, { fontSize: titleSize, lineHeight: Math.round(titleSize * 1.2), color: night ? AdventureNight.ink : AdventureInk }]}
            maxFontSizeMultiplier={MAX_FONT_SCALE}
            numberOfLines={2}
            textBreakStrategy="simple"
          >
            {title}
          </Text>
          <Text
            style={[styles.subtitle, { color: night ? AdventureNight.inkMuted : AdventureInkMuted }]}
            maxFontSizeMultiplier={MAX_FONT_SCALE}
            numberOfLines={2}
          >
            {subtitle}
          </Text>
        </View>

        {badge ? (
          <View style={[styles.badge, { backgroundColor: c.tint }]}>
            <Text style={[styles.badgeText, { color: c.ink }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
              {badge}
            </Text>
          </View>
        ) : (
          <Icon name="chevron-right" size={26} color={night ? AdventureNight.inkMuted : AdventureInkMuted} />
        )}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    minHeight: 92,
    paddingVertical: SPACING.md,
    borderRadius: AdventureRadius.card,
  },
  disc: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  text: { flex: 1, gap: 2 },
  // alignSelf stretch keeps a long title inside the card instead of painting past its edge.
  title: { fontFamily: Fonts.black, alignSelf: 'stretch' },
  subtitle: { fontFamily: Fonts.semibold, fontSize: 14, lineHeight: 19, alignSelf: 'stretch' },
  badge: { paddingHorizontal: SPACING.md, paddingVertical: 6, borderRadius: AdventureRadius.pill, maxWidth: 92 },
  badgeText: { fontFamily: Fonts.extrabold, fontSize: 14 },
});
