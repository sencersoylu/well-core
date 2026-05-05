import { Hono } from "hono";
import { and, desc, eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { wellnessCheckins } from "../db/schema/index.js";
import { requireAuth, type AuthVariables } from "../middleware/require-auth.js";
import { CheckinCreateSchema, CheckinListQuery } from "../schemas/checkins.js";

export const checkinsRoute = new Hono<{ Variables: AuthVariables }>()
  .use("/checkins", requireAuth)
  .use("/me/checkins", requireAuth)

  .post("/checkins", async (c) => {
    const userId = c.var.user.id;
    const body = await c.req.json().catch(() => ({}));
    const parsed = CheckinCreateSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: "invalid_body", issues: parsed.error.issues }, 400);
    const [row] = await db.insert(wellnessCheckins).values({
      userId: userId as any,
      sessionId: parsed.data.sessionId ?? null,
      checkinType: parsed.data.checkinType,
      promisGlobalPhysical: parsed.data.promisGlobalPhysical,
      promisGlobalMental: parsed.data.promisGlobalMental,
      painLevel: parsed.data.painLevel,
      energyLevel: parsed.data.energyLevel,
      sleepQuality: parsed.data.sleepQuality,
      focusLevel: parsed.data.focusLevel,
      notes: parsed.data.notes ?? null,
    }).returning();
    return c.json(row, 201);
  })

  .get("/me/checkins", async (c) => {
    const userId = c.var.user.id;
    const q = CheckinListQuery.safeParse(Object.fromEntries(new URL(c.req.url).searchParams));
    if (!q.success) return c.json({ error: "invalid_query" }, 400);
    const where = q.data.sessionId
      ? and(eq(wellnessCheckins.userId, userId as any), eq(wellnessCheckins.sessionId, q.data.sessionId))
      : eq(wellnessCheckins.userId, userId as any);
    const rows = await db.select().from(wellnessCheckins)
      .where(where).orderBy(desc(wellnessCheckins.recordedAt)).limit(q.data.limit);
    return c.json(rows);
  });
