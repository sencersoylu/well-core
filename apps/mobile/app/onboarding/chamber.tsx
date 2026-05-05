import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { OnboardingShell } from "../../src/onboarding/ui/OnboardingShell";
import { PrimaryButton } from "../../src/onboarding/ui/PrimaryButton";
import { ChamberTypeSelector } from "../../src/components/onboarding/ChamberTypeSelector";
import { useOnboardingStore } from "../../src/onboarding/store";
import type { ChamberType } from "../../src/onboarding/types";

export default function Chamber() {
  const { t } = useTranslation();
  const router = useRouter();
  const chamberType = useOnboardingStore((s) => s.chamberType);
  const setChamberType = useOnboardingStore((s) => s.setChamberType);
  const setStep = useOnboardingStore((s) => s.setStep);

  return (
    <OnboardingShell
      step={2}
      totalSteps={12}
      title={t("onboarding.chamber.title")}
      subtitle={t("onboarding.chamber.subtitle")}
      footer={
        <PrimaryButton
          label={t("onboarding.common.continue")}
          disabled={!chamberType}
          onPress={() => {
            setStep("fire-safety");
            router.push("/onboarding/fire-safety" as any);
          }}
        />
      }
    >
      <ChamberTypeSelector
        value={chamberType ?? null}
        onChange={(v: ChamberType) => setChamberType(v)}
      />
    </OnboardingShell>
  );
}
