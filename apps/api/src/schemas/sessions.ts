import { z } from "zod";

export const CreateSessionSchema = z.object({
  userProtocolId: z.string().uuid().nullable().optional(),
  pressureAta: z.number().min(1.0).max(3.0),
  clientState: z.record(z.unknown()).optional(),
});

export const UpdateSessionSchema = z.object({
  totalDurationSec: z.number().int().nonnegative().optional(),
  treatmentDurationSec: z.number().int().nonnegative().optional(),
  pausedDurationSec: z.number().int().nonnegative().optional(),
  status: z.enum(["in_progress", "completed", "aborted"]).optional(),
  endedAt: z.string().datetime().optional(),
  clientState: z.record(z.unknown()).optional(),
});

export const ListSessionsQuery = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().uuid().optional(),
});
