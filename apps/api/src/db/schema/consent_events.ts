import { pgEnum, pgTable, uuid, text, timestamp, varchar, index } from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const consentTypeEnum = pgEnum("consent_type", [
  "ccpa_optin",
  "mhmda_health_data",
  "modpa_health_data",
  "terms",
  "privacy",
]);

export const consentEvents = pgTable(
  "consent_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    type: consentTypeEnum("type").notNull(),
    version: varchar("version", { length: 32 }).notNull(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }).notNull().defaultNow(),
    ipAddress: varchar("ip_address", { length: 64 }),
    userAgent: text("user_agent"),
  },
  (t) => ({
    userIdx: index("consent_user_idx").on(t.userId),
  }),
);
