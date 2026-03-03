import React, { memo, useMemo } from "react";
import { Animated, Platform, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

type Anim = Animated.Value | Animated.AnimatedInterpolation<number>;

interface Props {
  scale: Anim;
  accent: string;
  size?: number;
}

const parseHex = (hex: string) => {
  let h = hex.trim().replace("#", "");
  if (h.length === 3) h = h.split("").map(c => c + c).join("");
  if (h.length !== 6) return { r: 127, g: 90, b: 240 };
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
};
const hexToRgba = (hex: string, a: number) => {
  const { r, g, b } = parseHex(hex);
  return `rgba(${r},${g},${b},${a})`;
};

function BreathingCircle({ scale, accent, size = 160 }: Props) {
  const S = Math.round(size);
  const S60 = S + 60;
  const S30 = S + 30;
  const S06 = S + 6;
  const S20 = S - 20;

  const layers = useMemo(
    () => ({
      outer: hexToRgba(accent, 0.12),
      middle: hexToRgba(accent, 0.18),
      inner: hexToRgba(accent, 0.25),
      coreA: accent,
      coreB: "rgba(255,255,255,0.15)",
      ring: hexToRgba(accent, 0.22),
      shadow: accent,
    }),
    [accent]
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrapper: {
          width: S,
          height: S,
          alignItems: "center",
          justifyContent: "center",
          ...(Platform.OS === "android"
            ? { renderToHardwareTextureAndroid: true as any }
            : { shouldRasterizeIOS: true as any }),
        },
        ring: {
          position: "absolute",
          width: S60,
          height: S60,
          borderRadius: S60 / 2,
          backgroundColor: layers.outer,
        },
        ringMid: {
          position: "absolute",
          width: S30,
          height: S30,
          borderRadius: S30 / 2,
          backgroundColor: layers.middle,
        },
        ringIn: {
          position: "absolute",
          width: S06,
          height: S06,
          borderRadius: S06 / 2,
          backgroundColor: layers.inner,
        },
        coreWrap: {
          width: S20,
          height: S20,
          borderRadius: S20 / 2,
          overflow: "hidden",
          borderWidth: Platform.OS === "android" ? 1 : StyleSheet.hairlineWidth,
          borderColor: layers.ring,
          shadowColor: layers.shadow,
          shadowOpacity: 0.35,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 0 },
          backfaceVisibility: "hidden",
        },
        coreFill: {
          ...StyleSheet.absoluteFillObject,
          borderRadius: S20 / 2,
        },
      }),
    [S, S60, S30, S06, S20, layers]
  );

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale }] }]}>
      <View style={styles.ring} />
      <View style={styles.ringMid} />
      <View style={styles.ringIn} />
      <View style={styles.coreWrap}>
        <LinearGradient
          colors={[layers.coreA, layers.coreB]}
          start={{ x: 0.2, y: 0.1 }}
          end={{ x: 0.85, y: 0.95 }}
          style={styles.coreFill}
        />
      </View>
    </Animated.View>
  );
}

export default memo(BreathingCircle);
