import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { getAvatar, type AvatarId } from '@/shop/avatars';
import { AVATAR_SOURCES } from './avatarImages';

/**
 * An avatar, drawn from its OFFICIAL artwork. Every avatar sits on the SAME plate (a round, light, clean
 * background at the same inset) so the five read as one set at any size, from the Home mascot spot to a shop
 * card: the pictures have white backgrounds, and a plate gives them a deliberate edge instead of a white square
 * on a dark screen. `contain` keeps the character's proportions and centred position, never stretching or
 * cropping it.
 *
 * Decorative: hidden from screen readers (the name is on the control that holds it), takes no touches.
 */
export function AvatarArt({ id, size }: { id: AvatarId; size: number }) {
  const safe = Number.isFinite(size) && size > 0 ? size : 1;
  const file = getAvatar(id)?.image;
  const source = file ? AVATAR_SOURCES[file] : undefined;
  return (
    <View
      pointerEvents="none"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={[styles.plate, { width: safe, height: safe, borderRadius: safe / 2, borderWidth: Math.max(1.5, safe * 0.02) }]}
    >
      {source ? <Image source={source} resizeMode="contain" style={{ width: safe * 0.94, height: safe * 0.94 }} accessibilityIgnoresInvertColors /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  plate: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: '#F1F5FF', borderColor: '#BFD0FF' },
});
