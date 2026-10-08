import React from 'react';
import { StyleSheet, View } from 'react-native';
import LottieView from 'lottie-react-native';

const ANIMATION = require('../../../assets/astro-animation/astro-explorer.lottie.json');

/**
 * Astro Explorer, moving: a Lottie that cycles the nine supplied poses (wave, jump, thumbs up...) while the
 * character floats gently. The poses are EMBEDDED in the JSON (base64), so nothing is fetched and nothing is
 * missing from the bundle. Same round plate as `AvatarArt`. The web build uses `AstroAnimated.web.tsx` instead,
 * because lottie-react-native's web player downloads its engine from a CDN and TalkEasy opens no sockets.
 * Decorative: hidden from screen readers.
 */
export function AstroAnimated({ size }: { size: number }) {
  const safe = Number.isFinite(size) && size > 0 ? size : 1;
  return (
    <View
      pointerEvents="none"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={[styles.plate, { width: safe, height: safe, borderRadius: safe / 2, borderWidth: Math.max(1.5, safe * 0.02) }]}
    >
      <LottieView source={ANIMATION} autoPlay loop resizeMode="contain" style={{ width: safe * 0.94, height: safe * 0.94 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  plate: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: '#F1F5FF', borderColor: '#BFD0FF' },
});
