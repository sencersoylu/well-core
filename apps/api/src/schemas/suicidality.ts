import { z } from "zod";

export const SuicidalityScreenSchema = z.object({
  score: z.number().int().min(0).max(3),
  instrument: z.literal("phq9_item9").default("phq9_item9"),
  crisisShown: z.boolean(),
});

export type SuicidalityScreenInput = z.infer<typeof SuicidalityScreenSchema>;
