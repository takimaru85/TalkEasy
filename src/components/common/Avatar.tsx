import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme';

interface Props {
  emoji: string;
  photoUri?: string | null;
  size?: number;
  /** Ring colour; defaults to the accent. */
  ring?: string;
}

/** Round avatar: the child's photo if set, otherwise their emoji on a soft accent disc. */
export function Avatar({ emoji, photoUri, size = 72, ring }: Props) {
  const theme = useTheme();
  const radius = size / 2;
  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: theme.tint(theme.colors.primarySoft),
          borderColor: ring ?? theme.colors.primary,
          borderWidth: Math.max(3, size * 0.05),
        },
      ]}
      accessibilityLabel="Profile picture"
    >
      {photoUri ? (
        <Image source={{ uri: photoUri }} style={{ width: size - 6, height: size - 6, borderRadius: radius }} accessibilityIgnoresInvertColors />
      ) : (
        <Text style={{ fontSize: size * 0.52, lineHeight: size * 0.7 }} allowFontScaling={false}>
          {emoji}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
});
