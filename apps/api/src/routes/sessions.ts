import { Hono } from "hono";
import { and, desc, eq, lt } from "drizzle-orm";
import { db } from "../db/client.js";
import { hbotSessions } from "../db/schema/index.js";
import { requireAuth, type AuthVariables } from "../middleware/require-auth.js";
import { CreateSessionSchema, UpdateSessionSchema, ListSessionsQuery } from "../schemas/sessions.js";

export const sessionsRoute = new Hono<{ Variables: AuthVariables }>()
  .use("/sessions", requireAuth)
  .use("/sessions/*", requireAuth)
  .use("/me/sessions", requireAuth)

  .post("/sessions", async (c) => {
    const userId = c.var.user.id;
    const body = await c.req.json().catch(() => ({}));
    const parsed = CreateSessionSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: "invalid_body", issues: parsed.error.issues }, 400);
    const [row] = await db.insert(hbotSessions).values({
      userId: userId as any,
      userProtocolId: parsed.data.userProtocolId ?? null,
      pressureAta: String(parsed.data.pressureAta),
      clientState: parsed.data.clientState ?? null,
    }).returning();
    return c.json(row, 201);
  })

  .patch("/sessions/:id", async (c) => {
    const userId = c.var.user.id;
    const id = c.req.param("id");
    const body = await c.req.json().catch(() => ({}));
    const parsed = UpdateSessionSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: "invalid_body", issues: parsed.error.issues }, 400);
    const patch: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.endedAt) patch.endedAt = new Date(parsed.data.endedAt);
    const [row] = await db.update(hbotSessions)
      .set(patch)
      .where(and(eq(hbotSessions.id, id), eq(hbotSessions.userId, userId as any)))
      .returning();
    if (!row) return c.json({ error: "not_found" }, 404);
    return c.json(row);
  })

  .get("/me/sessions", async (c) => {
    const userId = c.var.user.id;
    const q = ListSessionsQuery.safeParse(Object.fromEntries(new URL(c.req.url).searchParams));
    if (!q.success) return c.json({ error: "invalid_query" }, 400);
    const where = q.data.cursor
      ? and(eq(hbotSessions.userId, userId as any), lt(hbotSessions.id, q.data.cursor))
      : eq(hbotSessions.userId, userId as any);
    const rows = await db.select().from(hbotSessions)
      .where(where).orderBy(desc(hbotSessions.startedAt)).limit(q.data.limit);
    return c.json({ items: rows, nextCursor: rows.length === q.data.limit ? rows[rows.length - 1]!.id : null });
  });
