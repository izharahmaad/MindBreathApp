import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  StatusBar,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Audio } from "expo-av";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import BreathingCircle from "../components/BreathingCircle";

type Props = NativeStackScreenProps<RootStackParamList, "Breathe">;
type Phase = "inhale" | "hold" | "exhale";
type Step = { phase: Phase; duration: number };

const MODE_META = {
  Calm: {
    sequence: [
      { phase: "inhale", duration: 4000 },
      { phase: "exhale", duration: 4000 },
    ] as Step[],
    gradient: ["#0F172A", "#1E1B4B", "#111827"],
    accent: "#8B5CF6",
    icon: { name: "wind" as const },
    sound: require("../assets/sounds/calm.mp3"),
    targetCycles: 4,
  },
  Focus: {
    sequence: [
      { phase: "inhale", duration: 4000 },
      { phase: "hold", duration: 4000 },
      { phase: "exhale", duration: 4000 },
      { phase: "hold", duration: 4000 },
    ] as Step[],
    gradient: ["#0B132B", "#1E293B", "#0B132B"],
    accent: "#22C55E",
    icon: { name: "target" as const },
    sound: require("../assets/sounds/focus.mp3"),
    targetCycles: 3,
  },
  Sleep: {
    sequence: [
      { phase: "inhale", duration: 4000 },
      { phase: "hold", duration: 7000 },
      { phase: "exhale", duration: 8000 },
    ] as Step[],
    gradient: ["#0B1020", "#0A0F1E", "#090E1A"],
    accent: "#3B82F6",
    icon: { name: "moon" as const },
    sound: require("../assets/sounds/sleep.mp3"),
    targetCycles: 3,
  },
} as const;

