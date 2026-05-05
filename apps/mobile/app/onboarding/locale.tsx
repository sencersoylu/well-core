import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { OnboardingShell } from "../../src/onboarding/ui";
import { PrimaryButton } from "../../src/onboarding/ui/PrimaryButton";
import { useOnboardingStore } from "../../src/onboarding/store";
import { i18next } from "../../src/i18n";
import { Colors, Spacing, TextStyles } from "../../src/theme/index";

const OPTIONS: Array<{ value: "en-US" | "tr-TR"; label: string; lng: "en" | "tr" }> = [
  { value: "en-US", label: "English (US)", lng: "en" },
  { value: "tr-TR", label: "Türkçe", lng: "tr" },
];

export default function LocalePick() {
  const { t } = useTranslation();
  const router = useRouter();
  const locale = useOnboardingStore((s) => s.locale);
  const setLocale = useOnboardingStore((s) => s.setLocale);
  const setStep = useOnboardingStore((s) => s.setStep);

  return (
    <OnboardingShell
      step={12} totalSteps={12}
      title={t("onboarding.locale.title")}
      subtitle={t("onboarding.locale.subtitle")}
      footer={<PrimaryButton label={t("onboarding.common.continue")} onPress={() => { setStep("profile"); router.push("/onboarding/profile" as any); }} />}
    >
      <View style={{ gap: Spacing.sm }}>
        {OPTIONS.map((o) => (
          <Pressable key={o.value} onPress={() => { setLocale(o.value); void i18next.changeLanguage(o.lng); }} style={[styles.row, locale === o.value && styles.rowSel]}>
            <Text style={[styles.label, locale === o.value && styles.labelSel]}>{o.label}</Text>
          </Pressable>
        ))}
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  row: { padding: Spacing.md, borderRadius: 12, borderWidth: 1, borderColor: Colors.hairline },
  rowSel: { borderColor: Colors.ink, backgroundColor: Colors.bgElev },
  label: { ...TextStyles.body, color: Colors.ink2 },
  labelSel: { color: Colors.ink },
});
