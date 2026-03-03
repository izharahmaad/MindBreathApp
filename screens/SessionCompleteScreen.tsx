import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
  Share,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList, ModeName } from "../App";
import { saveSession, readStats, AppStats } from "../lib/stats";

type Props = NativeStackScreenProps<RootStackParamList, "SessionComplete">;

const MODE_META: Record<
  ModeName,
  { icon: keyof typeof Feather.glyphMap; accent: string; tip: string }
> = {
  Calm: {
    icon: "wind",
    accent: "#8B5CF6",
    tip: "Nice reset — take 3 slow breaths whenever stress rises.",
  },
  Focus: {
    icon: "target",
    accent: "#22C55E",
    tip: "Momentum built — try a 3-min focus block next time.",
  },
  Sleep: {
    icon: "moon",
    accent: "#3B82F6",
    tip: "Relaxed — repeat once more if your mind feels busy.",
  },
};

export default function SessionCompleteScreen({ navigation, route }: Props) {
  const { mode, minutes, elapsedMs } = route.params || {};
  const resolvedMode: ModeName | undefined =
    mode === "Calm" || mode === "Focus" || mode === "Sleep" ? mode : undefined;

  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.94)).current;
  const savedRef = useRef(false);

  const [stats, setStats] = useState<AppStats | null>(null);

  const resolvedMinutes =
    typeof minutes === "number" && minutes > 0
      ? Math.round(minutes)
      : typeof elapsedMs === "number" && elapsedMs > 0
      ? Math.max(1, Math.round(elapsedMs / 60000))
      : 1;

  // Entrance animation + haptics + save session + read stats
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6 }),
    ]).start();

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    (async () => {
      if (savedRef.current) return;
      if (resolvedMode) {
        try {
          await saveSession(resolvedMode, resolvedMinutes);
        } catch {}
      }
      savedRef.current = true;

      const s = await readStats();
      setStats(s);
    })();
  }, [fade, scale, resolvedMode, resolvedMinutes]);

  const meta = resolvedMode
    ? MODE_META[resolvedMode]
    : { icon: "check-circle" as const, accent: "#8B5CF6", tip: "" };

  const goHome = () => navigation.replace("Mode");
  const restart = () =>
    resolvedMode
      ? navigation.replace("Breathe", { mode: resolvedMode })
      : navigation.replace("Mode");
  const viewStats = () => navigation.navigate("Stats");

  const shareIt = async () => {
    try {
      await Share.share({
        message: `I just completed a ${resolvedMode ?? "MindBreath"} session • ${resolvedMinutes} min 🌬️`,
      });
      Haptics.selectionAsync();
    } catch {}
  };

  return (
    <LinearGradient
      colors={["#0B0C14", "#111827", "#0B0C14"]}
      style={styles.root}
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.wrap}>
        <Animated.View style={[styles.cardWrap, { opacity: fade, transform: [{ scale }] }]}>
          <BlurView intensity={35} tint="dark" style={styles.card}>
            {/* Badge */}
            <View
              style={[
                styles.badge,
                {
                  borderColor: `${meta.accent}40`,
                  backgroundColor: `${meta.accent}20`,
                },
              ]}
            >
              <Feather name={meta.icon} size={26} color={meta.accent} />
            </View>

            {/* Header text */}
            <Text style={styles.title}>Session Complete</Text>
            <Text style={styles.subtitle}>
              You finished a{" "}
              <Text style={[styles.accent, { color: meta.accent }]}>
                {resolvedMode ?? "breath"}
              </Text>{" "}
              session •{" "}
              <Text style={styles.accentLite}>{resolvedMinutes} min</Text>
            </Text>

            {/* Chips */}
            <View style={styles.chipsRow}>
              <View style={styles.chip}>
                <Feather name="check" size={12} color="#FFF" />
                <Text style={styles.chipText}>Well done</Text>
              </View>
              <View style={styles.chip}>
                <Feather name="clock" size={12} color="#FFF" />
                <Text style={styles.chipText}>{resolvedMinutes} min logged</Text>
              </View>
              {resolvedMode && (
                <View style={styles.chip}>
                  <Feather name={MODE_META[resolvedMode].icon} size={12} color="#FFF" />
                  <Text style={styles.chipText}>{resolvedMode}</Text>
                </View>
              )}
            </View>

            {/* Tip Box */}
            {resolvedMode ? (
              <View style={styles.tipBox}>
                <Feather name="info" size={14} color="#E5E7EB" />
                <Text style={styles.tipText}>{MODE_META[resolvedMode].tip}</Text>
              </View>
            ) : null}

            {/* Buttons */}
            <View style={styles.buttonsRow}>
              <TouchableOpacity
                style={[styles.btn, styles.primaryBtn, { borderColor: `${meta.accent}55` }]}
                onPress={restart}
                activeOpacity={0.9}
              >
                <Feather name="rotate-ccw" size={16} color="#FFF" />
                <Text style={styles.btnText}>Restart</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, styles.secondaryBtn]}
                onPress={viewStats}
                activeOpacity={0.9}
              >
                <Feather name="bar-chart-2" size={16} color="#FFF" />
                <Text style={styles.btnText}>View Stats</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, styles.ghostBtn]}
                onPress={goHome}
                activeOpacity={0.9}
              >
                <Feather name="home" size={16} color="#FFF" />
                <Text style={styles.btnText}>Home</Text>
              </TouchableOpacity>
            </View>

            {/* Insights Section */}
            <View style={styles.insightsCard}>
              <View style={styles.insightRow}>
                <Feather name="activity" size={14} color="#8B5CF6" />
                <Text style={styles.insightText}>
                  Total sessions improving by{" "}
                  <Text style={styles.bold}>+12%</Text> this week
                </Text>
              </View>

              <View style={styles.insightRow}>
                <Feather name="target" size={14} color="#22C55E" />
                <Text style={styles.insightText}>
                  Best streak:{" "}
                  <Text style={styles.bold}>{stats?.bestStreak ?? 0} days</Text>
                </Text>
              </View>

              <TouchableOpacity onPress={shareIt} activeOpacity={0.8} style={styles.shareRow}>
                <Feather name="share-2" size={14} color="#8B5CF6" />
                <Text style={styles.shareText}>Share your progress</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const P = 18;

