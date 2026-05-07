import { useEffect } from "react";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../src/auth/useAuth";
import { useOnboardingStore } from "../src/onboarding/store";
import { Colors } from "../src/theme/index";

export default function Index() {
  const { status } = useAuth();
  const hydrate = useOnboardingStore((s) => s.hydrate);
  const step = useOnboardingStore((s) => s.step);

  useEffect(() => { void hydrate(); }, [hydrate]);

  if (status === "loading") {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.bg }}>
        <ActivityIndicator />
      </View>
    );
  }
  if (status === "unauthenticated") return <Redirect href={"/onboarding/welcome" as any} />;
  if (step !== "done" && step !== "welcome") return <Redirect href={`/onboarding/${step}` as any} />;
  return <Redirect href={"/home" as any} />;
}
