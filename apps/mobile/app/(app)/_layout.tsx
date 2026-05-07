import { Redirect, Stack } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "../../src/auth/useAuth";
import { Colors } from "../../src/theme/index";

export default function AppLayout() {
  const { status } = useAuth();
  if (status === "loading") {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.bg, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={Colors.ink2} />
      </View>
    );
  }
  if (status !== "authenticated") return <Redirect href={"/onboarding/welcome" as any} />;
  return <Stack screenOptions={{ headerShown: false, animation: "fade" }} />;
}
