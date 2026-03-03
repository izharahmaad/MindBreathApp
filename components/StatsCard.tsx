import React, { memo, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";

type FeatherIcon = keyof typeof Feather.glyphMap;
type Gradient = [string, string, ...string[]];

interface StatsCardProps {
  label: string;
  value: string | number;
  icon?: FeatherIcon;
  gradient?: Gradient;
}

const DEFAULT_GRADIENT: Gradient = ["#1E1B4B", "#312E81"];

function StatsCard({
  label,
  value,
  icon = "activity",
  gradient = DEFAULT_GRADIENT,
}: StatsCardProps) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.05,
          duration: 2200,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 2200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulse]);

  return (
    <Animated.View style={[styles.outerWrap, { transform: [{ scale: pulse }] }]}>
      <LinearGradient
        colors={[...gradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.glowOverlay} />

        {/* Icon */}
        <LinearGradient
          colors={[
            "rgba(255,255,255,0.12)",
            "rgba(255,255,255,0.04)",
          ]}
          style={styles.iconContainer}
        >
          <Feather name={icon} size={28} color="#FFF" />
        </LinearGradient>

        {/* Texts */}
        <View style={styles.textContainer}>
          <Text style={styles.value}>{value}</Text>
          <Text style={styles.label}>{label}</Text>
        </View>

        {/* Shine effect */}
        <LinearGradient
          colors={["rgba(255,255,255,0.25)", "transparent"]}
          style={styles.shineEffect}
        />
      </LinearGradient>
    </Animated.View>
  );
}

export default memo(StatsCard);

const styles = StyleSheet.create({
  outerWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: "46%",
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 8 },
      },
      android: {
        elevation: 8,
      },
    }),
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  textContainer: {
    alignItems: "center",
  },
  value: {
    fontSize: 26,
    color: "#FFF",
    fontFamily: "Poppins-SemiBold",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  label: {
    fontSize: 13,
    color: "rgba(235,235,235,0.8)",
    fontFamily: "Poppins-Regular",
    letterSpacing: 0.3,
  },
  glowOverlay: {
    position: "absolute",
    top: -40,
    left: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.05)",
    zIndex: 0,
  },
  shineEffect: {
    position: "absolute",
    width: "120%",
    height: "120%",
    top: 0,
    left: -30,
    opacity: 0.25,
    transform: [{ rotate: "25deg" }],
  },
});
