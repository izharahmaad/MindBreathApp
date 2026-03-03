import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";

type Props = NativeStackScreenProps<RootStackParamList, "Welcome">;

export default function WelcomeScreen({ navigation }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <LinearGradient
      colors={["#120C2C", "#1E1447", "#0D0620"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* ✅ Only this line changed — makes top bar transparent */}
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <Animated.View
        style={[
          styles.innerContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Logo */}
        <Image
          source={require("../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Title */}
        <Text style={styles.title}>MindBreath</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Unwind your mind, slow your breath, and embrace stillness.
        </Text>

        {/* Let’s Calm Button */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate("Mode")}
          style={styles.button}
        >
          <LinearGradient
            colors={["#4c368fff", "#231d35ff"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>Let’s Calm</Text>
            <Ionicons name="arrow-forward-circle" size={22} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Footer */}
      <View style={styles.footer}>
        <Ionicons name="moon" size={14} color="rgba(255,255,255,0.5)" />
        <Text style={styles.footerText}>Find peace in every breath</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  innerContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  logo: {
    width: 230,
    height: 230,
    marginBottom: -20,
  },
  title: {
    fontSize: 36,
    color: "#FFFFFF",
    fontFamily: "Poppins-Bold",
    letterSpacing: 0.8,
    marginTop: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(229,231,235,0.85)",
    fontFamily: "Poppins-Regular",
    textAlign: "center",
    marginTop: 1,
    maxWidth: 310,
    lineHeight: 22,
  },
  button: {
    marginTop: 50,
    borderRadius: 30,
    overflow: "hidden",
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 34,
    gap: 10,
    shadowColor: "#201050ff",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    letterSpacing: 0.4,
  },
  footer: {
    position: "absolute",
    bottom: 45,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  footerText: {
    color: "rgba(255,255,255,0.55)",
    fontFamily: "Poppins-Regular",
    fontSize: 12.5,
  },
});
