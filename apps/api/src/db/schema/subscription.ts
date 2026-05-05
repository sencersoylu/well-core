import { pgEnum, pgTable, uuid, text, varchar, timestamp, index } from "drizzle-orm/pg-core";
import { authUser } from "./auth.js";

export const subscriptionPlanEnum = pgEnum("subscription_plan", ["free", "monthly", "yearly", "lifetime"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", ["active", "expired", "cancelled"]);

export const subscription = pgTable(
  "subscription",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull().references(() => authUser.id, { onDelete: "cascade" }),
    plan: subscriptionPlanEnum("plan").notNull().default("free"),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    appleTransactionId: varchar("apple_transaction_id", { length: 128 }),
    status: subscriptionStatusEnum("status").notNull().default("active"),
  },
  (t) => ({
    userIdx: index("subscription_user_idx").on(t.userId),
  }),
);
