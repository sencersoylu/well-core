import { ScrollView, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import { CrisisResourcesScreen } from "../../src/components/onboarding/CrisisResourcesScreen";
import { PrimaryButton } from "../../src/onboarding/ui/PrimaryButton";
import { useOnboardingStore } from "../../src/onboarding/store";
import { Spacing } from "../../src/theme/index";

export default function Crisis() {
  const { t } = useTranslation();
  const router = useRouter();
  const setStep = useOnboardingStore((s) => s.setStep);

  const onContinue = () => {
    setStep("consent");
    router.replace("/onboarding/consent" as any);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <CrisisResourcesScreen />
        <View style={styles.footer}>
          <PrimaryButton label={t("onboarding.common.continue")} onPress={onContinue} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: Spacing.lg, gap: Spacing.lg },
  footer: { paddingTop: Spacing.md },
});
