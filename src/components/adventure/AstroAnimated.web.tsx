import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, View } from 'react-native';
import { ASTRO_POSES, ASTRO_POSE_MS } from './astroPoses';

/** Web twin of `AstroAnimated.tsx`: the same nine poses and the same float, driven by React Native instead of a Lottie engine. */
export function AstroAnimated({ size }: { size: number }) {
  const safe = Number.isFinite(size) && size > 0 ? size : 1;
  const [pose, setPose] = useState(0);
  const bob = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setInterval(() => setPose((p) => (p + 1) % ASTRO_POSES.length), ASTRO_POSE_MS);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 1000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => {
      clearInterval(timer);
      loop.stop();
    };
  }, [bob]);

  const art = safe * 0.94;
  return (
    <View
      pointerEvents="none"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={[styles.plate, { width: safe, height: safe, borderRadius: safe / 2, borderWidth: Math.max(1.5, safe * 0.02) }]}
    >
      <Animated.View style={{ transform: [{ translateY: bob.interpolate({ inputRange: [0, 1], outputRange: [art * 0.02, -art * 0.02] }) }] }}>
        <Image source={ASTRO_POSES[pose]} resizeMode="contain" style={{ width: art, height: art }} accessibilityIgnoresInvertColors />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  plate: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: '#F1F5FF', borderColor: '#BFD0FF' },
});
