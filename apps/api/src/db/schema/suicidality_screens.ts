import { integer, pgTable, uuid, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const suicidalityScreens = pgTable(
  "suicidality_screens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    phq9Item9Score: integer("phq9_item9_score").notNull(),
    followUpAcknowledgedAt: timestamp("follow_up_acknowledged_at", { withTimezone: true }),
    crisisResourcesShownAt: timestamp("crisis_resources_shown_at", { withTimezone: true }),
    recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index("suicidality_user_idx").on(t.userId),
  }),
);
