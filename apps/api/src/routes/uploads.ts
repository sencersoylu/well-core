import { Hono } from "hono";
import { requireAuth, type AuthVariables } from "../middleware/require-auth.js";
import { PresignSchema } from "../schemas/uploads.js";
import { presignPut } from "../lib/s3.js";
import { ServerEnvSchema } from "@wellcore/shared";

const env = ServerEnvSchema.parse(process.env);
const BUCKET_MAP: Record<"avatars" | "session-media", string> = {
  avatars: env.S3_AVATARS_BUCKET,
  "session-media": env.S3_SESSION_MEDIA_BUCKET,
};

export const uploadsRoute = new Hono<{ Variables: AuthVariables }>()
  .use("/uploads/*", requireAuth)
  .post("/uploads/presign", async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const parsed = PresignSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: "invalid_body", issues: parsed.error.issues }, 400);
    const userId = c.var.user.id;
    const key = `${userId}/${crypto.randomUUID()}.${parsed.data.ext}`;
    const bucket = BUCKET_MAP[parsed.data.bucket];
    const { url, publicUrl } = await presignPut({ bucket, key, contentType: parsed.data.contentType });
    return c.json({ url, publicUrl, bucket, key, expiresInSec: 600 });
  });
