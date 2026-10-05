import React from "react";
import { View, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";

const COSMO_ANIMATION = require("../../../assets/talkeasy_cosmo_lottie/talkeasy_cosmo_avatar.json");

/**
 * NOT USED in v2.2.1. The Lottie references its nine poses as external files, which the app bundle does not
 * contain, so it cannot play on a device yet. Nothing imports this file, so neither it nor the animation is
 * shipped. Before using it, embed the poses in the JSON (base64) or switch to an image sequence.
 */
export default function CosmoAvatar() {
  return (
    <View style={styles.container}>
      <LottieView
        source={COSMO_ANIMATION}
        autoPlay
        loop
        speed={1}
        resizeMode="contain"
        style={styles.animation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 220,
    height: 220,
    alignItems: "center",
    justifyContent: "center",
  },
  animation: {
    width: 220,
    height: 220,
  },
});
