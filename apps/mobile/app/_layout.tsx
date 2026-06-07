import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#0a0a0b" },
          headerTintColor: "#f5f5f4",
          contentStyle: { backgroundColor: "#0a0a0b" },
        }}
      />
    </SafeAreaProvider>
  );
}
