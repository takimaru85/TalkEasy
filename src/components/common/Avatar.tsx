import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { avatarId, normalizeAvatar } from '@/constants/avatars';
import { useTheme } from '@/theme';
import { AvatarArt } from './AvatarArt';

interface Props {
  /** The stored avatar (`av:<id>`; an old emoji value is mapped to its character). */
  avatar: string;
  photoUri?: string | null;
  size?: number;
  /** Ring colour; defaults to the accent. */
  ring?: string;
}

/** Round avatar: the child's photo if set, otherwise their illustrated character. */
export function Avatar({ avatar, photoUri, size = 72, ring }: Props) {
  const theme = useTheme();
  const radius = size / 2;
  const border = Math.max(3, size * 0.05);
  const id = avatarId(normalizeAvatar(avatar))!;
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
          borderWidth: border,
        },
      ]}
      accessibilityLabel="Profile picture"
    >
      {photoUri ? (
        <Image source={{ uri: photoUri }} style={{ width: size - 6, height: size - 6, borderRadius: radius }} accessibilityIgnoresInvertColors />
      ) : (
        <AvatarArt id={id} size={size - border * 2} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
});
