import { Hono } from "hono";
import { db } from "../db/client.js";
import { dsarRequests } from "../db/schema/index.js";
import { requireAuth, type AuthVariables } from "../middleware/require-auth.js";
import { DsarSchema } from "../schemas/privacy.js";

export const privacyRoute = new Hono<{ Variables: AuthVariables }>()
  .use("/privacy/*", requireAuth)
  .post("/privacy/dsar", async (c) => {
    const userId = c.var.user.id;
    const body = await c.req.json().catch(() => ({}));
    const parsed = DsarSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: "invalid_body", issues: parsed.error.issues }, 400);
    const [row] = await db.insert(dsarRequests).values({
      userId: userId as any,
      type: parsed.data.type,
      fulfillmentNotes: parsed.data.notes ?? null,
    }).returning();
    if (!row) return c.json({ error: "insert_failed" }, 500);
    return c.json({ ticketId: row.id, status: row.status, requestedAt: row.requestedAt }, 201);
  });
