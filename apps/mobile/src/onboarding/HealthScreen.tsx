import { useRouter } from "expo-router";
import { OnboardingShell } from "./ui";
import { HealthCard } from "./ui/HealthCard";
import { useOnboardingStore } from "./store";
import type { HealthCardId, OnboardingStep } from "./types";

const ORDER: HealthCardId[] = ["pregnancy", "pneumothorax", "ear_surgery", "active_malignancy", "severe_copd", "claustrophobia", "recent_surgery"];

export function HealthScreen({ cardIndex }: { cardIndex: number }) {
  const idx = Math.max(0, Math.min(cardIndex - 1, ORDER.length - 1));
  const cardId = ORDER[idx]!;
  const router = useRouter();
  const addAnswer = useOnboardingStore((s) => s.addHealthAnswer);
  const setStep = useOnboardingStore((s) => s.setStep);
  const onAnswer = (answer: boolean) => {
    addAnswer(cardId, answer);
    const hardStopHit = answer && idx < 5;
    if (hardStopHit) { router.replace("/onboarding/hard-stop" as any); return; }
    if (idx + 1 < ORDER.length) {
      const next = `health-${idx + 2}` as OnboardingStep;
      setStep(next);
      router.push(`/onboarding/health-${idx + 2}` as any);
    } else {
      setStep("health-8");
      router.push("/onboarding/health-8" as any);
    }
  };
  return (
    <OnboardingShell step={5 + idx} totalSteps={12} title="" footer={<></>}>
      <HealthCard cardId={cardId} onAnswer={onAnswer} />
    </OnboardingShell>
  );
}
