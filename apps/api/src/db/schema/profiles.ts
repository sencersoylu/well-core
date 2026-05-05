import { pgEnum, pgTable, uuid, text, timestamp, jsonb, date } from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const chamberTypeEnum = pgEnum("chamber_type", [
  "soft_1_3",
  "hard_1_5",
  "hard_2_0_plus",
]);

export const profiles = pgTable("profiles", {
  userId: uuid("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  displayName: text("display_name"),
  dob: date("dob"),
  goals: jsonb("goals").$type<string[]>().notNull().default([]),
  chamberType: chamberTypeEnum("chamber_type").notNull().default("soft_1_3"),
  acceptedDisclaimersAt: timestamp("accepted_disclaimers_at", { withTimezone: true }),
  fireSafetyAcknowledgedAt: timestamp("fire_safety_acknowledged_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
