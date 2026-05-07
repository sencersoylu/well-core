import { Hono } from "hono";
import { db } from "../db/client.js";
import { suicidalityScreens } from "../db/schema/index.js";
import { requireAuth, type AuthVariables } from "../middleware/require-auth.js";
import { SuicidalityScreenSchema } from "../schemas/suicidality.js";

export const suicidalityRoute = new Hono<{ Variables: AuthVariables }>()
  .use("/me/suicidality", requireAuth)
  .post("/me/suicidality", async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const parsed = SuicidalityScreenSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: "invalid_body", issues: parsed.error.issues }, 400);
    const userId = c.var.user.id;
    const [row] = await db.insert(suicidalityScreens).values({
      userId,
      phq9Item9Score: parsed.data.score,
      crisisResourcesShownAt: parsed.data.crisisShown ? new Date() : null,
    }).returning();
    if (!row) return c.json({ error: "internal" }, 500);
    return c.json({
      id: row.id,
      score: row.phq9Item9Score,
      instrument: parsed.data.instrument,
      crisisResourcesShown: !!row.crisisResourcesShownAt,
      recordedAt: row.recordedAt,
    }, 201);
  });
