import { z } from "zod";

export const CheckinCreateSchema = z.object({
  sessionId: z.string().uuid().nullable().optional(),
  checkinType: z.enum(["pre", "post"]),
  promisGlobalPhysical: z.number().int().min(1).max(5),
  promisGlobalMental: z.number().int().min(1).max(5),
  painLevel: z.number().int().min(0).max(10),
  energyLevel: z.number().int().min(0).max(10),
  sleepQuality: z.number().int().min(0).max(10),
  focusLevel: z.number().int().min(0).max(10),
  notes: z.string().max(500).optional(),
});

export const CheckinListQuery = z.object({
  sessionId: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
