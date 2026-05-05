import { pgEnum, pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { authUser } from "./auth.js";

export const dsarTypeEnum = pgEnum("dsar_type", ["access", "deletion", "correction"]);
export const dsarStatusEnum = pgEnum("dsar_status", ["received", "in_progress", "fulfilled", "rejected"]);

export const dsarRequests = pgTable(
  "dsar_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull().references(() => authUser.id, { onDelete: "cascade" }),
    type: dsarTypeEnum("type").notNull(),
    status: dsarStatusEnum("status").notNull().default("received"),
    requestedAt: timestamp("requested_at", { withTimezone: true }).notNull().defaultNow(),
    fulfilledAt: timestamp("fulfilled_at", { withTimezone: true }),
    fulfillmentNotes: text("fulfillment_notes"),
  },
  (t) => ({
    userIdx: index("dsar_user_idx").on(t.userId),
  }),
);
