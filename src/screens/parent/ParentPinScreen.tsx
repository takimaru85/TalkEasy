import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BigButton, PinPad, ScreenContainer, ScreenHeader } from '@/components/common';
import { Colors } from '@/constants/colors';
import { MAX_FONT_SCALE, SPACING } from '@/constants/sizes';
import { useSettings } from '@/context/SettingsContext';
import { useSizes } from '@/hooks';
import type { RootScreenProps } from '@/navigation/types';
import { BRAND } from '@/constants/brand';
import { Fonts } from '@/theme';

/** PIN gate in front of Parent Mode. Default PIN is 1234 — change it in Settings. */
export function ParentPinScreen({ navigation }: RootScreenProps<'ParentPin'>) {
  const sizes = useSizes();
  const { settings } = useSettings();
  const [error, setError] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const onComplete = (pin: string) => {
    if (pin === settings.parentPin) {
      setError(false);
      navigation.replace('Parent', { screen: 'Dashboard' });
    } else {
      setError(true);
      setResetKey((k) => k + 1);
    }
  };

  return (
    <ScreenContainer edges={['top', 'bottom', 'left', 'right']}>
      <ScreenHeader title="Parent Mode" onBack={() => navigation.goBack()} />
      <View style={styles.body}>
        <Text style={[styles.prompt, { fontSize: sizes.body + 2 }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          Enter the parent PIN
        </Text>
        <PinPad onComplete={onComplete} resetKey={resetKey} />
        <Text
          style={[styles.error, { fontSize: sizes.body, opacity: error ? 1 : 0 }]}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
          accessibilityLiveRegion="assertive"
        >
          Wrong PIN. Try again.
        </Text>
        <BigButton label="Cancel" variant="secondary" onPress={() => navigation.goBack()} />
        <Text style={[styles.credit, { fontSize: sizes.body - 4 }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {BRAND.appName} {BRAND.version} · {BRAND.tagline}
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, alignItems: 'center', paddingHorizontal: SPACING.xl, gap: SPACING.lg, paddingTop: SPACING.md },
  prompt: { fontFamily: Fonts.bold, color: Colors.text },
  error: { color: Colors.danger, fontWeight: '700' },
  credit: { color: Colors.textMuted, marginTop: 'auto', paddingBottom: SPACING.md },
});
