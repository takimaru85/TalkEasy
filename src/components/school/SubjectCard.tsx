import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { MAX_FONT_SCALE, RADIUS, SPACING } from '@/constants/sizes';
import { useSizes } from '@/hooks/useSizes';
import type { Subject } from '@/types/models';
import { Icon } from '@/components/common/Icon';
import { Fonts } from '@/theme';

interface Props {
  subject: Subject;
  /** Second line, e.g. "10:00 – 11:00" or "2 assignments". */
  subtitle?: string;
  onPress?: () => void;
  highlighted?: boolean;
}

/** Large subject tile / row used on the School screens. */
export function SubjectCard({ subject, subtitle, onPress, highlighted }: Props) {
  const sizes = useSizes();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${subject.name}${subtitle ? `, ${subtitle}` : ''}`}
      hitSlop={4}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: subject.color, minHeight: Math.max(sizes.tileHeight * 0.6, 84) },
        highlighted && styles.highlighted,
        pressed && onPress && styles.pressed,
      ]}
    >
      <Icon name={subject.icon} size={sizes.iconSize} color={Colors.text} />
      <View style={styles.text}>
        <Text style={[styles.name, { fontSize: sizes.tileLabel + 2 }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2} adjustsFontSizeToFit>
          {subject.name}
        </Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { fontSize: sizes.body - 2 }]} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {onPress ? <Icon name="chevron-right" size={30} color={Colors.textMuted} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.tile,
    borderWidth: 3,
    borderColor: Colors.border,
  },
  highlighted: { borderColor: Colors.primaryDark, borderWidth: 5 },
  pressed: { opacity: 0.8 },
  text: { flex: 1, gap: 2 },
  name: { fontFamily: Fonts.extrabold, color: Colors.text },
  subtitle: { fontFamily: Fonts.bold, color: Colors.textMuted },
});
