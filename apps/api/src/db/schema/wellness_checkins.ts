import { pgEnum, pgTable, uuid, integer, text, timestamp, index } from "drizzle-orm/pg-core";
import { authUser } from "./auth.js";
import { hbotSessions } from "./hbot_sessions.js";

export const checkinTypeEnum = pgEnum("checkin_type", ["pre", "post"]);

export const wellnessCheckins = pgTable(
  "wellness_checkins",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull().references(() => authUser.id, { onDelete: "cascade" }),
    sessionId: uuid("session_id").references(() => hbotSessions.id, { onDelete: "set null" }),
    checkinType: checkinTypeEnum("checkin_type").notNull(),
    promisGlobalPhysical: integer("promis_global_physical").notNull(),
    promisGlobalMental: integer("promis_global_mental").notNull(),
    painLevel: integer("pain_level").notNull(),
    energyLevel: integer("energy_level").notNull(),
    sleepQuality: integer("sleep_quality").notNull(),
    focusLevel: integer("focus_level").notNull(),
    notes: text("notes"),
    recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index("checkins_user_idx").on(t.userId),
    sessionIdx: index("checkins_session_idx").on(t.sessionId),
  }),
);
