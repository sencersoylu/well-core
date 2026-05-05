import { z } from "zod";

export const StartProtocolSchema = z.object({
  protocolId: z.string().uuid(),
});

export const UpdateUserProtocolSchema = z.object({
  status: z.enum(["active", "paused", "completed"]),
});
