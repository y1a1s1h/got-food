import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="pantry/[id]"
          options={{
            headerShown: true,
            title: "Pantry Details",
            headerStyle: { backgroundColor: "#861F41" },
            headerTintColor: "#fff",
            headerTitleStyle: { fontWeight: "bold" },
            presentation: "card",
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
