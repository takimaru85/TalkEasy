import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { MAX_FONT_SCALE, MIN_CHILD_TARGET, RADIUS, SPACING } from '@/constants/sizes';
import { useSizes } from '@/hooks/useSizes';
import { Icon } from '@/components/common/Icon';

interface Props {
  phrase: string | null;
  onRepeat: () => void;
  placeholder?: string;
}

/**
 * Fixed area at the top of every communication screen. Shows the last phrase in very large
 * text and a big "Say again" button. It never moves, so the child always knows where to look.
 */
export function PhraseBanner({ phrase, onRepeat, placeholder = 'Tap a button to talk' }: Props) {
  const sizes = useSizes();
  const hasPhrase = !!phrase;

  return (
    <View style={[styles.banner, hasPhrase ? styles.bannerActive : styles.bannerIdle]}>
      <Text
        style={[styles.phrase, { fontSize: hasPhrase ? sizes.phrase : sizes.body + 4 }, !hasPhrase && styles.placeholder]}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
        numberOfLines={3}
        adjustsFontSizeToFit
        accessibilityLiveRegion="polite"
        accessibilityRole="text"
      >
        {phrase ?? placeholder}
      </Text>

      <Pressable
        onPress={onRepeat}
        disabled={!hasPhrase}
        accessibilityRole="button"
        accessibilityLabel="Say it again"
        accessibilityState={{ disabled: !hasPhrase }}
        hitSlop={6}
        style={({ pressed }) => [styles.repeat, !hasPhrase && styles.repeatDisabled, pressed && styles.pressed]}
      >
        <Icon name="replay" size={34} color={hasPhrase ? Colors.textOnDark : '#777'} />
        <Text style={[styles.repeatLabel, !hasPhrase && styles.repeatLabelDisabled]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          Again
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    padding: SPACING.md,
    minHeight: 104,
    borderRadius: RADIUS.tile,
    borderWidth: 3,
  },
  bannerIdle: { backgroundColor: Colors.surface, borderColor: '#BDBDBD' },
  bannerActive: { backgroundColor: '#FFF7CC', borderColor: Colors.border },
  phrase: {
    flex: 1,
    fontWeight: '800',
    color: Colors.text,
  },
  placeholder: { color: Colors.textMuted, fontWeight: '600' },
  repeat: {
    width: MIN_CHILD_TARGET + 12,
    height: MIN_CHILD_TARGET + 12,
    borderRadius: RADIUS.button,
    backgroundColor: Colors.primary,
    borderWidth: 3,
    borderColor: Colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  repeatDisabled: { backgroundColor: '#DDDDDD', borderColor: '#BDBDBD' },
  repeatLabel: { color: Colors.textOnDark, fontWeight: '700', fontSize: 15 },
  repeatLabelDisabled: { color: '#777' },
  pressed: { opacity: 0.8 },
});
