// 👇 Order matters!
import "react-native-gesture-handler";
import "react-native-reanimated";

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useFonts } from "expo-font";
import { View, ActivityIndicator, StyleSheet } from "react-native";

// Screens
import WelcomeScreen from "./screens/WelcomeScreen";
import ModeScreen from "./screens/ModeScreen";
import BreatheScreen from "./screens/BreatheScreen";
import SessionCompleteScreen from "./screens/SessionCompleteScreen";
import StatsScreen from "./screens/StatsScreen";

// Types
export type ModeName = "Calm" | "Focus" | "Sleep";
export type RootStackParamList = {
  Welcome: undefined;
  Mode: undefined;
  Breathe: { mode: ModeName };
  SessionComplete: { mode?: ModeName; minutes?: number; elapsedMs?: number };
  Stats: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [fontsLoaded] = useFonts({
    "Poppins-Regular": require("./assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Medium": require("./assets/fonts/Poppins-Medium.ttf"),
    "Poppins-SemiBold": require("./assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Bold": require("./assets/fonts/Poppins-Bold.ttf"),
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color="#7F5AF0" size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
          animation: "fade",
        }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Mode" component={ModeScreen} />
        <Stack.Screen name="Breathe" component={BreatheScreen} />
        <Stack.Screen name="SessionComplete" component={SessionCompleteScreen} />
        <Stack.Screen name="Stats" component={StatsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0F172A",
  },
});
