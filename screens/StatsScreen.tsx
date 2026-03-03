import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
  RefreshControl,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather, Ionicons, MaterialCommunityIcons as MC } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { readStats, AppStats } from "../lib/stats";

const { width } = Dimensions.get("window");
const P = width < 380 ? 14 : 18;
type ModeName = "Calm" | "Focus" | "Sleep";

export default function StatsScreen() {
  const navigation = useNavigation<any>();
  const [stats, setStats] = useState<AppStats>({
    totalSessions: 0,
    totalMinutes: 0,
    streak: 0,
    bestStreak: 0,
    favoriteMode: null,
    last7Days: [0, 0, 0, 0, 0, 0, 0],
    perModeCounts: { Calm: 0, Focus: 0, Sleep: 0 },
    lastSessionISO: null,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [goal, setGoal] = useState(10);

  const loadStats = useCallback(async () => {
    setRefreshing(true);
    const s = await readStats();
    setStats(s);
    setRefreshing(false);
  }, []);

  const loadGoal = async () => {
    const stored = await AsyncStorage.getItem("dailyGoal");
    if (stored) setGoal(Number(stored));
  };

  useFocusEffect(
    useCallback(() => {
      loadStats();
      loadGoal();
    }, [loadStats])
  );

  const hour = new Date().getHours();
  const greet =
    hour < 12
      ? { text: "Good Morning", sub: "Start your day with calm energy" }
      : hour < 18
      ? { text: "Good Afternoon", sub: "Refocus and stay mindful" }
      : { text: "Good Evening", sub: "Unwind and breathe easy" };

  const weekLabels = ["S", "M", "T", "W", "T", "F", "S"];
  const totalLast7 = stats.last7Days.reduce((a, b) => a + b, 0);
  const max = Math.max(...stats.last7Days, 1);
  const goalProgress = Math.min(stats.totalMinutes / goal, 1);

  const totalMindfulMinutes = stats.totalMinutes;
  const dailyFocusScore = Math.min((stats.totalSessions / 5) * 100, 100);
  const moodStability = Math.min(
    (stats.last7Days.filter((v) => v > 0).length / 7) * 100,
    100
  );

  const navigateToMode = (mode: ModeName) => {
    Haptics.selectionAsync();
    navigation.navigate("Breathe", { mode });
  };

  return (
    <LinearGradient colors={["#070A1A", "#0B0E22", "#070A1A"]} style={styles.safe}>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={loadStats} tintColor="#8B5CF6" />
          }
        >
          {/* Greeting */}
          <View style={styles.headerCenter}>
            <Ionicons name="moon-outline" size={36} color="#A78BFA" />
            <Text style={styles.greetText}>{greet.text}</Text>
            <Text style={styles.greetSub}>{greet.sub}</Text>
          </View>

          {/* Core Stats */}
          <View style={styles.statsRow}>
            <View style={[styles.statCircle, { borderColor: "#8B5CF6" }]}>
              <Feather name="activity" size={22} color="#A78BFA" />
              <Text style={styles.statValue}>{stats.totalSessions}</Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>

            <View style={[styles.statCircle, { borderColor: "#10B981" }]}>
              <Feather name="clock" size={22} color="#34D399" />
              <Text style={styles.statValue}>{stats.totalMinutes}</Text>
              <Text style={styles.statLabel}>Minutes</Text>
            </View>

            <View style={[styles.statCircle, { borderColor: "#3B82F6" }]}>
              <Feather name="trending-up" size={22} color="#60A5FA" />
              <Text style={styles.statValue}>{stats.streak}</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
          </View>

          {/* Week Graph */}
          <BlurView intensity={35} tint="dark" style={styles.graphCard}>
            <Text style={styles.cardTitle}>Last 7 Days</Text>
            <View style={styles.graphWrap}>
              {stats.last7Days.map((v, i) => {
                const height = Math.max(10, (v / max) * 90);
                const color =
                  i % 2 === 0
                    ? "rgba(139,92,246,0.8)"
                    : "rgba(59,130,246,0.8)";
                return (
                  <View key={i} style={styles.barWrap}>
                    <View style={[styles.bar, { height, backgroundColor: color }]} />
                    <Text style={styles.barLabel}>{weekLabels[i]}</Text>
                  </View>
                );
              })}
            </View>
            <Text style={styles.goalText}>
              Total: <Text style={styles.bold}>{totalLast7}</Text> sessions this week
            </Text>
          </BlurView>

          {/* Mindful Minutes */}
          <BlurView intensity={35} tint="dark" style={styles.featureCard}>
            <Feather name="heart" size={22} color="#A78BFA" />
            <View>
              <Text style={styles.featureTitle}>Mindful Minutes</Text>
              <Text style={styles.featureText}>
                {totalMindfulMinutes} minutes of calm focus
              </Text>
            </View>
          </BlurView>

          {/* Focus Score */}
          <BlurView intensity={35} tint="dark" style={styles.featureCard}>
            <Feather name="target" size={22} color="#10B981" />
            <View>
              <Text style={styles.featureTitle}>Daily Focus Score</Text>
              <Text style={styles.featureText}>
                {dailyFocusScore.toFixed(0)}% consistency today
              </Text>
            </View>
          </BlurView>

          {/* Mood Stability */}
          <BlurView intensity={35} tint="dark" style={styles.featureCard}>
            <Feather name="smile" size={22} color="#3B82F6" />
            <View>
              <Text style={styles.featureTitle}>Mood Stability</Text>
              <Text style={styles.featureText}>
                {moodStability.toFixed(0)}% active days this week
              </Text>
            </View>
          </BlurView>

          {/* Daily Goal */}
          <BlurView intensity={35} tint="dark" style={styles.glassCard}>
            <Text style={styles.cardTitle}>Daily Goal</Text>
            <View style={styles.goalBar}>
              <LinearGradient
                colors={["#8B5CF6", "#6D28D9"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.goalFill, { width: `${goalProgress * 100}%` }]}
              />
            </View>
            <Text style={styles.goalText}>
              {stats.totalMinutes}/{goal} min today
            </Text>
          </BlurView>

          {/* Quick Start */}
          <Text style={styles.sectionHeading}>Quick Start</Text>
          <View style={styles.modeRow}>
            <Pressable
              onPress={() => navigateToMode("Calm")}
              style={({ pressed }) => [
                styles.circleButton,
                { borderColor: "#8B5CF6", opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Ionicons name="leaf-outline" size={26} color="#A78BFA" />
              <Text style={styles.circleText}>Calm</Text>
            </Pressable>

            <Pressable
              onPress={() => navigateToMode("Focus")}
              style={({ pressed }) => [
                styles.circleButton,
                { borderColor: "#10B981", opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Feather name="target" size={26} color="#34D399" />
              <Text style={styles.circleText}>Focus</Text>
            </Pressable>

            <Pressable
              onPress={() => navigateToMode("Sleep")}
              style={({ pressed }) => [
                styles.circleButton,
                { borderColor: "#3B82F6", opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <MC name="power-sleep" size={26} color="#60A5FA" />
              <Text style={styles.circleText}>Sleep</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scrollContainer: { paddingHorizontal: P, paddingBottom: 100 },

  headerCenter: { alignItems: "center", marginTop: 25, marginBottom: 30 },
  greetText: { fontFamily: "Poppins-Bold", fontSize: 24, color: "#FFF", marginTop: 8 },
  greetSub: { fontFamily: "Poppins-Regular", color: "rgba(255,255,255,0.7)", fontSize: 13 },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  statCircle: {
    width: 95,
    height: 95,
    borderRadius: 48,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  statValue: { fontFamily: "Poppins-Bold", color: "#FFF", fontSize: 18, marginTop: 4 },
  statLabel: { fontFamily: "Poppins-Regular", color: "rgba(255,255,255,0.7)", fontSize: 12 },

  graphCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 24,
    padding: 18,
    marginBottom: 24,
  },
  cardTitle: {
    fontFamily: "Poppins-SemiBold",
    color: "#FFF",
    fontSize: 14,
    marginBottom: 10,
  },
  graphWrap: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginVertical: 12,
  },
  barWrap: { alignItems: "center", flex: 1 },
  bar: { width: 12, borderRadius: 6 },
  barLabel: {
    fontFamily: "Poppins-Regular",
    color: "rgba(255,255,255,0.6)",
    fontSize: 10,
    marginTop: 4,
  },
  bold: { fontFamily: "Poppins-Bold", color: "#FFF" },

  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  featureTitle: { color: "#FFF", fontFamily: "Poppins-SemiBold", fontSize: 15 },
  featureText: { color: "rgba(255,255,255,0.7)", fontFamily: "Poppins-Regular", fontSize: 12 },

  glassCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 24,
    padding: 16,
    marginBottom: 24,
  },
  goalBar: { height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.1)", overflow: "hidden" },
  goalFill: { height: "100%", borderRadius: 4 },
  goalText: { fontFamily: "Poppins-Regular", color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 8 },

  sectionHeading: {
    color: "#FFF",
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    marginBottom: 12,
    marginTop: 10,
  },
  modeRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
  circleButton: {
    width: 95,
    height: 95,
    borderRadius: 48,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  circleText: { color: "#FFF", fontFamily: "Poppins-Medium", fontSize: 12, marginTop: 6 },
});
