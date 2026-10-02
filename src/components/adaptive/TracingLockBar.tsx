import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Icon } from '@/components/common';
import { MAX_FONT_SCALE, MIN_CHILD_TARGET } from '@/constants/sizes';
import { useI18n } from '@/i18n';

/** The lock indicator and its unlock control, outside the white canvas so tapping it can never draw. */
export function TracingLockBar({ locked, onToggle }: { locked: boolean; onToggle: () => void }) {
  const { t } = useI18n();
  const label = locked ? t('tracingLocked') : t('tracingTapToLock');
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="button"
      accessibilityLabel={locked ? t('tracingUnlockA11y') : t('tracingLockA11y')}
      accessibilityState={{ selected: locked }}
      hitSlop={8}
      style={({ pressed }) => [styles.bar, locked ? styles.on : styles.off, pressed && { opacity: 0.8 }]}
    >
      <Icon name={locked ? 'lock' : 'lock-open-variant-outline'} size={20} color="#FFFFFF" />
      <Text style={styles.text} maxFontSizeMultiplier={MAX_FONT_SCALE}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: MIN_CHILD_TARGET, paddingHorizontal: 18, borderRadius: 999, borderWidth: 2 },
  on: { backgroundColor: 'rgba(52,168,83,0.85)', borderColor: '#BFF0CB' },
  off: { backgroundColor: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.35)' },
  text: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
});
