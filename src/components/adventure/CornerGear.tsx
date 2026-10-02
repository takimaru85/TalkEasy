import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon } from '@/components/common/Icon';
import { PressableScale } from '@/components/common/PressableScale';
import { MIN_CHILD_TARGET, SPACING } from '@/constants/sizes';

/**
 * A round settings button for the top-right corner of a blue banner (My Progress, Speech Practice).
 *
 * It only reports the tap: the SCREEN decides where it goes, and everywhere it is used that is
 * Parent Mode, behind the PIN, exactly as the Parent tab on Home. 46pt drawn, 64pt to touch (the
 * child minimum) once the hit slop is counted.
 *
 * Place it LAST in the banner so it paints above the banner's gradient and decoration on web.
 */
export function CornerGear({ onPress, label }: { onPress: () => void; label: string }) {
  return (
    <View style={styles.slot}>
      <PressableScale onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={9}>
        <View style={styles.gear}>
          <Icon name="cog" size={22} color="#FFFFFF" />
        </View>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  slot: { position: 'absolute', top: SPACING.sm, right: SPACING.sm },
  gear: {
    width: MIN_CHILD_TARGET - 18,
    height: MIN_CHILD_TARGET - 18,
    borderRadius: 999,
    backgroundColor: 'rgba(24,44,140,0.62)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
