import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { profiles, consentEvents } from "../db/schema/index.js";
import { requireAuth, type AuthVariables } from "../middleware/require-auth.js";
import { ProfileUpdateSchema, DisclaimerAckSchema, ConsentSchema } from "../schemas/profile.js";

export const profileRoute = new Hono<{ Variables: AuthVariables }>()
  .use("/profile", requireAuth)
  .use("/profile/*", requireAuth)

  .get("/profile", async (c) => {
    const userId = c.var.user.id;
    const [row] = await db.select().from(profiles).where(eq(profiles.userId, userId as any)).limit(1);
    if (!row) {
      const [created] = await db.insert(profiles).values({ userId: userId as any }).returning();
      return c.json(created);
    }
    return c.json(row);
  })

  .put("/profile", async (c) => {
    const userId = c.var.user.id;
    const body = await c.req.json().catch(() => ({}));
    const parsed = ProfileUpdateSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: "invalid_body", issues: parsed.error.issues }, 400);
    // Strip undefined values to satisfy exactOptionalPropertyTypes
    const data = Object.fromEntries(
      Object.entries(parsed.data).filter(([, v]) => v !== undefined)
    ) as Record<string, unknown>;
    const [row] = await db
      .insert(profiles)
      .values({ userId: userId as any, ...data })
      .onConflictDoUpdate({ target: profiles.userId, set: { ...data, updatedAt: new Date() } })
      .returning();
    return c.json(row);
  })

  .post("/profile/disclaimers", async (c) => {
    const userId = c.var.user.id;
    const body = await c.req.json().catch(() => ({}));
    const parsed = DisclaimerAckSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: "invalid_body", issues: parsed.error.issues }, 400);
    const now = new Date();
    const [row] = await db
      .insert(profiles)
      .values({ userId: userId as any, acceptedDisclaimersAt: now, fireSafetyAcknowledgedAt: now })
      .onConflictDoUpdate({
        target: profiles.userId,
        set: { acceptedDisclaimersAt: now, fireSafetyAcknowledgedAt: now, updatedAt: now },
      })
      .returning();
    return c.json(row);
  })

  .post("/profile/consent", async (c) => {
    const userId = c.var.user.id;
    const body = await c.req.json().catch(() => ({}));
    const parsed = ConsentSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: "invalid_body", issues: parsed.error.issues }, 400);
    const [row] = await db.insert(consentEvents).values({
      userId: userId as any,
      type: parsed.data.type,
      version: parsed.data.version,
      ipAddress: c.req.header("x-forwarded-for") ?? c.req.header("x-real-ip") ?? null,
      userAgent: c.req.header("user-agent") ?? null,
    }).returning();
    return c.json(row, 201);
  });
