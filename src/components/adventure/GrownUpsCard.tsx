import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/common/Icon';
import { PressableScale } from '@/components/common/PressableScale';
import { MAX_FONT_SCALE, MIN_CHILD_TARGET, SPACING } from '@/constants/sizes';
import { useSizes } from '@/hooks/useSizes';
import { Fonts, useTheme } from '@/theme';
import { AdventureRadius, AdventureShadow } from '@/theme/adventure';
import { ColorArt } from './ColorArt';
import { Mascot } from './Mascot';

interface Props {
  title: string;
  text: string;
  onPress: () => void;
}

/**
 * A quiet dark card at the bottom of a child screen pointing grown-ups to Parent Mode.
 *
 * It is a DOOR, not a duplicate: it opens the existing Parent PIN screen, so Parent Mode keeps its
 * own route and its own PIN, and a child who taps it meets the PIN like anywhere else. It is dark
 * and low-key on purpose — the coloured cards above are for the child, this one is for whoever is
 * sitting beside them.
 */
export function GrownUpsCard({ title, text, onPress }: Props) {
  const theme = useTheme();
  const sizes = useSizes();
  const plain = theme.highContrast;

  return (
    <PressableScale onPress={onPress} accessibilityRole="button" accessibilityLabel={`${title}. ${text}`} hitSlop={4}>
      <View
        style={[
          styles.card,
          plain
            ? { backgroundColor: theme.colors.surface, borderWidth: theme.borderWidth, borderColor: theme.colors.border }
            : [AdventureShadow, { backgroundColor: theme.colors.surface, borderWidth: 1.5, borderColor: 'rgba(126,150,255,0.35)' }],
        ]}
      >
        <Mascot size={Math.min(76, sizes.iconSize + 30)} mood="happy" space />
        <View style={styles.text}>
          <View style={styles.titleRow}>
            <ColorArt name="stat:bulb" size={26} />
            <Text style={[styles.title, { color: theme.colors.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
              {title}
            </Text>
          </View>
          <Text style={[styles.body, { color: theme.colors.textMuted }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={3}>
            {text}
          </Text>
        </View>
        <Icon name="chevron-right" size={26} color={theme.colors.textMuted} />
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    minHeight: MIN_CHILD_TARGET + 28,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: AdventureRadius.card,
  },
  text: { flex: 1, minWidth: 0, gap: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { fontFamily: Fonts.black, fontSize: 18, flexShrink: 1 },
  body: { fontFamily: Fonts.semibold, fontSize: 14, lineHeight: 19 },
});
