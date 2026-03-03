import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  ScrollView,
  RefreshControl,
  StatusBar,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { readStats, AppStats } from "../lib/stats";
import type { ModeName } from "../App";

const { width } = Dimensions.get("window");
const H_PADDING = 18;

export default function ModeSelector() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(40)).current;

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

  // Greeting logic
  const greet = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12)
      return { text: "Good Morning", sub: "Breathe in calm energy", icon: "sun", color: "#ffffffff" };
    if (hour < 17)
      return { text: "Good Afternoon", sub: "Stay centered and focused", icon: "sun", color: "#FACC15" };
    return { text: "Good Evening", sub: "Unwind and find peace", icon: "moon", color: "#ffffffff" };
  }, []);

  const load = useCallback(async () => setStats(await readStats()), []);
  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
    Haptics.selectionAsync();
  }, [load]);

  const handleMode = (mode: ModeName) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    navigation.navigate("Breathe", { mode });
  };

  const openStats = () => {
    Haptics.selectionAsync();
    navigation.navigate("Stats");
  };

  // Mode Data
  const MODES: {
    name: ModeName;
    icon: keyof typeof Feather.glyphMap;
    desc: string;
    gradient: [string, string];
    accent: string;
    benefits: string[];
  }[] = [
    {
      name: "Calm",
      icon: "wind",
      desc: "Relax and ease your breath.",
      gradient: ["#4C1D95", "#7C3AED"],
      accent: "#9D7BFF",
      benefits: ["Reduce stress", "Find stillness", "Balance energy"],
    },
    {
      name: "Focus",
      icon: "target",
      desc: "Sharpen your clarity and concentration.",
      gradient: ["#065F46", "#10B981"],
      accent: "#4ADE80",
      benefits: ["Boost focus", "Work calmly", "Stay mindful"],
    },
    {
      name: "Sleep",
      icon: "moon",
      desc: "Slow down your rhythm, rest deeply.",
      gradient: ["#1E3A8A", "#2563EB"],
      accent: "#60A5FA",
      benefits: ["Relax fully", "Quiet mind", "Sleep better"],
    },
  ];

  return (
    <LinearGradient colors={["#070A1A", "#0B0E22", "#070A1A"]} style={styles.root}>
      {/* ✅ Fixed: gradient covers camera/safe area */}
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <SafeAreaView style={{ flex: 1, backgroundColor: "#070A1A" }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 140 }}
          refreshControl={
            <RefreshControl tintColor="#FFF" refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Greeting */}
          <Animated.View
            style={[styles.headerWrap, { opacity: fade, transform: [{ translateY: slide }] }]}
          >
            <View style={styles.headerCenter}>
              <Feather name={greet.icon as any} size={36} color={greet.color} />
              <Text style={[styles.greet, { color: greet.color }]}>{greet.text}</Text>
              <Text style={styles.subGreet}>{greet.sub}</Text>
            </View>
          </Animated.View>

          {/* Circle Stats */}
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

          {/* Mindful Reminder */}
          <BlurView intensity={35} tint="dark" style={styles.featureCard}>
            <Feather name="bell" size={22} color="#A78BFA" />
            <View>
              <Text style={styles.featureTitle}>Mindful Reminder</Text>
              <Text style={styles.featureText}>Take a calm moment today</Text>
            </View>
          </BlurView>

          {/* Hydration Tracker */}
          <BlurView intensity={35} tint="dark" style={styles.featureCard}>
            <Feather name="droplet" size={22} color="#3B82F6" />
            <View>
              <Text style={styles.featureTitle}>Hydration Tracker</Text>
              <Text style={styles.featureText}>Stay refreshed, drink water</Text>
            </View>
          </BlurView>

          {/* Mode Cards */}
          <Text style={styles.sectionTitle}>Breathing Modes</Text>
          <View style={{ paddingHorizontal: H_PADDING }}>
            {MODES.map((m) => (
              <LinearGradient
                key={m.name}
                colors={m.gradient as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.modeCard}
              >
                <View style={styles.modeHeader}>
                  <View style={styles.iconCircle}>
                    <Feather name={m.icon} size={22} color="#FFF" />
                  </View>
                  <Text style={styles.modeName}>{m.name}</Text>
                </View>

                <Text style={styles.desc}>{m.desc}</Text>

                <View style={styles.benefitsRow}>
                  {m.benefits.map((b, i) => (
                    <View key={i} style={styles.benefitChip}>
                      <Feather name="check" size={12} color="#FFF" />
                      <Text style={styles.benefitText}>{b}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  onPress={() => handleMode(m.name)}
                  activeOpacity={0.9}
                  style={styles.startButton}
                >
                  <LinearGradient
                    colors={[`${m.accent}`, `${m.accent}DD`]}
                    style={styles.startInner}
                  >
                    <Ionicons name="play" size={16} color="#FFF" />
                    <Text style={styles.startText}>Start</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>
            ))}
          </View>

          {/* Bottom Your Stats Section */}
          <View style={styles.bottomStatsSection}>
            <Text style={styles.bottomStatsTitle}>Your Stats</Text>
            <Text style={styles.bottomStatsSub}>See your detailed breathing progress</Text>

            <TouchableOpacity activeOpacity={0.85} onPress={openStats}>
              <BlurView intensity={35} tint="dark" style={styles.bottomStatsButton}>
                <Feather name="bar-chart-2" size={22} color="#A78BFA" />
                <Text style={styles.bottomStatsButtonText}>View Detailed Stats</Text>
              </BlurView>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerWrap: { marginBottom: 18, marginTop: 10 },
  headerCenter: { alignItems: "center" },
  greet: { fontSize: 22, fontFamily: "Poppins-Bold", marginTop: 8 },
  subGreet: {
    color: "rgba(229,231,235,0.8)",
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    marginTop: -2,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: H_PADDING,
    marginBottom: 22,
  },
  statCircle: {
    width: 95,
    height: 95,
    borderRadius: 48,
    borderWidth: 1.6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  statValue: { color: "#FFF", fontSize: 18, fontFamily: "Poppins-Bold", marginTop: 4 },
  statLabel: { color: "#9CA3AF", fontSize: 12, fontFamily: "Poppins-Regular" },

  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    padding: 16,
    marginHorizontal: H_PADDING,
    marginBottom: 16,
  },
  featureTitle: { color: "#FFF", fontFamily: "Poppins-SemiBold", fontSize: 15 },
  featureText: { color: "rgba(255,255,255,0.7)", fontFamily: "Poppins-Regular", fontSize: 12 },

  sectionTitle: {
    color: "#E5E7EB",
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    marginBottom: 10,
    marginLeft: H_PADDING,
  },
  modeCard: {
    borderRadius: 24,
    padding: 18,
    marginBottom: 20,
  },
  modeHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    marginRight: 10,
  },
  modeName: { color: "#FFF", fontSize: 20, fontFamily: "Poppins-SemiBold" },
  desc: { color: "#EDEDED", fontSize: 13, fontFamily: "Poppins-Regular", lineHeight: 18 },
  benefitsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  benefitChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  benefitText: { color: "#FFF", fontSize: 11, fontFamily: "Poppins-Regular" },
  startButton: { alignSelf: "flex-end", borderRadius: 30, overflow: "hidden", marginTop: 10 },
  startInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 30,
  },
  startText: { color: "#FFF", fontSize: 13, fontFamily: "Poppins-Medium" },

  bottomStatsSection: {
    alignItems: "center",
    marginTop: 20,
    marginHorizontal: H_PADDING,
  },
  bottomStatsTitle: {
    color: "#FFF",
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    marginBottom: 4,
  },
  bottomStatsSub: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    marginBottom: 12,
  },
  bottomStatsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 22,
  },
  bottomStatsButtonText: {
    color: "#7eb185ff",
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
  },
});
