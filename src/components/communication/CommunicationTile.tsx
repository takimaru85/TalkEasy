import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { MAX_FONT_SCALE, RADIUS, SPACING, TAP_GUARD_MS } from '@/constants/sizes';
import { useSizes } from '@/hooks/useSizes';
import { Icon } from '@/components/common/Icon';
import type { CommunicationButton } from '@/types/models';

interface Props {
  button: CommunicationButton;
  selected: boolean;
  onPress: (button: CommunicationButton) => void;
  /** Override width (grid passes the computed column width). */
  width?: number;
}

/**
 * The AAC button the child taps.
 *
 * - Icon above label, both large, on a light colored background with a dark border.
 * - Selected state: thick yellow border + brief scale-up.
 * - A second tap within TAP_GUARD_MS is ignored so a tremor does not double-speak.
 * - Tap only: no long-press, no gestures.
 */
export const CommunicationTile = React.memo(function CommunicationTile({ button, selected, onPress, width }: Props) {
  const sizes = useSizes();
  const scale = useRef(new Animated.Value(1)).current;
  const lastTap = useRef(0);

  const handlePress = () => {
    const now = Date.now();
    if (now - lastTap.current < TAP_GUARD_MS) return;
    lastTap.current = now;

    Animated.sequence([
      Animated.timing(scale, { toValue: 1.06, duration: 90, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 140, useNativeDriver: true }),
    ]).start();

    onPress(button);
  };

  return (
    <Animated.View style={{ transform: [{ scale }], width: width ?? sizes.tileWidth }}>
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={button.phrase}
        accessibilityHint="Says this phrase out loud"
        accessibilityState={{ selected }}
        hitSlop={4}
        style={({ pressed }) => [
          styles.tile,
          {
            height: sizes.tileHeight,
            backgroundColor: button.color,
            borderColor: selected ? Colors.selected : Colors.border,
            borderWidth: selected ? 6 : 3,
          },
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.inner}>
          <Icon name={button.icon} size={sizes.iconSize} color={Colors.text} />
          <Text
            style={[styles.label, { fontSize: sizes.tileLabel }]}
            maxFontSizeMultiplier={MAX_FONT_SCALE}
            numberOfLines={2}
            adjustsFontSizeToFit
          >
            {button.label}
          </Text>
        </View>
        {selected ? (
          <View style={styles.badge} accessibilityElementsHidden>
            <Icon name="volume-high" size={22} color={Colors.text} />
          </View>
        ) : null}
      </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  tile: {
    borderRadius: RADIUS.tile,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  pressed: { opacity: 0.8 },
  inner: { alignItems: 'center', justifyContent: 'center', gap: SPACING.xs },
  label: {
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.selected,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