export default function BreatheScreen({ navigation, route }: Props) {
  const { mode } = route.params;
  const meta = MODE_META[mode as keyof typeof MODE_META];

  const [running, setRunning] = useState(false);
  const [cycleIndex, setCycleIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [muted, setMuted] = useState(false);

  const soundRef = useRef<Audio.Sound | null>(null);
  const scale = useRef(new Animated.Value(1)).current;
  const targetScaleRef = useRef(1);
  const cancelRef = useRef(false);
  const startRef = useRef<number | null>(null);

  const currentStep: Step | null = running ? meta.sequence[stepIndex] : null;

  const labelFor = useCallback((p?: Phase) => {
    switch (p) {
      case "inhale": return "Inhale";
      case "hold": return "Hold";
      case "exhale": return "Exhale";
      default: return "Ready to Begin";
    }
  }, []);

  const helperFor = useCallback((p?: Phase) => {
    switch (p) {
      case "inhale": return "Breathe in slowly through your nose";
      case "hold": return "Hold gently — stay relaxed";
      case "exhale": return "Exhale softly through your mouth";
      default: return "Find a comfortable position";
    }
  }, []);

  // --- Audio setup ---
  const setupAudio = useCallback(async () => {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
    });
    const { sound } = await Audio.Sound.createAsync(meta.sound, {
      shouldPlay: true,
      isLooping: true,
      volume: muted ? 0 : 0.4,
    });
    soundRef.current = sound;
  }, [meta.sound, muted]);

  const unloadAudio = useCallback(async () => {
    try {
      await soundRef.current?.stopAsync();
      await soundRef.current?.unloadAsync();
    } catch {}
    soundRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      unloadAudio();
    };
  }, [unloadAudio]);

  const delay = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));

  const animateForPhase = useCallback(
    (phase: Phase, duration: number) => {
      const toValue =
        phase === "inhale" ? 1.45 :
        phase === "exhale" ? 1.0 :
        targetScaleRef.current;
      targetScaleRef.current = toValue;
      Animated.timing(scale, {
        toValue,
        duration,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start();
    },
    [scale]
  );

  const hapticForPhase = (p: Phase) => {
    const style =
      p === "hold" ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Soft;
    Haptics.impactAsync(style);
  };

  const run = useCallback(async () => {
    cancelRef.current = false;
    setCycleIndex(0);
    setStepIndex(0);
    for (let c = 0; c < meta.targetCycles; c++) {
      if (cancelRef.current) break;
      for (let s = 0; s < meta.sequence.length; s++) {
        if (cancelRef.current) break;
        const { phase, duration } = meta.sequence[s];
        setStepIndex(s);
        hapticForPhase(phase);
        animateForPhase(phase, duration);
        await delay(duration);
      }
      if (cancelRef.current) break;
      setCycleIndex((n) => n + 1);
    }
    if (!cancelRef.current) {
      setRunning(false);
      setStepIndex(0);
      await unloadAudio();
      const elapsedMs = startRef.current ? Date.now() - startRef.current : 0;
      navigation.replace("SessionComplete", { mode, elapsedMs });
    }
  }, [meta, animateForPhase, navigation, mode, unloadAudio]);

  const start = useCallback(async () => {
    if (running) return;
    setRunning(true);
    setCycleIndex(0);
    setStepIndex(0);
    startRef.current = Date.now();
    await setupAudio();
    run();
  }, [running, setupAudio, run]);

  const stop = useCallback(async () => {
    cancelRef.current = true;
    setRunning(false);
    await unloadAudio();
    targetScaleRef.current = 1;
    Animated.timing(scale, {
      toValue: 1,
      duration: 240,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [unloadAudio, scale]);

  const toggle = useCallback(() => {
    if (running) stop();
    else start();
  }, [running, start, stop]);

  useEffect(() => {
    if (soundRef.current) soundRef.current.setStatusAsync({ volume: muted ? 0 : 0.4 });
  }, [muted]);

  const HeaderIcon = () => <Feather name={meta.icon.name} size={20} color="#E5E7EB" />;

  const phaseLabel = labelFor(currentStep?.phase);
  const helperText = helperFor(currentStep?.phase);

  return (
    <LinearGradient colors={meta.gradient} style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* HEADER */}
      <View style={styles.headerWrap}>
        <BlurView intensity={30} tint="dark" style={styles.headerGlass}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
            <Ionicons name="arrow-back" size={24} color="#E5E7EB" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{mode} Mode</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => setMuted((m) => !m)} style={styles.iconBtn}>
              <Ionicons name={muted ? "volume-mute" : "volume-high"} size={20} color="#E5E7EB" />
            </TouchableOpacity>
            <HeaderIcon />
          </View>
        </BlurView>
      </View>

      {/* CENTER */}
      <View style={styles.center}>
        <BreathingCircle scale={scale} accent={meta.accent} size={160} />
        <View style={styles.phaseWrap}>
          <Text style={[styles.phaseText, !running && stepIndex === 0 && styles.readyText]}>
            {phaseLabel}
          </Text>
          <Text style={styles.helperText}>{helperText}</Text>
        </View>
      </View>

      {/* FOOTER */}
      <View style={styles.footer}>
        <View style={styles.dotsRow}>
          {Array.from({ length: meta.targetCycles }).map((_, i) => (
            <View key={i} style={[styles.dot, i < cycleIndex && styles.dotActive]} />
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={toggle} activeOpacity={0.9}>
          <LinearGradient
            colors={running ? ["#EF4444", "#DC2626"] : [meta.accent, "#6246EA"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.buttonInner}
          >
            <Ionicons name={running ? "pause" : "play"} size={22} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.buttonText}>{running ? "Pause" : "Start Breathing"}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.metaText}>
          {`${cycleIndex}/${meta.targetCycles} cycles`} · {currentStep ? labelFor(currentStep.phase) : "Ready"}
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "space-between", paddingVertical: 20 },
  headerWrap: { paddingHorizontal: 16, paddingTop: Platform.select({ ios: 52, android: 24 }) },
  headerGlass: {
    height: 56,
    borderRadius: 29,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  headerTitle: { color: "#F3F4F6", fontSize: 16, fontFamily: "Poppins-Medium" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  iconBtn: { padding: 6 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  phaseWrap: { marginTop: 95, alignItems: "center", paddingHorizontal: 22 },
  phaseText: { color: "#FFF", fontSize: 24, fontFamily: "Poppins-SemiBold", letterSpacing: 0.3 },
  readyText: { color: "#A5B4FC" },
  helperText: {
    color: "rgba(229,231,235,0.8)",
    fontSize: 13,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 20,
    fontFamily: "Poppins-Regular",
  },
  footer: { alignItems: "center", paddingBottom: 26 },
  dotsRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "rgba(148,163,184,0.35)" },
  dotActive: { backgroundColor: "#E5E7EB" },
  button: { borderRadius: 40, overflow: "hidden" },
  buttonInner: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { color: "#FFF", fontSize: 16, fontFamily: "Poppins-Medium", letterSpacing: 0.4 },
  metaText: {
    marginTop: 10,
    color: "rgba(229,231,235,0.7)",
    fontSize: 12,
    fontFamily: "Poppins-Regular",
  },
});