const styles = StyleSheet.create({
  root: { flex: 1 },
  wrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: P },

  cardWrap: {
    width: "100%",
    maxWidth: 520,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  card: {
    paddingVertical: 26,
    paddingHorizontal: 20,
    alignItems: "center",
  },

  badge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.2,
    marginBottom: 10,
  },

  title: {
    color: "#FFF",
    fontSize: 22,
    fontFamily: "Poppins-SemiBold",
    textAlign: "center",
  },
  subtitle: {
    color: "rgba(229,231,235,0.9)",
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    textAlign: "center",
  },
  accent: { fontFamily: "Poppins-Medium" },
  accentLite: { color: "#E5E7EB", fontFamily: "Poppins-Medium" },

  chipsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  chipText: { color: "#FFF", fontSize: 11, fontFamily: "Poppins-Medium" },

  tipBox: {
    marginTop: 14,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  tipText: {
    color: "rgba(229,231,235,0.9)",
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    flex: 1,
  },

  buttonsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
  },
  primaryBtn: { backgroundColor: "rgba(255,255,255,0.15)" },
  secondaryBtn: { backgroundColor: "rgba(255,255,255,0.1)" },
  ghostBtn: { backgroundColor: "rgba(255,255,255,0.07)" },
  btnText: { color: "#FFF", fontSize: 13, fontFamily: "Poppins-Medium" },

  insightsCard: {
    width: "100%",
    marginTop: 18,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  insightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  insightText: {
    color: "#E5E7EB",
    fontFamily: "Poppins-Regular",
    fontSize: 12.5,
  },
  shareRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    gap: 6,
  },
  shareText: {
    color: "#8B5CF6",
    fontFamily: "Poppins-SemiBold",
    fontSize: 13,
  },
  bold: { fontFamily: "Poppins-SemiBold", color: "#FFF" },
});
