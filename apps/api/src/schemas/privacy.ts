import { z } from "zod";

export const DsarSchema = z.object({
  type: z.enum(["access", "deletion", "correction"]),
  notes: z.string().max(2000).optional(),
});
