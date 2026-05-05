import { pgTable, uuid, text, jsonb, integer, numeric, varchar, uniqueIndex } from "drizzle-orm/pg-core";

export const protocols = pgTable(
  "protocols",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 64 }).notNull(),
    name: jsonb("name").$type<Record<string, string>>().notNull(),
    description: jsonb("description").$type<Record<string, string>>(),
    pressureAta: numeric("pressure_ata", { precision: 3, scale: 2 }).notNull(),
    treatmentMin: integer("treatment_min").notNull(),
    totalMin: integer("total_min").notNull(),
    goalIds: jsonb("goal_ids").$type<string[]>().notNull().default([]),
    targetSessionCount: integer("target_session_count").notNull().default(40),
  },
  (t) => ({
    slugIdx: uniqueIndex("protocols_slug_idx").on(t.slug),
  }),
);
