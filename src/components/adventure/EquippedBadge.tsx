import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useShopEquipped } from '@/hooks';
import { getShopItem } from '@/shop/catalog';
import { ColorArt } from './ColorArt';

/**
 * The shop item the child chose to wear, as a small round badge. Renders NOTHING when nothing is
 * equipped, so a screen can place it unconditionally. One component, so an equipped item looks the same
 * on every page that shows it, and putting it on another page is one line.
 *
 * Decorative: hidden from the accessibility tree, not tappable. The wrapper carries elevation as well as
 * zIndex because Android draws by elevation before tree order (see AGENTS.md).
 */
export function EquippedBadge({ size = 28 }: { size?: number }) {
  const { data: equipped } = useShopEquipped();
  const id = equipped.badge;
  const item = id ? getShopItem(id) : undefined;
  if (!item || !item.art) return null;
  return (
    <View
      pointerEvents="none"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={[styles.disc, { width: size, height: size, borderRadius: size / 2 }]}
    >
      <ColorArt name={item.art} size={Math.round(size * 0.86)} />
    </View>
  );
}

const styles = StyleSheet.create({
  disc: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#FFC933', elevation: 6, zIndex: 6 },
});
