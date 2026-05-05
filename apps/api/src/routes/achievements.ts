import { Hono } from "hono";
import { eq, desc } from "drizzle-orm";
import { db } from "../db/client.js";
import { achievements } from "../db/schema/index.js";
import { requireAuth, type AuthVariables } from "../middleware/require-auth.js";

export const achievementsRoute = new Hono<{ Variables: AuthVariables }>()
  .use("/me/achievements", requireAuth)
  .get("/me/achievements", async (c) => {
    const userId = c.var.user.id;
    const rows = await db.select().from(achievements)
      .where(eq(achievements.userId, userId))
      .orderBy(desc(achievements.unlockedAt));
    return c.json(rows);
  });
