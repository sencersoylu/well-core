import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { OnboardingShell } from "../../src/onboarding/ui";
import { PrimaryButton } from "../../src/onboarding/ui/PrimaryButton";
import { useOnboardingStore } from "../../src/onboarding/store";
import type { ConsentType } from "../../src/onboarding/types";
import { Colors, Spacing, TextStyles } from "../../src/theme/index";

const TYPES: ConsentType[] = ["terms", "privacy", "ccpa_sale", "mhmda", "modpa"];
const VERSION = "v1.0.0";

export default function Consent() {
  const { t } = useTranslation();
  const router = useRouter();
  const [checked, setChecked] = useState<Record<ConsentType, boolean>>({ terms: false, privacy: false, ccpa_sale: false, mhmda: false, modpa: false });
  const addConsent = useOnboardingStore((s) => s.addConsent);
  const setStep = useOnboardingStore((s) => s.setStep);

  const allChecked = TYPES.every((k) => checked[k]);
  const onToggle = (k: ConsentType) => setChecked((x) => ({ ...x, [k]: !x[k] }));
  const onContinue = () => {
    const now = new Date().toISOString();
    TYPES.forEach((type) => addConsent({ type, version: VERSION, acceptedAt: now }));
    setStep("locale");
    router.push("/onboarding/locale" as any);
  };

  return (
    <OnboardingShell
      step={12} totalSteps={12}
      title={t("onboarding.consent.title")}
      subtitle={t("onboarding.consent.subtitle")}
      footer={<PrimaryButton label={t("onboarding.common.continue")} disabled={!allChecked} onPress={onContinue} />}
    >
      <View style={{ gap: Spacing.sm }}>
        {TYPES.map((k) => (
          <Pressable key={k} onPress={() => onToggle(k)} style={[styles.row, checked[k] && styles.rowChecked]}>
            <View style={[styles.box, checked[k] && styles.boxChecked]}>{checked[k] && <Text style={styles.tick}>✓</Text>}</View>
            <Text style={styles.label}>{t(`onboarding.consent.${k}`)}</Text>
          </Pressable>
        ))}
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: Spacing.md, borderRadius: 12, borderWidth: 1, borderColor: Colors.hairline },
  rowChecked: { borderColor: Colors.ink },
  box: { width: 22, height: 22, borderRadius: 6, borderWidth: 1, borderColor: Colors.hairlineStrong, alignItems: "center", justifyContent: "center" },
  boxChecked: { backgroundColor: Colors.ink, borderColor: Colors.ink },
  tick: { color: Colors.bg, fontSize: 14, lineHeight: 16 },
  label: { ...TextStyles.body, color: Colors.ink, flex: 1 },
});
