import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PressableScale } from '@/components/common/PressableScale';
import { Icon } from '@/components/common/Icon';
import { MAX_FONT_SCALE, MIN_CHILD_TARGET, SPACING } from '@/constants/sizes';
import { Fonts } from '@/theme';
import { Adventure, AdventureNight, AdventureRadius } from '@/theme/adventure';
import { fitFontSize } from '@/utils/fitText';
import { GameIcon, type GameIconName } from './GameIcon';

export interface NavItem {
  key: string;
  label: string;
  icon: string;
  /** Illustrated game icon; drawn instead of `icon` when given. */
  art?: GameIconName;
  onPress: () => void;
  active?: boolean;
}

interface Props {
  items: NavItem[];
  /** Available width, so labels can be fitted rather than truncated. */
  width: number;
}

/**
 * The flight deck: a glowing HUD bar of destinations along the bottom of the home screen.
 *
 * This is a BAR, not a tab navigator. The app is a stack where every child screen carries a Home
 * button top-left — a pattern the child has already learned and that `AGENTS.md` mandates —
 * so swapping in real tabs would restructure all 27 routes. These buttons simply navigate, which
 * gives the look without touching navigation logic.
 *
 * The active item is marked four ways — a glow plate, a full-strength icon, a bolder white label
 * and a small gold bar underneath — never by colour alone. Idle items rest dimmed.
 */
export function SpaceNav({ items, width }: Props) {
  const cell = (width - SPACING.sm * 2) / Math.max(1, items.length);
  const labelSize = items.reduce((min, i) => Math.min(min, fitFontSize(i.label, cell - 6, 12, 'line', 9)), 12);

  return (
    <View style={styles.bar} accessibilityRole="tablist">
      {items.map((item) => (
        <PressableScale
          key={item.key}
          onPress={item.onPress}
          accessibilityRole="tab"
          accessibilityState={{ selected: !!item.active }}
          accessibilityLabel={item.label}
          hitSlop={4}
          style={styles.cell}
        >
          <View style={styles.inner}>
            <View style={[styles.plate, item.active && styles.plateActive]}>
              {item.art ? (
                // Inactive icons rest slightly dimmed; the active one is full-strength and glows.
                <View style={item.active ? styles.artActive : styles.artIdle}>
                  <GameIcon name={item.art} size={item.active ? 32 : 28} />
                </View>
              ) : (
                <Icon name={item.icon} size={24} color={item.active ? Adventure.sun.from : AdventureNight.inkMuted} />
              )}
            </View>
            <Text
              style={[
                styles.label,
                { fontSize: labelSize, color: item.active ? '#FFFFFF' : AdventureNight.inkMuted },
                item.active && styles.labelActive,
              ]}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
              numberOfLines={2}
              textBreakStrategy="simple"
            >
              {item.label}
            </Text>
            <View style={[styles.indicator, item.active && styles.indicatorActive]} />
          </View>
        </PressableScale>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  artIdle: { opacity: 0.6 },
  artActive: { shadowColor: '#FFD166', shadowOpacity: 0.9, shadowRadius: 10, shadowOffset: { width: 0, height: 0 } },
  bar: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: '#101743',
    borderRadius: AdventureRadius.hero,
    borderWidth: 1.5,
    borderColor: 'rgba(130,160,255,0.35)',
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xs + 2,
    paddingHorizontal: SPACING.sm,
    shadowColor: '#4B6BE8',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  cell: { flexGrow: 1, flexBasis: 0 },
  inner: { alignItems: 'center', justifyContent: 'center', gap: 2, minHeight: MIN_CHILD_TARGET - 8 },
  plate: {
    width: 50,
    height: 38,
    borderRadius: AdventureRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plateActive: {
    backgroundColor: 'rgba(255,209,102,0.18)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,209,102,0.55)',
    shadowColor: '#FFD166',
    shadowOpacity: 0.6,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  label: { fontFamily: Fonts.bold, textAlign: 'center' },
  indicator: { width: 16, height: 3, borderRadius: 2, marginTop: 1 },
  indicatorActive: { backgroundColor: '#FFD166' },
  labelActive: { fontFamily: Fonts.black },
});
