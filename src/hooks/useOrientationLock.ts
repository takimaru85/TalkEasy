import { useEffect } from 'react';
import { useWindowDimensions } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useSettings } from '@/context/SettingsContext';

/**
 * Applies the "Screen rotation" setting:
 *  - auto     → landscape allowed on tablets (shortest side ≥ 600pt), phones stay portrait
 *  - always   → rotation allowed everywhere
 *  - portrait → locked to portrait
 * Errors (e.g. simulator without orientation support) are ignored — the app still works.
 */
export function useOrientationLock(): void {
  const { settings, loaded } = useSettings();
  const { width, height } = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;

  useEffect(() => {
    if (!loaded) return;
    const allow = settings.rotation === 'always' || (settings.rotation === 'auto' && isTablet);
    const apply = allow ? ScreenOrientation.unlockAsync() : ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    apply.catch(() => {});
  }, [settings.rotation, isTablet, loaded]);
}
