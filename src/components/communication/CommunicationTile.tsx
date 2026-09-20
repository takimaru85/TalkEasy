import React, { useRef } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { MAX_FONT_SCALE, SPACING, TAP_GUARD_MS } from '@/constants/sizes';
import { useSizes } from '@/hooks/useSizes';
import { Fonts, Radius, useTheme } from '@/theme';
import { Motion } from '@/theme/tokens';
import { Icon } from '@/components/common/Icon';
import type { CommunicationButton } from '@/types/models';

interface Props {
  button: CommunicationButton;
  selected: boolean;
  onPress: (button: CommunicationButton) => void;
  /** Override width (grid passes the computed column width). */
  width?: number;
  /** Smaller variant for strips (Recent / Favorites on Home). */
  compact?: boolean;
}

/**
 * The AAC button the child taps.
 *
 * - White rounded card, category-tinted icon disc (or a real photo), bold label.
 * - Selected: accent ring + speaker badge, so selection is not shown by colour alone.
 * - A second tap within TAP_GUARD_MS is ignored so a tremor does not double-speak.
 * - Tap only: no long-press, no gestures.
 */
export const CommunicationTile = React.memo(function CommunicationTile({ button, selected, onPress, width, compact }: Props) {
  const sizes = useSizes();
  const theme = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const lastTap = useRef(0);

  const handlePress = () => {
    const now = Date.now();
    if (now - lastTap.current < TAP_GUARD_MS) return;
    lastTap.current = now;
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.95, duration: theme.duration(Motion.tap), useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: theme.duration(Motion.settle), useNativeDriver: true }),
    ]).start();
    onPress(button);
  };

  const height = compact ? Math.max(sizes.tileHeight * 0.72, 96) : sizes.tileHeight;
  const iconSize = compact ? sizes.iconSize - 12 : sizes.iconSize;
  const discSize = iconSize + (compact ? 18 : 28);
  const isStarter = button.phrase.trim().endsWith('...');

  return (
    <Animated.View style={{ transform: [{ scale }], width: width ?? sizes.tileWidth }}>
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={button.phrase}
        accessibilityHint="Says this out loud"
        accessibilityState={{ selected }}
        hitSlop={4}
        style={({ pressed }) => [
          styles.tile,
          theme.shadow,
          {
            height,
            backgroundColor: theme.colors.surface,
            borderColor: selected ? theme.colors.primary : theme.highContrast ? theme.colors.border : theme.colors.borderSoft,
            borderWidth: selected ? 4 : theme.highContrast ? theme.borderWidth : 1.5,
          },
          pressed && { backgroundColor: theme.tint(button.color) },
        ]}
      >
        <View style={[styles.disc, { width: discSize, height: discSize, borderRadius: discSize / 2, backgroundColor: theme.tint(button.color), borderColor: theme.highContrast ? theme.colors.border : 'transparent', borderWidth: theme.highContrast ? 2 : 0 }]}>
          {button.imageUri ? (
            <Image source={{ uri: button.imageUri }} style={{ width: discSize, height: discSize, borderRadius: discSize / 2 }} accessibilityIgnoresInvertColors />
          ) : (
            <Icon name={button.icon} size={iconSize} color={theme.colors.text} />
          )}
        </View>
        <Text
          style={[styles.label, { fontSize: compact ? sizes.tileLabel - 3 : sizes.tileLabel, color: theme.colors.text }]}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
          numberOfLines={2}
          adjustsFontSizeToFit
        >
          {button.label}
        </Text>
        {selected ? (
          <View style={[styles.badge, { backgroundColor: theme.colors.primary }]} accessibilityElementsHidden>
            <Icon name="volume-high" size={18} color="#FFFFFF" />
          </View>
        ) : null}
        {isStarter && !selected ? (
          <View style={[styles.badge, { backgroundColor: theme.tint(button.color), borderWidth: 1, borderColor: theme.colors.borderSoft }]} accessibilityElementsHidden>
            <Icon name="dots-horizontal" size={18} color={theme.colors.text} />
          </View>
        ) : null}
      </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  tile: {
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    gap: SPACING.xs,
  },
  disc: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  label: { fontFamily: Fonts.extrabold, textAlign: 'center' },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
