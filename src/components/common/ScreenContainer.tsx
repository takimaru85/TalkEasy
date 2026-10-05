import React from 'react';
import { StyleSheet, View, useWindowDimensions, type StyleProp, type ViewStyle } from 'react-native';
// From the file, not the adventure barrel (which imports back into components/common).
import { WorldBackground } from '@/components/adventure/WorldBackground';
import { MIN_SUPPORTED_WIDTH } from '@/constants/sizes';
import { useSettings } from '@/context/SettingsContext';
import { effectiveWorld } from '@/adventure/worlds';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AdventureNight, useIsAdventure, useTheme } from '@/theme';

interface Props {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Overrides the page colour — the night surface on the adventure screens. */
  background?: string;
  /** Which safe-area edges to pad. */
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

export function ScreenContainer({ children, style, background, edges = ['top', 'bottom', 'left', 'right'] }: Props) {
  const theme = useTheme();
  // A child screen sits on the adventure sky; Parent Mode keeps the neutral page colour.
  const adventure = useIsAdventure();
  const { width, height } = useWindowDimensions();
  // Floored before the scenery is drawn from it. useWindowDimensions reports 0 on the first frame
  // and while a screen is being pushed, and the sky is an <Svg> sized from these numbers — a zero
  // or negative size there is invalid and the whole background drops out (see MIN_SUPPORTED_WIDTH).
  const skyWidth = Math.max(MIN_SUPPORTED_WIDTH, width);
  const skyHeight = Math.max(MIN_SUPPORTED_WIDTH, height);
  const { settings } = useSettings();
  // Every child screen sits in the child's adventure world (Space unless one was chosen) (a screen that draws its own sky — the home
  // screen — passes `background` and gets no second one).
  const sky = adventure && theme.night && !background;
  const page = background ?? (sky ? AdventureNight.bottom : theme.colors.background);
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: page }]} edges={edges}>
      {/* The adventure world is dark, so its clock and battery must be light. The newest mounted bar wins and
          the previous one returns when the screen closes. */}
      <StatusBar style={adventure && theme.night ? 'light' : 'dark'} />
      {sky ? <WorldBackground world={effectiveWorld(settings.adventureTheme, settings.adventureWorld)} width={skyWidth} height={skyHeight} /> : null}
      <View style={[styles.inner, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  inner: { flex: 1 },
});
