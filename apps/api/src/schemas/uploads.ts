import { z } from "zod";

export const PresignSchema = z.object({
  bucket: z.enum(["avatars", "session-media"]),
  contentType: z.string().regex(/^[a-z]+\/[a-z0-9.+-]+$/i),
  byteLength: z.number().int().positive().max(15 * 1024 * 1024),
  ext: z.string().regex(/^[a-z0-9]{1,8}$/),
});
