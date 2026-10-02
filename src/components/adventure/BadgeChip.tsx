import React, { useId } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { Icon } from '@/components/common/Icon';
import { CHIP } from '@/adventure/progressLayout';
import { Adventure, type AdventureKey } from '@/theme/adventure';

/**
 * A small hexagonal badge, for the preview row on My Progress. Decorative: the row it sits in says
 * how many badges there are, and the Achievements screen names each one.
 */
export function BadgeChip({ icon, color }: { icon: string; color: AdventureKey }) {
  const id = `bc${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const c = Adventure[color];
  return (
    <View style={styles.chip} accessible={false} importantForAccessibility="no-hide-descendants">
      <Svg width={CHIP} height={CHIP} viewBox="0 0 64 64" pointerEvents="none">
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="0.35" y2="1">
            <Stop offset="0" stopColor={c.from} />
            <Stop offset="1" stopColor={c.to} />
          </LinearGradient>
        </Defs>
        <Path d="M32 4 L57 18 L57 46 L32 60 L7 46 L7 18 Z" fill={`url(#${id})`} stroke="#FFFFFF" strokeWidth={4} strokeLinejoin="round" />
      </Svg>
      <View style={styles.icon}>
        <Icon name={icon} size={Math.round(CHIP * 0.5)} color="#FFFFFF" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { width: CHIP, height: CHIP },
  icon: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, alignItems: 'center', justifyContent: 'center' },
});
