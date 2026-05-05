import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { protocols } from "../db/schema/index.js";

export const protocolsRoute = new Hono()
  .get("/protocols", async (c) => {
    const rows = await db.select().from(protocols);
    return c.json(rows);
  })
  .get("/protocols/:slug", async (c) => {
    const slug = c.req.param("slug");
    const [row] = await db.select().from(protocols).where(eq(protocols.slug, slug)).limit(1);
    if (!row) return c.json({ error: "not_found" }, 404);
    return c.json(row);
  });
