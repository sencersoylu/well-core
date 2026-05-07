import { useState } from "react";
import { Text, View, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { OnboardingShell } from "../../src/onboarding/ui/OnboardingShell";
import { PrimaryButton } from "../../src/onboarding/ui/PrimaryButton";
import { useOnboardingStore } from "../../src/onboarding/store";
import { Colors, Spacing, TextStyles } from "../../src/theme/index";

export default function Disclaimer() {
  const { t } = useTranslation();
  const router = useRouter();
  const ack = useOnboardingStore((s) => s.ackDisclaimers);
  const setStep = useOnboardingStore((s) => s.setStep);
  const [checked, setChecked] = useState(false);

  return (
    <OnboardingShell
      step={4}
      totalSteps={12}
      title={t("onboarding.disclaimer.title")}
      footer={
        <>
          <Pressable
            onPress={() => setChecked((v) => !v)}
            style={styles.checkRow}
            accessibilityRole="checkbox"
            accessibilityState={{ checked }}
          >
            <View style={[styles.box, checked && styles.boxChecked]}>
              {checked && <Text style={styles.tick}>✓</Text>}
            </View>
            <Text style={styles.checkLabel}>{t("onboarding.disclaimer.ack")}</Text>
          </Pressable>
          <PrimaryButton
            label={t("onboarding.common.continue")}
            disabled={!checked}
            onPress={() => {
              ack();
              setStep("health-1");
              router.push("/onboarding/health-1" as any);
            }}
          />
        </>
      }
    >
      <Text style={styles.body}>{t("onboarding.disclaimer.body")}</Text>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  body: { ...TextStyles.body, color: Colors.ink2 },
  checkRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  box: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.hairlineStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  boxChecked: { backgroundColor: Colors.ink, borderColor: Colors.ink },
  tick: { color: Colors.bg, fontSize: 14, lineHeight: 16 },
  checkLabel: { ...TextStyles.body, color: Colors.ink },
});
