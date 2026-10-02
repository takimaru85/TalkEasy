import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import { useTheme } from '@/theme';

/**
 * True when motion should be kept to a minimum.
 *
 * TWO SOURCES, either one is enough. TalkEasy has its own Parent Mode switch (`theme.reducedMotion`,
 * which `theme.duration()` already honours for every tap animation), and the phone has its own
 * system-wide setting. A family that turned motion off at the OS level would reasonably expect an
 * app to notice, so this listens to both — including the OS setting changing while the app is open.
 *
 * The theme's `duration()` does not read the OS setting, so decorative loops that want to respect it
 * ask this hook instead.
 */
export function useReducedMotion(): boolean {
  const theme = useTheme();
  const [system, setSystem] = useState(false);

  useEffect(() => {
    let live = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((on) => live && setSystem(on))
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (on) => setSystem(on));
    return () => {
      live = false;
      sub.remove();
    };
  }, []);

  return theme.reducedMotion || system;
}
