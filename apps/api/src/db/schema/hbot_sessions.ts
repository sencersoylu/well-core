import { pgEnum, pgTable, uuid, integer, timestamp, jsonb, numeric, index } from "drizzle-orm/pg-core";
import { users } from "./users.js";
import { userProtocols } from "./user_protocols.js";

export const sessionStatusEnum = pgEnum("session_status", [
  "in_progress",
  "completed",
  "aborted",
]);

export const hbotSessions = pgTable(
  "hbot_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    userProtocolId: uuid("user_protocol_id").references(() => userProtocols.id, { onDelete: "set null" }),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    totalDurationSec: integer("total_duration_sec").notNull().default(0),
    treatmentDurationSec: integer("treatment_duration_sec").notNull().default(0),
    pausedDurationSec: integer("paused_duration_sec").notNull().default(0),
    pressureAta: numeric("pressure_ata", { precision: 3, scale: 2 }).notNull(),
    status: sessionStatusEnum("status").notNull().default("in_progress"),
    clientState: jsonb("client_state").$type<Record<string, unknown>>(),
  },
  (t) => ({
    userIdx: index("hbot_sessions_user_idx").on(t.userId),
    startedIdx: index("hbot_sessions_started_idx").on(t.startedAt),
  }),
);
