export type OnboardingStep =
  | "welcome" | "goals" | "chamber" | "fire-safety" | "disclaimer"
  | "health-1" | "health-2" | "health-3" | "health-4" | "health-5"
  | "health-6" | "health-7" | "health-8"
  | "consent" | "locale" | "profile" | "preview" | "done";

export type GoalId =
  | "recovery" | "wellness" | "brain_fog" | "long_covid"
  | "neuro_recovery" | "athletic_performance" | "radiance"
  | "anti_aging" | "vitality";

export type ChamberType = "soft_1_3" | "hard_1_5" | "hard_2_0";

export type HealthCardId =
  | "pregnancy" | "pneumothorax" | "ear_surgery" | "active_malignancy"
  | "severe_copd" | "claustrophobia" | "recent_surgery" | "phq9_item9";

export type ConsentType = "terms" | "privacy" | "ccpa_sale" | "mhmda" | "modpa";

export type ConsentAcceptance = { type: ConsentType; version: string; acceptedAt: string };
