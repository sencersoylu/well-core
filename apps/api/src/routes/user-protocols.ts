import { Hono } from "hono";
import { and, eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { userProtocols, protocols } from "../db/schema/index.js";
import { requireAuth, type AuthVariables } from "../middleware/require-auth.js";
import { StartProtocolSchema, UpdateUserProtocolSchema } from "../schemas/protocols.js";

export const userProtocolsRoute = new Hono<{ Variables: AuthVariables }>()
  .use("/me/protocols", requireAuth)
  .use("/me/protocols/*", requireAuth)

  .get("/me/protocols", async (c) => {
    const userId = c.var.user.id;
    const rows = await db.select().from(userProtocols).where(eq(userProtocols.userId, userId));
    return c.json(rows);
  })

  .post("/me/protocols", async (c) => {
    const userId = c.var.user.id;
    const body = await c.req.json().catch(() => ({}));
    const parsed = StartProtocolSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: "invalid_body", issues: parsed.error.issues }, 400);
    const [protocol] = await db.select().from(protocols).where(eq(protocols.id, parsed.data.protocolId)).limit(1);
    if (!protocol) return c.json({ error: "protocol_not_found" }, 404);
    const [row] = await db.insert(userProtocols).values({
      userId: userId,
      protocolId: protocol.id,
      targetSessionCount: protocol.targetSessionCount,
    }).returning();
    return c.json(row, 201);
  })

  .patch("/me/protocols/:id", async (c) => {
    const userId = c.var.user.id;
    const id = c.req.param("id");
    const body = await c.req.json().catch(() => ({}));
    const parsed = UpdateUserProtocolSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: "invalid_body", issues: parsed.error.issues }, 400);
    const patch: Record<string, unknown> = { status: parsed.data.status };
    if (parsed.data.status === "paused") patch.pausedAt = new Date();
    if (parsed.data.status === "completed") patch.completedAt = new Date();
    const [row] = await db.update(userProtocols)
      .set(patch)
      .where(and(eq(userProtocols.id, id), eq(userProtocols.userId, userId)))
      .returning();
    if (!row) return c.json({ error: "not_found" }, 404);
    return c.json(row);
  });
