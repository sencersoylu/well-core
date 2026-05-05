import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import * as Linking from "expo-linking";
import { Colors, Spacing, TextStyles } from "../../src/theme/index";
import { useOnboardingStore } from "../../src/onboarding/store";
import { OnboardingShell } from "../../src/onboarding/ui";
import { PrimaryButton } from "../../src/onboarding/ui/PrimaryButton";

export default function HardStop() {
  const { t } = useTranslation();
  const reason = useOnboardingStore((s) => s.hardStopReason);
  return (
    <OnboardingShell
      step={12} totalSteps={12}
      title={t("onboarding.hardStop.title")}
      subtitle={t("onboarding.hardStop.subtitle")}
      showBack={false}
      footer={<PrimaryButton label={t("onboarding.hardStop.exit")} onPress={() => Linking.openURL("https://wellcore.app/declined")} />}
    >
      {reason ? <Text style={styles.rationale}>{t(`onboarding.health.${reason}.hardStopRationale`)}</Text> : null}
    </OnboardingShell>
  );
}
const styles = StyleSheet.create({
  rationale: { ...TextStyles.body, color: Colors.crisisText, backgroundColor: Colors.crisisBg, padding: Spacing.lg, borderRadius: 16, borderWidth: 1, borderColor: Colors.crisisBorder },
});
