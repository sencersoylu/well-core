import { Hono } from "hono";
import { citations } from "@wellcore/shared/citations";

export const citationsRoute = new Hono()
  .get("/citations", (c) => {
    const items = Object.entries(citations).map(([tag, citation]) => ({ tag, ...citation }));
    return c.json(items);
  });
