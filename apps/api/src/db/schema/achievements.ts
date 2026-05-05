import { pgTable, uuid, text, varchar, jsonb, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";
import { authUser } from "./auth.js";

export const achievements = pgTable(
  "achievements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull().references(() => authUser.id, { onDelete: "cascade" }),
    achievementId: varchar("achievement_id", { length: 64 }).notNull(),
    unlockedAt: timestamp("unlocked_at", { withTimezone: true }).notNull().defaultNow(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  },
  (t) => ({
    userAchievementIdx: uniqueIndex("achievements_user_achievement_idx").on(t.userId, t.achievementId),
    userIdx: index("achievements_user_idx").on(t.userId),
  }),
);
