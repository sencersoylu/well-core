import { pgEnum, pgTable, uuid, integer, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "./users.js";
import { protocols } from "./protocols.js";

export const userProtocolStatusEnum = pgEnum("user_protocol_status", [
  "active",
  "paused",
  "completed",
]);

export const userProtocols = pgTable(
  "user_protocols",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    protocolId: uuid("protocol_id").notNull().references(() => protocols.id, { onDelete: "restrict" }),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    targetSessionCount: integer("target_session_count").notNull(),
    status: userProtocolStatusEnum("status").notNull().default("active"),
    pausedAt: timestamp("paused_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (t) => ({
    userIdx: index("user_protocols_user_idx").on(t.userId),
  }),
);
