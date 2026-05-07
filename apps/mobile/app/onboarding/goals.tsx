import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { OnboardingShell } from "../../src/onboarding/ui/OnboardingShell";
import { PrimaryButton } from "../../src/onboarding/ui/PrimaryButton";
import { EvidenceDot } from "../../src/components/data/EvidenceDot";
import { useOnboardingStore } from "../../src/onboarding/store";
import type { GoalId } from "../../src/onboarding/types";
import type { EvidenceLevel } from "@wellcore/shared/evidence";
import { Colors, Spacing, TextStyles } from "../../src/theme/index";

const GOALS: { id: GoalId; isMedical?: boolean }[] = [
  { id: "recovery" },
  { id: "wellness" },
  { id: "brain_fog", isMedical: true },
  { id: "long_covid", isMedical: true },
  { id: "neuro_recovery", isMedical: true },
  { id: "athletic_performance" },
  { id: "radiance" },
  { id: "anti_aging" },
  { id: "vitality" },
];

const GOAL_EVIDENCE: Record<GoalId, EvidenceLevel> = {
  recovery: "strong",
  wellness: "moderate",
  brain_fog: "moderate",
  long_covid: "moderate",
  neuro_recovery: "moderate",
  athletic_performance: "weak",
  radiance: "weak",
  anti_aging: "weak",
  vitality: "weak",
};

export default function Goals() {
  const { t } = useTranslation();
  const router = useRouter();
  const goals = useOnboardingStore((s) => s.goals);
  const setGoals = useOnboardingStore((s) => s.setGoals);
  const setStep = useOnboardingStore((s) => s.setStep);

  const toggle = (g: GoalId) => {
    if (goals.includes(g)) setGoals(goals.filter((x) => x !== g));
    else if (goals.length < 5) setGoals([...goals, g]);
  };

  const showMedical = goals.some((g) => GOALS.find((x) => x.id === g)?.isMedical);

  return (
    <OnboardingShell
      step={1}
      totalSteps={12}
      title={t("onboarding.goals.title")}
      subtitle={t("onboarding.goals.subtitle")}
      footer={
        <PrimaryButton
          label={t("onboarding.common.continue")}
          disabled={goals.length === 0}
          onPress={() => {
            setStep("chamber");
            router.push("/onboarding/chamber" as any);
          }}
        />
      }
    >
      <View style={{ gap: Spacing.sm }}>
        {GOALS.map(({ id }) => {
          const selected = goals.includes(id);
          return (
            <Pressable
              key={id}
              onPress={() => toggle(id)}
              style={[styles.row, selected && styles.rowSel]}
            >
              <EvidenceDot level={GOAL_EVIDENCE[id]} />
              <Text style={[styles.label, selected && styles.labelSel]}>
                {t(`onboarding.goals.items.${id}`)}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {showMedical && (
        <Text style={styles.note}>{t("onboarding.goals.medicalDisclaimer")}</Text>
      )}
      {goals.length === 5 && (
        <Text style={styles.note}>{t("onboarding.goals.max")}</Text>
      )}
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: Spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.hairline,
  },
  rowSel: {
    borderColor: Colors.ink,
    backgroundColor: Colors.bgElev,
  },
  label: { ...TextStyles.body, color: Colors.ink2 },
  labelSel: { color: Colors.ink },
  note: { ...TextStyles.caption, color: Colors.ink3, marginTop: Spacing.md },
});
