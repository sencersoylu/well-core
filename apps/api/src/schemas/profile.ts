import { z } from "zod";

export const ProfileUpdateSchema = z.object({
  displayName: z.string().min(1).max(80).optional(),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  goals: z.array(z.enum([
    "radiance","recovery","vitality","wellness","brain_fog",
    "long_covid","neuro_recovery","athletic_performance","anti_aging",
  ])).max(9).optional(),
  chamberType: z.enum(["soft_1_3", "hard_1_5", "hard_2_0_plus"]).optional(),
});

export const DisclaimerAckSchema = z.object({
  fireSafety: z.boolean().refine((v) => v === true),
  generalDisclaimer: z.boolean().refine((v) => v === true),
});

export const ConsentSchema = z.object({
  type: z.enum(["ccpa_optin", "mhmda_health_data", "modpa_health_data", "terms", "privacy"]),
  version: z.string().min(1).max(32),
});
