import { useState } from "react";
import { Pressable, View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { OnboardingShell } from "../../src/onboarding/ui";
import { PrimaryButton } from "../../src/onboarding/ui/PrimaryButton";
import { useOnboardingStore } from "../../src/onboarding/store";
import { api } from "../../src/api/client";
import { Colors, Spacing, TextStyles } from "../../src/theme/index";

export default function PHQ9() {
  const { t } = useTranslation();
  const router = useRouter();
  const [score, setScore] = useState<number | null>(null);
  const setSuicidalityScore = useOnboardingStore((s) => s.setSuicidalityScore);
  const setStep = useOnboardingStore((s) => s.setStep);

  const onContinue = async () => {
    if (score == null) return;
    setSuicidalityScore(score);
    if (score >= 1) {
      try {
        await api.me.suicidality.$post({ json: { score, instrument: "phq9_item9" as const, crisisShown: true } });
      } catch {
        // network failure shouldn't block crisis screen — still show it
      }
      router.replace("/onboarding/crisis" as any);
    } else {
      setStep("consent");
      router.push("/onboarding/consent" as any);
    }
  };

  return (
    <OnboardingShell
      step={12} totalSteps={12}
      title={t("onboarding.health.phq9_item9.title")}
      footer={<PrimaryButton label={t("onboarding.common.continue")} disabled={score == null} onPress={onContinue} />}
    >
      <View style={{ gap: Spacing.sm }}>
        {[0, 1, 2, 3].map((n) => (
          <Pressable key={n} onPress={() => setScore(n)} style={[styles.row, score === n && styles.rowSel]}>
            <Text style={[styles.label, score === n && styles.labelSel]}>{t(`onboarding.health.phq9_item9.options.${n}`)}</Text>
          </Pressable>
        ))}
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  row: { padding: Spacing.md, borderRadius: 16, borderWidth: 1, borderColor: Colors.hairline },
  rowSel: { borderColor: Colors.ink, backgroundColor: Colors.bgElev },
  label: { ...TextStyles.body, color: Colors.ink2 },
  labelSel: { color: Colors.ink },
});
