import { useEffect, useState } from "react";
import { Alert, ActivityIndicator, View } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { OnboardingShell } from "../../src/onboarding/ui";
import { PrimaryButton } from "../../src/onboarding/ui/PrimaryButton";
import { commitOnboarding } from "../../src/onboarding/commit";
import { useOnboardingStore } from "../../src/onboarding/store";

export default function Done() {
  const { t } = useTranslation();
  const router = useRouter();
  const [state, setState] = useState<"committing" | "ok" | "error">("committing");

  const run = async () => {
    setState("committing");
    try {
      await commitOnboarding();
      setState("ok");
    } catch (e) {
      setState("error");
      Alert.alert("Sync failed", e instanceof Error ? e.message : String(e));
    }
  };
  useEffect(() => { void run(); }, []);

  return (
    <OnboardingShell
      step={12} totalSteps={12}
      title={t("onboarding.done.title")}
      subtitle={t("onboarding.done.subtitle")}
      showBack={false}
      footer={
        <PrimaryButton
          label={state === "error" ? "Retry" : t("onboarding.done.cta")}
          disabled={state === "committing"}
          onPress={() => {
            if (state === "ok") {
              useOnboardingStore.getState().reset();
              router.replace("/home" as any);
            } else {
              void run();
            }
          }}
        />
      }
    >
      {state === "committing" ? <View style={{ alignItems: "center", padding: 24 }}><ActivityIndicator /></View> : null}
    </OnboardingShell>
  );
}
