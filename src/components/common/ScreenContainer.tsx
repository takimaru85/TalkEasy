import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';

interface Props {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Which safe-area edges to pad. Tab screens omit 'bottom' because the tab bar handles it. */
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

export function ScreenContainer({ children, style, edges = ['top', 'left', 'right'] }: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      <View style={[styles.inner, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  inner: { flex: 1 },
});
