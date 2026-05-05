import { useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { OnboardingShell } from "../../src/onboarding/ui";
import { PrimaryButton } from "../../src/onboarding/ui/PrimaryButton";
import { useOnboardingStore } from "../../src/onboarding/store";
import { Colors, Spacing, TextStyles } from "../../src/theme/index";

export default function Profile() {
  const { t } = useTranslation();
  const router = useRouter();
  const setProfile = useOnboardingStore((s) => s.setProfile);
  const setStep = useOnboardingStore((s) => s.setStep);
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");

  return (
    <OnboardingShell
      step={12} totalSteps={12}
      title={t("onboarding.profile.title")}
      subtitle={t("onboarding.profile.subtitle")}
      footer={
        <PrimaryButton
          label={t("onboarding.common.continue")}
          onPress={() => {
            setProfile({ displayName: name.trim(), dob: dob.trim() || null });
            setStep("preview");
            router.push("/onboarding/preview" as any);
          }}
        />
      }
    >
      <View style={{ gap: Spacing.lg }}>
        <View>
          <Text style={styles.lbl}>{t("onboarding.profile.name")}</Text>
          <TextInput value={name} onChangeText={setName} style={styles.input} autoCapitalize="words" />
        </View>
        <View>
          <Text style={styles.lbl}>{t("onboarding.profile.dob")}</Text>
          <TextInput value={dob} onChangeText={setDob} style={styles.input} placeholder="YYYY-MM-DD" autoCapitalize="none" />
        </View>
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  lbl: { ...TextStyles.eyebrow, color: Colors.ink3, marginBottom: 6 },
  input: { ...TextStyles.body, color: Colors.ink, borderWidth: 1, borderColor: Colors.hairlineStrong, borderRadius: 12, padding: Spacing.md },
});
