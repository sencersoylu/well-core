import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { OnboardingShell } from "../../src/onboarding/ui";
import { PrimaryButton } from "../../src/onboarding/ui/PrimaryButton";
import { useOnboardingStore } from "../../src/onboarding/store";
import { Colors, Spacing, TextStyles } from "../../src/theme/index";

const FACETS = ["energy", "pain", "sleep", "focus"];

export default function Preview() {
  const { t } = useTranslation();
  const router = useRouter();
  const setStep = useOnboardingStore((s) => s.setStep);

  return (
    <OnboardingShell
      step={12} totalSteps={12}
      title={t("onboarding.preview.title")}
      subtitle={t("onboarding.preview.subtitle")}
      footer={<PrimaryButton label={t("onboarding.common.continue")} onPress={() => { setStep("done"); router.push("/onboarding/done" as any); }} />}
    >
      <View style={{ gap: Spacing.md }}>
        {FACETS.map((f) => (
          <View key={f} style={styles.row}>
            <Text style={styles.label}>{f}</Text>
            <View style={styles.bar}><View style={[styles.fill, { width: "60%" }]} /></View>
          </View>
        ))}
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  row: { gap: 6 },
  label: { ...TextStyles.eyebrow, color: Colors.ink3, textTransform: "capitalize" },
  bar: { height: 8, borderRadius: 4, backgroundColor: Colors.hairline, overflow: "hidden" },
  fill: { height: "100%", backgroundColor: Colors.ink2 },
});
