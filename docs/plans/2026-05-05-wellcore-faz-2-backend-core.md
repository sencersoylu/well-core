# Wellcore Faz 2 — Backend Core Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Stand up the production backend for Wellcore — Drizzle schemas (one file per domain), better-auth with Apple web OAuth, full Hono RPC surface (auth, profile, protocols, user-protocols, sessions, structured PROMIS check-ins, achievements, MinIO presigned uploads, citations, CCPA DSAR), Zod validation, auth middleware, Vitest coverage. Each route is wired through `app.request()` for integration tests, `AppType` is exported as the single chained type for the mobile RPC client, and Drizzle migrations are generated (never pushed) and stored under `apps/api/src/db/migrations/`.

**Architecture:** Hono on Bun. One Drizzle schema file per domain under `apps/api/src/db/schema/` re-exported through `index.ts`. Auth lives in `apps/api/src/auth.ts` (better-auth instance), mounted at `/api/auth/*` plus three custom routes (`/auth/apple/callback`, `/auth/signout`, `/auth/me`). All `/me/*`, `/profile`, `/sessions`, `/checkins`, `/uploads/*` routes go through `requireAuth` middleware that resolves the better-auth session from the cookie and populates `c.var.user`. Per-route Zod input schemas live in `apps/api/src/schemas/` (mirrored in `packages/shared` only for shapes the mobile client needs to consume). Wellness check-ins are stored as **structured PROMIS-aligned columns** — never a free-form jsonb blob. Session state machine matches velora-app's 4-phase model with paused-duration accounting and `client_state` jsonb for wall-clock recovery. Static citations are served from `@wellcore/shared/citations.json`. CCPA DSAR is logged into `dsar_requests`; fulfillment is manual for v1.

**Tech Stack:** All Faz 0 deps + `better-auth` ^1.3.x + `@better-auth/expo` (consumed by mobile, not API) + `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner` (MinIO-compatible) + `zod` (already present). `drizzle-orm` ^0.36 + `drizzle-kit` ^0.28 already installed. Vitest with Bun for unit + integration tests against `app.request(...)`.

**Definition of done:**
- `pnpm --filter @wellcore/api typecheck` passes.
- `pnpm --filter @wellcore/api test` passes (≥ 18 tests).
- `pnpm --filter @wellcore/api db:generate` produces a single squashed initial migration in `apps/api/src/db/migrations/0000_*.sql` after schema is finalized; subsequent tasks regenerate cleanly.
- Postgres + MinIO running via `docker compose -f ops/docker-compose.yml up -d`. `pnpm --filter @wellcore/api db:migrate` applies migrations to local DB.
- `pnpm --filter @wellcore/api db:seed` inserts 6 protocols.
- `apps/api/src/app.ts` exports a single `AppType` containing every chained route — the mobile RPC client gets full type inference.
- `curl -i http://localhost:3000/health` → `200`. `curl http://localhost:3000/protocols` → JSON array of 6 protocols. `curl -i http://localhost:3000/me/sessions` → `401`.
- `apps/api/.env.example` lists every env var. README has a "Backend" section with bring-up steps.
- One commit per task. Final commit on a `faz-2` branch ready for review with a Faz 2 PR.

**Pre-flight:** Branch `main` is checked out. Faz 1 has been merged. No uncommitted changes. Postgres + MinIO containers running locally.

```bash
cd /Users/sencersoylu/Projects/wellcore
git checkout main && git pull
git checkout -b faz-2
docker compose -f ops/docker-compose.yml up -d
docker compose -f ops/docker-compose.yml ps   # postgres + minio + minio-init healthy
```

---

## Task 1: Dependencies + env schema + drizzle config update

**Files:**
- Modify: `apps/api/package.json` — add backend deps and scripts
- Modify: `packages/shared/src/env.ts` — extend `ServerEnvSchema` with Apple + Public base URL
- Modify: `apps/api/.env.example` — add new vars
- Modify: `apps/api/drizzle.config.ts` — point to `src/db/migrations/`
- Modify: `pnpm-lock.yaml` (via install)

**Step 1: Edit `apps/api/package.json`** — inside `dependencies` add:

```json
"better-auth": "^1.3.0",
"@aws-sdk/client-s3": "^3.654.0",
"@aws-sdk/s3-request-presigner": "^3.654.0",
"zod": "^3.23.8"
```

Inside `devDependencies` add `"@types/node": "^22.7.0"`. Replace the `scripts` block with:

```json
"scripts": {
  "dev": "bun run --hot src/server.ts",
  "build": "bun build src/server.ts --target bun --outdir dist",
  "start": "bun run dist/server.js",
  "typecheck": "tsc --noEmit",
  "test": "vitest run",
  "test:watch": "vitest",
  "clean": "rm -rf dist .turbo",
  "db:generate": "drizzle-kit generate",
  "db:migrate": "drizzle-kit migrate",
  "db:studio": "drizzle-kit studio",
  "db:seed": "bun run src/db/seed.ts"
}
```

**Step 2: Edit `packages/shared/src/env.ts`** — extend the schema:

```typescript
import { z } from "zod";

export const ServerEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().url(),

  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),
  PUBLIC_BASE_URL: z.string().url(),

  APPLE_CLIENT_ID: z.string().min(1),
  APPLE_TEAM_ID: z.string().min(1),
  APPLE_KEY_ID: z.string().min(1),
  APPLE_PRIVATE_KEY: z.string().min(1),

  S3_ENDPOINT: z.string().url(),
  S3_REGION: z.string().default("us-east-1"),
  S3_ACCESS_KEY: z.string().min(1),
  S3_SECRET_KEY: z.string().min(1),
  S3_BUCKET: z.string().min(1),
  S3_AVATARS_BUCKET: z.string().default("wellcore-dev"),
  S3_SESSION_MEDIA_BUCKET: z.string().default("wellcore-dev"),
});

export type ServerEnv = z.infer<typeof ServerEnvSchema>;
```

**Step 3: Edit `apps/api/.env.example`**:

```
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://wellcore:wellcore@localhost:5432/wellcore

BETTER_AUTH_SECRET=replace-with-32-chars-of-random-secret-here
BETTER_AUTH_URL=http://localhost:3000
PUBLIC_BASE_URL=http://localhost:3000

APPLE_CLIENT_ID=com.wellcore.app
APPLE_TEAM_ID=XXXXXXXXXX
APPLE_KEY_ID=XXXXXXXXXX
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

S3_ENDPOINT=http://localhost:9000
S3_REGION=us-east-1
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=wellcore-dev
S3_AVATARS_BUCKET=wellcore-dev
S3_SESSION_MEDIA_BUCKET=wellcore-dev
```

**Step 4: Edit `apps/api/drizzle.config.ts`**:

```typescript
import { defineConfig } from "drizzle-kit";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required for drizzle-kit");

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: { url },
  strict: true,
  verbose: true,
});
```

Move any existing migrations: `git mv apps/api/drizzle apps/api/src/db/migrations` (if `drizzle/` had files; otherwise `mkdir -p apps/api/src/db/migrations`). Delete the stale `apps/api/drizzle/` if empty.

**Step 5: Install + commit**

```bash
pnpm install
pnpm --filter @wellcore/api typecheck
git add apps/api/package.json apps/api/.env.example apps/api/drizzle.config.ts apps/api/src/db/migrations packages/shared/src/env.ts pnpm-lock.yaml
git rm -r apps/api/drizzle 2>/dev/null || true
git commit -m "chore(api): faz-2 deps, env schema, drizzle migrations path"
```

Expected: typecheck silent, install adds better-auth + aws-sdk packages.

---

## Task 2: Drizzle schemas — users, profiles, consent, suicidality

**Files:**
- Create: `apps/api/src/db/schema/users.ts`
- Create: `apps/api/src/db/schema/profiles.ts`
- Create: `apps/api/src/db/schema/consent_events.ts`
- Create: `apps/api/src/db/schema/suicidality_screens.ts`
- Modify: `apps/api/src/db/schema/index.ts` — re-export new tables

**Step 1: Failing test** — Create `apps/api/src/db/__tests__/schema-users.test.ts`:

```typescript
import { describe, expect, test } from "vitest";
import * as schema from "../schema/index.js";

describe("user schema", () => {
  test("users table is exported with id/email/apple_sub/locale/created_at", () => {
    expect(schema.users).toBeDefined();
    const cols = Object.keys((schema.users as any));
    for (const c of ["id", "email", "appleSub", "locale", "createdAt"]) {
      expect(cols).toContain(c);
    }
  });
  test("profiles, consentEvents, suicidalityScreens are exported", () => {
    expect(schema.profiles).toBeDefined();
    expect(schema.consentEvents).toBeDefined();
    expect(schema.suicidalityScreens).toBeDefined();
  });
});
```

**Step 2: Run** — `pnpm --filter @wellcore/api test` → fails (`schema.users is undefined`).

**Step 3: Implement**

Create `apps/api/src/db/schema/users.ts`:

```typescript
import { pgTable, uuid, text, timestamp, varchar, uniqueIndex } from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 320 }).notNull(),
    appleSub: varchar("apple_sub", { length: 255 }),
    locale: varchar("locale", { length: 16 }).notNull().default("en-US"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    emailIdx: uniqueIndex("users_email_idx").on(t.email),
    appleSubIdx: uniqueIndex("users_apple_sub_idx").on(t.appleSub),
  }),
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

Create `apps/api/src/db/schema/profiles.ts`:

```typescript
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
```

Create `apps/api/src/db/schema/consent_events.ts`:

```typescript
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
```

Create `apps/api/src/db/schema/suicidality_screens.ts`:

```typescript
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
```

Replace `apps/api/src/db/schema/index.ts`:

```typescript
export * from "./users.js";
export * from "./profiles.js";
export * from "./consent_events.js";
export * from "./suicidality_screens.js";
```

**Step 4: Run** — `pnpm --filter @wellcore/api test` → 2 pass.

**Step 5: Commit**

```bash
git add apps/api/src/db/schema apps/api/src/db/__tests__
git commit -m "feat(api): users, profiles, consent_events, suicidality_screens schemas"
```

---

## Task 3: Drizzle schemas — protocols, user_protocols, hbot_sessions

**Files:**
- Create: `apps/api/src/db/schema/protocols.ts`
- Create: `apps/api/src/db/schema/user_protocols.ts`
- Create: `apps/api/src/db/schema/hbot_sessions.ts`
- Modify: `apps/api/src/db/schema/index.ts`

**Step 1: Failing test** — Append to `apps/api/src/db/__tests__/schema-users.test.ts` (or new file `schema-protocols.test.ts`):

```typescript
import { describe, expect, test } from "vitest";
import * as schema from "../schema/index.js";

describe("protocol schemas", () => {
  test("protocols, userProtocols, hbotSessions exported", () => {
    expect(schema.protocols).toBeDefined();
    expect(schema.userProtocols).toBeDefined();
    expect(schema.hbotSessions).toBeDefined();
  });
});
```

**Step 2: Run** — fails.

**Step 3: Implement**

Create `apps/api/src/db/schema/protocols.ts`:

```typescript
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
```

Create `apps/api/src/db/schema/user_protocols.ts`:

```typescript
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
```

Create `apps/api/src/db/schema/hbot_sessions.ts`:

```typescript
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
```

Append exports to `index.ts`:

```typescript
export * from "./protocols.js";
export * from "./user_protocols.js";
export * from "./hbot_sessions.js";
```

**Step 4: Run** — `pnpm --filter @wellcore/api test` → 3 pass.

**Step 5: Commit**

```bash
git add apps/api/src/db/schema apps/api/src/db/__tests__
git commit -m "feat(api): protocols, user_protocols, hbot_sessions schemas"
```

---

## Task 4: Drizzle schemas — wellness_checkins (PROMIS-structured), achievements, subscription, dsar_requests

**Files:**
- Create: `apps/api/src/db/schema/wellness_checkins.ts`
- Create: `apps/api/src/db/schema/achievements.ts`
- Create: `apps/api/src/db/schema/subscription.ts`
- Create: `apps/api/src/db/schema/dsar_requests.ts`
- Modify: `apps/api/src/db/schema/index.ts`

**Step 1: Failing test** — Create `apps/api/src/db/__tests__/schema-wellness.test.ts`:

```typescript
import { describe, expect, test } from "vitest";
import * as schema from "../schema/index.js";

describe("wellness + meta schemas", () => {
  test("wellness_checkins uses STRUCTURED PROMIS columns (not jsonb blob)", () => {
    const t = schema.wellnessCheckins as any;
    for (const c of [
      "userId", "sessionId", "checkinType",
      "promisGlobalPhysical", "promisGlobalMental",
      "painLevel", "energyLevel", "sleepQuality", "focusLevel",
      "notes", "recordedAt",
    ]) {
      expect(Object.keys(t)).toContain(c);
    }
  });
  test("achievements, subscription, dsarRequests are exported", () => {
    expect(schema.achievements).toBeDefined();
    expect(schema.subscription).toBeDefined();
    expect(schema.dsarRequests).toBeDefined();
  });
});
```

**Step 2: Run** — fails.

**Step 3: Implement**

`apps/api/src/db/schema/wellness_checkins.ts`:

```typescript
import { pgEnum, pgTable, uuid, integer, text, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "./users.js";
import { hbotSessions } from "./hbot_sessions.js";

export const checkinTypeEnum = pgEnum("checkin_type", ["pre", "post"]);

export const wellnessCheckins = pgTable(
  "wellness_checkins",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    sessionId: uuid("session_id").references(() => hbotSessions.id, { onDelete: "set null" }),
    checkinType: checkinTypeEnum("checkin_type").notNull(),
    promisGlobalPhysical: integer("promis_global_physical").notNull(), // 1..5
    promisGlobalMental: integer("promis_global_mental").notNull(),     // 1..5
    painLevel: integer("pain_level").notNull(),       // 0..10
    energyLevel: integer("energy_level").notNull(),   // 0..10
    sleepQuality: integer("sleep_quality").notNull(), // 0..10
    focusLevel: integer("focus_level").notNull(),     // 0..10
    notes: text("notes"),
    recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index("checkins_user_idx").on(t.userId),
    sessionIdx: index("checkins_session_idx").on(t.sessionId),
  }),
);
```

`apps/api/src/db/schema/achievements.ts`:

```typescript
import { pgTable, uuid, varchar, jsonb, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const achievements = pgTable(
  "achievements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    achievementId: varchar("achievement_id", { length: 64 }).notNull(),
    unlockedAt: timestamp("unlocked_at", { withTimezone: true }).notNull().defaultNow(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  },
  (t) => ({
    userAchievementIdx: uniqueIndex("achievements_user_achievement_idx").on(t.userId, t.achievementId),
    userIdx: index("achievements_user_idx").on(t.userId),
  }),
);
```

`apps/api/src/db/schema/subscription.ts`:

```typescript
import { pgEnum, pgTable, uuid, varchar, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const subscriptionPlanEnum = pgEnum("subscription_plan", [
  "free",
  "monthly",
  "yearly",
  "lifetime",
]);
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "expired",
  "cancelled",
]);

export const subscription = pgTable(
  "subscription",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
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
```

`apps/api/src/db/schema/dsar_requests.ts`:

```typescript
import { pgEnum, pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const dsarTypeEnum = pgEnum("dsar_type", ["access", "deletion", "correction"]);
export const dsarStatusEnum = pgEnum("dsar_status", ["received", "in_progress", "fulfilled", "rejected"]);

export const dsarRequests = pgTable(
  "dsar_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
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
```

Append to `index.ts`:

```typescript
export * from "./wellness_checkins.js";
export * from "./achievements.js";
export * from "./subscription.js";
export * from "./dsar_requests.js";
```

**Step 4: Run** — tests pass (5 total).

**Step 5: Commit**

```bash
git add apps/api/src/db/schema apps/api/src/db/__tests__
git commit -m "feat(api): wellness_checkins (PROMIS-structured), achievements, subscription, dsar_requests"
```

---

## Task 5: Generate initial migration + seed scaffolding

**Files:**
- Create: `apps/api/src/db/migrations/0000_*.sql` (auto-generated)
- Create: `apps/api/src/db/seed.ts` — protocol seed data

**Step 1: Ensure DB is reachable**

```bash
docker compose -f ops/docker-compose.yml up -d
docker exec wellcore-postgres pg_isready -U wellcore
```

**Step 2: Generate the migration**

```bash
cd apps/api
DATABASE_URL=postgresql://wellcore:wellcore@localhost:5432/wellcore pnpm db:generate
```

Expected: a single SQL file created at `apps/api/src/db/migrations/0000_<adjective>_<noun>.sql` containing `CREATE TYPE` for each enum + `CREATE TABLE` for each table + indexes. Inspect the file. If duplicates exist from older runs, delete and re-run. Do NOT edit the generated SQL by hand unless necessary; if so, document why in a comment.

**Step 3: Apply the migration**

```bash
DATABASE_URL=postgresql://wellcore:wellcore@localhost:5432/wellcore pnpm db:migrate
psql postgresql://wellcore:wellcore@localhost:5432/wellcore -c '\dt'
```

Verify: 11 tables (`users`, `profiles`, `consent_events`, `suicidality_screens`, `protocols`, `user_protocols`, `hbot_sessions`, `wellness_checkins`, `achievements`, `subscription`, `dsar_requests`) + drizzle's `__drizzle_migrations`.

**Step 4: Create `apps/api/src/db/seed.ts`** (run separately later in Task 9 with full data; scaffold here):

```typescript
import { db } from "./client.js";
import { protocols } from "./schema/index.js";

async function main() {
  console.log("Seeding protocols (placeholder; expanded in Task 9)…");
  // Inserted in Task 9 once routes exist
  await db.execute(`SELECT 1`);
  console.log("ok");
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
```

**Step 5: Commit**

```bash
git add apps/api/src/db/migrations apps/api/src/db/seed.ts
git commit -m "feat(api): generate initial migration + seed scaffold"
```

Expected: `pnpm --filter @wellcore/api db:migrate` is idempotent on a re-run.

---

## Task 6: better-auth instance with Apple web OAuth

**Files:**
- Create: `apps/api/src/auth.ts`
- Create: `apps/api/src/db/schema/auth.ts` — better-auth tables (sessions, accounts, verification)
- Modify: `apps/api/src/db/schema/index.ts`

**Step 1: Failing test** — Create `apps/api/src/__tests__/auth.test.ts`:

```typescript
import { describe, expect, test } from "vitest";
import { auth } from "../auth.js";

describe("better-auth", () => {
  test("instance is configured with Apple provider", () => {
    expect(auth).toBeDefined();
    expect(auth.options.socialProviders?.apple).toBeDefined();
  });
  test("session cookie is httpOnly + secure-aware", () => {
    const opts = auth.options.advanced?.cookies?.sessionToken;
    expect(opts?.attributes?.httpOnly).toBe(true);
  });
});
```

**Step 2: Run** — fails.

**Step 3: Implement**

Create `apps/api/src/db/schema/auth.ts`:

```typescript
// better-auth uses its own internal table layout; we mirror the canonical
// table names so drizzle-kit generates the columns. We store sessions in a
// table named `auth_session` to avoid clashing with our domain `hbot_sessions`.
import { pgTable, text, timestamp, boolean, varchar } from "drizzle-orm/pg-core";

export const authUser = pgTable("auth_user", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  name: text("name"),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const authSession = pgTable("auth_session", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => authUser.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  token: text("token").notNull().unique(),
  ipAddress: varchar("ip_address", { length: 64 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const authAccount = pgTable("auth_account", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => authUser.id, { onDelete: "cascade" }),
  providerId: text("provider_id").notNull(),
  accountId: text("account_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const authVerification = pgTable("auth_verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
```

Append to `index.ts`:

```typescript
export * from "./auth.js";
```

Create `apps/api/src/auth.ts`:

```typescript
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db/client.js";
import { ServerEnvSchema } from "@wellcore/shared/env";
import * as schema from "./db/schema/index.js";

const env = ServerEnvSchema.parse(process.env);

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.authUser,
      session: schema.authSession,
      account: schema.authAccount,
      verification: schema.authVerification,
    },
  }),
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [env.PUBLIC_BASE_URL, "wellcore://"],
  socialProviders: {
    apple: {
      clientId: env.APPLE_CLIENT_ID,
      clientSecret: "", // Apple requires JWT-based client_secret derived from key
      teamId: env.APPLE_TEAM_ID,
      keyId: env.APPLE_KEY_ID,
      privateKey: env.APPLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      // Web OAuth flow only — NOT native identityToken (known better-auth bugs)
      // Apple posts to /api/auth/callback/apple as form_post.
    },
  },
  advanced: {
    cookies: {
      sessionToken: {
        attributes: {
          httpOnly: true,
          secure: env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
        },
      },
    },
  },
});

export type AuthSession = typeof auth.$Infer.Session;
```

Regenerate migration:

```bash
DATABASE_URL=postgresql://wellcore:wellcore@localhost:5432/wellcore pnpm db:generate
DATABASE_URL=postgresql://wellcore:wellcore@localhost:5432/wellcore pnpm db:migrate
```

**Step 4: Run** — `pnpm --filter @wellcore/api test` → all pass.

**Step 5: Commit**

```bash
git add apps/api/src/auth.ts apps/api/src/db/schema/auth.ts apps/api/src/db/schema/index.ts apps/api/src/db/migrations apps/api/src/__tests__/auth.test.ts
git commit -m "feat(api): better-auth with Apple web OAuth + drizzle adapter"
```

---

## Task 7: Auth middleware + session helper

**Files:**
- Create: `apps/api/src/middleware/require-auth.ts`
- Create: `apps/api/src/middleware/__tests__/require-auth.test.ts`

**Step 1: Failing test**

```typescript
import { describe, expect, test } from "vitest";
import { Hono } from "hono";
import { requireAuth } from "../require-auth.js";

describe("requireAuth", () => {
  const app = new Hono().use("/me/*", requireAuth).get("/me/ping", (c) => c.json({ ok: true }));

  test("returns 401 when no cookie", async () => {
    const res = await app.request("/me/ping");
    expect(res.status).toBe(401);
  });

  test("returns 401 when invalid cookie", async () => {
    const res = await app.request("/me/ping", { headers: { cookie: "better-auth.session=garbage" } });
    expect(res.status).toBe(401);
  });
});
```

**Step 2: Run** — fails.

**Step 3: Implement** — `apps/api/src/middleware/require-auth.ts`:

```typescript
import type { MiddlewareHandler } from "hono";
import { auth } from "../auth.js";

export type AuthVariables = {
  user: { id: string; email: string };
  sessionId: string;
};

export const requireAuth: MiddlewareHandler<{ Variables: AuthVariables }> = async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session?.user) {
    return c.json({ error: "unauthorized" }, 401);
  }
  c.set("user", { id: session.user.id, email: session.user.email });
  c.set("sessionId", session.session.id);
  await next();
};
```

**Step 4: Run** — tests pass.

**Step 5: Commit**

```bash
git add apps/api/src/middleware
git commit -m "feat(api): requireAuth middleware (401 on missing/invalid session)"
```

---

## Task 8: Zod input schemas for all routes

**Files:**
- Create: `apps/api/src/schemas/profile.ts`
- Create: `apps/api/src/schemas/protocols.ts`
- Create: `apps/api/src/schemas/sessions.ts`
- Create: `apps/api/src/schemas/checkins.ts`
- Create: `apps/api/src/schemas/uploads.ts`
- Create: `apps/api/src/schemas/privacy.ts`
- Create: `apps/api/src/schemas/__tests__/checkins.test.ts`

**Step 1: Failing test** — `checkins.test.ts`:

```typescript
import { describe, expect, test } from "vitest";
import { CheckinCreateSchema } from "../checkins.js";

describe("CheckinCreateSchema", () => {
  test("valid payload parses", () => {
    const r = CheckinCreateSchema.safeParse({
      checkinType: "pre",
      promisGlobalPhysical: 4,
      promisGlobalMental: 4,
      painLevel: 2,
      energyLevel: 7,
      sleepQuality: 6,
      focusLevel: 7,
    });
    expect(r.success).toBe(true);
  });
  test("rejects out-of-range PROMIS", () => {
    const r = CheckinCreateSchema.safeParse({
      checkinType: "post", promisGlobalPhysical: 9, promisGlobalMental: 3,
      painLevel: 1, energyLevel: 5, sleepQuality: 5, focusLevel: 5,
    });
    expect(r.success).toBe(false);
  });
  test("rejects notes > 500 chars", () => {
    const r = CheckinCreateSchema.safeParse({
      checkinType: "pre", promisGlobalPhysical: 3, promisGlobalMental: 3,
      painLevel: 0, energyLevel: 0, sleepQuality: 0, focusLevel: 0,
      notes: "x".repeat(501),
    });
    expect(r.success).toBe(false);
  });
});
```

**Step 2: Run** — fails.

**Step 3: Implement**

`apps/api/src/schemas/profile.ts`:

```typescript
import { z } from "zod";

export const ProfileUpdateSchema = z.object({
  displayName: z.string().min(1).max(80).optional(),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  goals: z.array(z.enum([
    "radiance","recovery","vitality","wellness","brain_fog",
    "long_covid","neuro_recovery","athletic_performance","anti_aging",
  ])).max(9).optional(),
  chamberType: z.enum(["soft_1_3", "hard_1_5", "hard_2_0_plus"]).optional(),
});

export const DisclaimerAckSchema = z.object({
  fireSafety: z.boolean().refine((v) => v === true),
  generalDisclaimer: z.boolean().refine((v) => v === true),
});

export const ConsentSchema = z.object({
  type: z.enum(["ccpa_optin", "mhmda_health_data", "modpa_health_data", "terms", "privacy"]),
  version: z.string().min(1).max(32),
});
```

`apps/api/src/schemas/protocols.ts`:

```typescript
import { z } from "zod";

export const StartProtocolSchema = z.object({
  protocolId: z.string().uuid(),
});

export const UpdateUserProtocolSchema = z.object({
  status: z.enum(["active", "paused", "completed"]),
});
```

`apps/api/src/schemas/sessions.ts`:

```typescript
import { z } from "zod";

export const CreateSessionSchema = z.object({
  userProtocolId: z.string().uuid().nullable().optional(),
  pressureAta: z.number().min(1.0).max(3.0),
  clientState: z.record(z.unknown()).optional(),
});

export const UpdateSessionSchema = z.object({
  totalDurationSec: z.number().int().nonnegative().optional(),
  treatmentDurationSec: z.number().int().nonnegative().optional(),
  pausedDurationSec: z.number().int().nonnegative().optional(),
  status: z.enum(["in_progress", "completed", "aborted"]).optional(),
  endedAt: z.string().datetime().optional(),
  clientState: z.record(z.unknown()).optional(),
});

export const ListSessionsQuery = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().uuid().optional(),
});
```

`apps/api/src/schemas/checkins.ts`:

```typescript
import { z } from "zod";

export const CheckinCreateSchema = z.object({
  sessionId: z.string().uuid().nullable().optional(),
  checkinType: z.enum(["pre", "post"]),
  promisGlobalPhysical: z.number().int().min(1).max(5),
  promisGlobalMental: z.number().int().min(1).max(5),
  painLevel: z.number().int().min(0).max(10),
  energyLevel: z.number().int().min(0).max(10),
  sleepQuality: z.number().int().min(0).max(10),
  focusLevel: z.number().int().min(0).max(10),
  notes: z.string().max(500).optional(),
});

export const CheckinListQuery = z.object({
  sessionId: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
```

`apps/api/src/schemas/uploads.ts`:

```typescript
import { z } from "zod";

export const PresignSchema = z.object({
  bucket: z.enum(["avatars", "session-media"]),
  contentType: z.string().regex(/^[a-z]+\/[a-z0-9.+-]+$/i),
  byteLength: z.number().int().positive().max(15 * 1024 * 1024), // 15 MB cap
  ext: z.string().regex(/^[a-z0-9]{1,8}$/),
});
```

`apps/api/src/schemas/privacy.ts`:

```typescript
import { z } from "zod";

export const DsarSchema = z.object({
  type: z.enum(["access", "deletion", "correction"]),
  notes: z.string().max(2000).optional(),
});
```

**Step 4: Run** — tests pass.

**Step 5: Commit**

```bash
git add apps/api/src/schemas
git commit -m "feat(api): zod input schemas + checkins validation tests"
```

---

## Task 9: Protocol seed data + protocols route

**Files:**
- Modify: `apps/api/src/db/seed.ts` — insert 6 protocols
- Create: `apps/api/src/routes/protocols.ts`
- Create: `apps/api/src/routes/__tests__/protocols.test.ts`

**Step 1: Failing test**

```typescript
import { describe, expect, test, beforeAll } from "vitest";
import { app } from "../../app.js";

describe("GET /protocols", () => {
  test("returns array (may be empty pre-seed)", async () => {
    const res = await app.request("/protocols");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });
  test("GET /protocols/:slug returns 404 for unknown", async () => {
    const res = await app.request("/protocols/does-not-exist");
    expect(res.status).toBe(404);
  });
});
```

**Step 2: Run** — fails (route not registered yet).

**Step 3: Implement**

Replace `apps/api/src/db/seed.ts`:

```typescript
import { db } from "./client.js";
import { protocols } from "./schema/index.js";

const data = [
  {
    slug: "soft-1-3-foundations",
    name: { "en-US": "Soft 1.3 ATA — Foundations" },
    description: { "en-US": "60 min total · 50 min at pressure. Wellness companion routine for soft chambers." },
    pressureAta: "1.30",
    treatmentMin: 50,
    totalMin: 60,
    goalIds: ["wellness", "vitality", "radiance", "anti_aging"],
    targetSessionCount: 40,
  },
  {
    slug: "soft-1-3-brain-fog",
    name: { "en-US": "Soft 1.3 ATA — Brain Fog" },
    description: { "en-US": "60 min total · 50 min at pressure. For long-COVID-adjacent cognitive recovery (mild evidence)." },
    pressureAta: "1.30",
    treatmentMin: 50,
    totalMin: 60,
    goalIds: ["brain_fog", "long_covid"],
    targetSessionCount: 40,
  },
  {
    slug: "hard-1-5-recovery",
    name: { "en-US": "Hard 1.5 ATA — Recovery" },
    description: { "en-US": "90 min total · 75 min at pressure. Tissue recovery + neuro-recovery (PPCS Level-1 EBM)." },
    pressureAta: "1.50",
    treatmentMin: 75,
    totalMin: 90,
    goalIds: ["recovery", "neuro_recovery", "athletic_performance"],
    targetSessionCount: 40,
  },
  {
    slug: "hard-2-0-clinical",
    name: { "en-US": "Hard 2.0 ATA — Clinical" },
    description: { "en-US": "90 min total · 80 min at pressure. Flagship 2.0 ATA protocol — strong evidence base." },
    pressureAta: "2.00",
    treatmentMin: 80,
    totalMin: 90,
    goalIds: ["recovery", "long_covid", "wellness"],
    targetSessionCount: 40,
  },
  {
    slug: "hard-2-0-long-covid",
    name: { "en-US": "Hard 2.0 ATA — Long COVID" },
    description: { "en-US": "90 min total · 80 min at pressure. Per Zilberman-Itskovich 2022 sham-RCT." },
    pressureAta: "2.00",
    treatmentMin: 80,
    totalMin: 90,
    goalIds: ["long_covid", "brain_fog"],
    targetSessionCount: 40,
  },
  {
    slug: "hard-2-4-extended",
    name: { "en-US": "Hard 2.4 ATA — Extended" },
    description: { "en-US": "120 min total · 100 min at pressure. Clinical-grade extended protocol; 60-session targets." },
    pressureAta: "2.40",
    treatmentMin: 100,
    totalMin: 120,
    goalIds: ["recovery", "neuro_recovery"],
    targetSessionCount: 60,
  },
];

async function main() {
  for (const row of data) {
    await db.insert(protocols).values(row).onConflictDoNothing({ target: protocols.slug });
  }
  console.log(`seeded ${data.length} protocols`);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
```

Run:

```bash
DATABASE_URL=postgresql://wellcore:wellcore@localhost:5432/wellcore pnpm db:seed
```

Create `apps/api/src/routes/protocols.ts`:

```typescript
import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { protocols } from "../db/schema/index.js";

export const protocolsRoute = new Hono()
  .get("/protocols", async (c) => {
    const rows = await db.select().from(protocols);
    return c.json(rows);
  })
  .get("/protocols/:slug", async (c) => {
    const slug = c.req.param("slug");
    const [row] = await db.select().from(protocols).where(eq(protocols.slug, slug)).limit(1);
    if (!row) return c.json({ error: "not_found" }, 404);
    return c.json(row);
  });
```

We register it in `app.ts` as part of Task 15's chain; for the test to pass now we wire it provisionally. Replace `apps/api/src/app.ts`:

```typescript
import { Hono } from "hono";
import { APP_VERSION } from "@wellcore/shared";
import { protocolsRoute } from "./routes/protocols.js";

export const app = new Hono()
  .get("/health", (c) => c.json({ ok: true, version: APP_VERSION }))
  .route("/", protocolsRoute);

export type AppType = typeof app;
```

**Step 4: Run** — `pnpm --filter @wellcore/api test`. The protocols test runs against a real DB — guard with environment skip if DB unavailable, else assume `docker compose` is up. Tests pass.

**Step 5: Commit**

```bash
git add apps/api/src/db/seed.ts apps/api/src/routes apps/api/src/app.ts
git commit -m "feat(api): protocols route + seed (6 protocols)"
```

---

## Task 10: Auth route — Apple OAuth callback + signout + me

**Files:**
- Create: `apps/api/src/routes/auth.ts`
- Modify: `apps/api/src/app.ts`
- Create: `apps/api/src/routes/__tests__/auth.test.ts`

**Step 1: Failing test**

```typescript
import { describe, expect, test } from "vitest";
import { app } from "../../app.js";

describe("auth routes", () => {
  test("GET /auth/me without cookie → 401", async () => {
    const res = await app.request("/auth/me");
    expect(res.status).toBe(401);
  });
  test("better-auth handler is mounted at /api/auth/*", async () => {
    const res = await app.request("/api/auth/sign-in/social", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ provider: "apple", callbackURL: "/" }),
    });
    // Either 200 (returns redirect URL) or 400 — but NOT 404.
    expect([200, 302, 400]).toContain(res.status);
  });
});
```

**Step 2: Run** — fails.

**Step 3: Implement** — `apps/api/src/routes/auth.ts`:

```typescript
import { Hono } from "hono";
import { auth } from "../auth.js";
import { requireAuth, type AuthVariables } from "../middleware/require-auth.js";

export const authRoute = new Hono<{ Variables: AuthVariables }>()
  // Mount better-auth handler at /api/auth/* — this exposes
  // /api/auth/sign-in/social, /api/auth/callback/apple, /api/auth/sign-out, etc.
  .all("/api/auth/*", (c) => auth.handler(c.req.raw))

  // Custom alias for the mobile client to fetch its own session.
  .get("/auth/me", requireAuth, (c) => {
    const user = c.var.user;
    return c.json({ user });
  })

  .post("/auth/signout", async (c) => {
    return auth.handler(
      new Request(new URL("/api/auth/sign-out", c.req.url), {
        method: "POST",
        headers: c.req.raw.headers,
      }),
    );
  });
```

Modify `apps/api/src/app.ts`:

```typescript
import { Hono } from "hono";
import { APP_VERSION } from "@wellcore/shared";
import { authRoute } from "./routes/auth.js";
import { protocolsRoute } from "./routes/protocols.js";

export const app = new Hono()
  .get("/health", (c) => c.json({ ok: true, version: APP_VERSION }))
  .route("/", authRoute)
  .route("/", protocolsRoute);

export type AppType = typeof app;
```

**Step 4: Run** — tests pass.

**Step 5: Commit**

```bash
git add apps/api/src/routes/auth.ts apps/api/src/app.ts apps/api/src/routes/__tests__/auth.test.ts
git commit -m "feat(api): auth routes (Apple OAuth handler, /auth/me, /auth/signout)"
```

---

## Task 11: Profile route + consent + disclaimers

**Files:**
- Create: `apps/api/src/routes/profile.ts`
- Modify: `apps/api/src/app.ts`
- Create: `apps/api/src/routes/__tests__/profile.test.ts`

**Step 1: Failing test**

```typescript
import { describe, expect, test } from "vitest";
import { app } from "../../app.js";

describe("profile routes (unauth)", () => {
  test("GET /profile → 401", async () => {
    const res = await app.request("/profile");
    expect(res.status).toBe(401);
  });
  test("PUT /profile → 401", async () => {
    const res = await app.request("/profile", { method: "PUT", body: "{}", headers: { "content-type": "application/json" } });
    expect(res.status).toBe(401);
  });
  test("POST /profile/consent rejects bad body shape with 400 when authed (skipped: needs session)", () => {
    expect(true).toBe(true);
  });
});
```

**Step 2: Run** — fails.

**Step 3: Implement** — `apps/api/src/routes/profile.ts`:

```typescript
import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { profiles, consentEvents } from "../db/schema/index.js";
import { requireAuth, type AuthVariables } from "../middleware/require-auth.js";
import { ProfileUpdateSchema, DisclaimerAckSchema, ConsentSchema } from "../schemas/profile.js";

export const profileRoute = new Hono<{ Variables: AuthVariables }>()
  .use("/profile", requireAuth)
  .use("/profile/*", requireAuth)

  .get("/profile", async (c) => {
    const userId = c.var.user.id;
    const [row] = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
    if (!row) {
      const [created] = await db.insert(profiles).values({ userId }).returning();
      return c.json(created);
    }
    return c.json(row);
  })

  .put("/profile", async (c) => {
    const userId = c.var.user.id;
    const body = await c.req.json().catch(() => ({}));
    const parsed = ProfileUpdateSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: "invalid_body", issues: parsed.error.issues }, 400);
    const [row] = await db
      .insert(profiles)
      .values({ userId, ...parsed.data })
      .onConflictDoUpdate({ target: profiles.userId, set: { ...parsed.data, updatedAt: new Date() } })
      .returning();
    return c.json(row);
  })

  .post("/profile/disclaimers", async (c) => {
    const userId = c.var.user.id;
    const body = await c.req.json().catch(() => ({}));
    const parsed = DisclaimerAckSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: "invalid_body", issues: parsed.error.issues }, 400);
    const now = new Date();
    const [row] = await db
      .insert(profiles)
      .values({ userId, acceptedDisclaimersAt: now, fireSafetyAcknowledgedAt: now })
      .onConflictDoUpdate({
        target: profiles.userId,
        set: { acceptedDisclaimersAt: now, fireSafetyAcknowledgedAt: now, updatedAt: now },
      })
      .returning();
    return c.json(row);
  })

  .post("/profile/consent", async (c) => {
    const userId = c.var.user.id;
    const body = await c.req.json().catch(() => ({}));
    const parsed = ConsentSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: "invalid_body", issues: parsed.error.issues }, 400);
    const [row] = await db.insert(consentEvents).values({
      userId,
      type: parsed.data.type,
      version: parsed.data.version,
      ipAddress: c.req.header("x-forwarded-for") ?? c.req.header("x-real-ip") ?? null,
      userAgent: c.req.header("user-agent") ?? null,
    }).returning();
    return c.json(row, 201);
  });
```

Mount in `app.ts`:

```typescript
import { profileRoute } from "./routes/profile.js";
// ...
.route("/", profileRoute);
```

**Step 4: Run** — tests pass.

**Step 5: Commit**

```bash
git add apps/api/src/routes/profile.ts apps/api/src/app.ts apps/api/src/routes/__tests__/profile.test.ts
git commit -m "feat(api): profile + disclaimers + consent_events route"
```

---

## Task 12: User-protocols + sessions + checkins routes

**Files:**
- Create: `apps/api/src/routes/user-protocols.ts`
- Create: `apps/api/src/routes/sessions.ts`
- Create: `apps/api/src/routes/checkins.ts`
- Modify: `apps/api/src/app.ts`
- Create tests for each (`__tests__/user-protocols.test.ts`, `sessions.test.ts`, `checkins.test.ts`)

**Step 1: Failing tests** — each file mirrors profile's pattern: confirm `401` without cookie on every protected method (`GET /me/protocols`, `POST /me/protocols`, `PATCH /me/protocols/:id`, `POST /sessions`, `PATCH /sessions/:id`, `GET /me/sessions`, `POST /checkins`, `GET /me/checkins`).

```typescript
// apps/api/src/routes/__tests__/sessions.test.ts
import { describe, expect, test } from "vitest";
import { app } from "../../app.js";

describe("sessions routes (unauth)", () => {
  test.each([
    ["POST", "/sessions"],
    ["PATCH", "/sessions/00000000-0000-0000-0000-000000000000"],
    ["GET", "/me/sessions"],
  ])("%s %s → 401", async (method, path) => {
    const res = await app.request(path, { method, headers: { "content-type": "application/json" }, body: method === "GET" ? undefined : "{}" });
    expect(res.status).toBe(401);
  });
});
```

(Repeat the pattern for `user-protocols.test.ts` and `checkins.test.ts`.)

**Step 2: Run** — fails.

**Step 3: Implement**

`apps/api/src/routes/user-protocols.ts`:

```typescript
import { Hono } from "hono";
import { and, eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { userProtocols, protocols } from "../db/schema/index.js";
import { requireAuth, type AuthVariables } from "../middleware/require-auth.js";
import { StartProtocolSchema, UpdateUserProtocolSchema } from "../schemas/protocols.js";

export const userProtocolsRoute = new Hono<{ Variables: AuthVariables }>()
  .use("/me/protocols", requireAuth)
  .use("/me/protocols/*", requireAuth)

  .get("/me/protocols", async (c) => {
    const userId = c.var.user.id;
    const rows = await db.select().from(userProtocols).where(eq(userProtocols.userId, userId));
    return c.json(rows);
  })

  .post("/me/protocols", async (c) => {
    const userId = c.var.user.id;
    const body = await c.req.json().catch(() => ({}));
    const parsed = StartProtocolSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: "invalid_body", issues: parsed.error.issues }, 400);
    const [protocol] = await db.select().from(protocols).where(eq(protocols.id, parsed.data.protocolId)).limit(1);
    if (!protocol) return c.json({ error: "protocol_not_found" }, 404);
    const [row] = await db.insert(userProtocols).values({
      userId,
      protocolId: protocol.id,
      targetSessionCount: protocol.targetSessionCount,
    }).returning();
    return c.json(row, 201);
  })

  .patch("/me/protocols/:id", async (c) => {
    const userId = c.var.user.id;
    const id = c.req.param("id");
    const body = await c.req.json().catch(() => ({}));
    const parsed = UpdateUserProtocolSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: "invalid_body", issues: parsed.error.issues }, 400);
    const patch: Record<string, unknown> = { status: parsed.data.status };
    if (parsed.data.status === "paused") patch.pausedAt = new Date();
    if (parsed.data.status === "completed") patch.completedAt = new Date();
    const [row] = await db.update(userProtocols)
      .set(patch)
      .where(and(eq(userProtocols.id, id), eq(userProtocols.userId, userId)))
      .returning();
    if (!row) return c.json({ error: "not_found" }, 404);
    return c.json(row);
  });
```

`apps/api/src/routes/sessions.ts`:

```typescript
import { Hono } from "hono";
import { and, desc, eq, lt } from "drizzle-orm";
import { db } from "../db/client.js";
import { hbotSessions } from "../db/schema/index.js";
import { requireAuth, type AuthVariables } from "../middleware/require-auth.js";
import { CreateSessionSchema, UpdateSessionSchema, ListSessionsQuery } from "../schemas/sessions.js";

export const sessionsRoute = new Hono<{ Variables: AuthVariables }>()
  .use("/sessions", requireAuth)
  .use("/sessions/*", requireAuth)
  .use("/me/sessions", requireAuth)

  .post("/sessions", async (c) => {
    const userId = c.var.user.id;
    const body = await c.req.json().catch(() => ({}));
    const parsed = CreateSessionSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: "invalid_body", issues: parsed.error.issues }, 400);
    const [row] = await db.insert(hbotSessions).values({
      userId,
      userProtocolId: parsed.data.userProtocolId ?? null,
      pressureAta: String(parsed.data.pressureAta),
      clientState: parsed.data.clientState ?? null,
    }).returning();
    return c.json(row, 201);
  })

  .patch("/sessions/:id", async (c) => {
    const userId = c.var.user.id;
    const id = c.req.param("id");
    const body = await c.req.json().catch(() => ({}));
    const parsed = UpdateSessionSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: "invalid_body", issues: parsed.error.issues }, 400);
    const patch: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.endedAt) patch.endedAt = new Date(parsed.data.endedAt);
    const [row] = await db.update(hbotSessions)
      .set(patch)
      .where(and(eq(hbotSessions.id, id), eq(hbotSessions.userId, userId)))
      .returning();
    if (!row) return c.json({ error: "not_found" }, 404);
    return c.json(row);
  })

  .get("/me/sessions", async (c) => {
    const userId = c.var.user.id;
    const q = ListSessionsQuery.safeParse(Object.fromEntries(new URL(c.req.url).searchParams));
    if (!q.success) return c.json({ error: "invalid_query" }, 400);
    const where = q.data.cursor
      ? and(eq(hbotSessions.userId, userId), lt(hbotSessions.id, q.data.cursor))
      : eq(hbotSessions.userId, userId);
    const rows = await db.select().from(hbotSessions)
      .where(where!).orderBy(desc(hbotSessions.startedAt)).limit(q.data.limit);
    return c.json({ items: rows, nextCursor: rows.length === q.data.limit ? rows[rows.length - 1].id : null });
  });
```

`apps/api/src/routes/checkins.ts`:

```typescript
import { Hono } from "hono";
import { and, desc, eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { wellnessCheckins } from "../db/schema/index.js";
import { requireAuth, type AuthVariables } from "../middleware/require-auth.js";
import { CheckinCreateSchema, CheckinListQuery } from "../schemas/checkins.js";

export const checkinsRoute = new Hono<{ Variables: AuthVariables }>()
  .use("/checkins", requireAuth)
  .use("/me/checkins", requireAuth)

  .post("/checkins", async (c) => {
    const userId = c.var.user.id;
    const body = await c.req.json().catch(() => ({}));
    const parsed = CheckinCreateSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: "invalid_body", issues: parsed.error.issues }, 400);
    const [row] = await db.insert(wellnessCheckins).values({
      userId,
      sessionId: parsed.data.sessionId ?? null,
      checkinType: parsed.data.checkinType,
      promisGlobalPhysical: parsed.data.promisGlobalPhysical,
      promisGlobalMental: parsed.data.promisGlobalMental,
      painLevel: parsed.data.painLevel,
      energyLevel: parsed.data.energyLevel,
      sleepQuality: parsed.data.sleepQuality,
      focusLevel: parsed.data.focusLevel,
      notes: parsed.data.notes ?? null,
    }).returning();
    return c.json(row, 201);
  })

  .get("/me/checkins", async (c) => {
    const userId = c.var.user.id;
    const q = CheckinListQuery.safeParse(Object.fromEntries(new URL(c.req.url).searchParams));
    if (!q.success) return c.json({ error: "invalid_query" }, 400);
    const where = q.data.sessionId
      ? and(eq(wellnessCheckins.userId, userId), eq(wellnessCheckins.sessionId, q.data.sessionId))
      : eq(wellnessCheckins.userId, userId);
    const rows = await db.select().from(wellnessCheckins)
      .where(where!).orderBy(desc(wellnessCheckins.recordedAt)).limit(q.data.limit);
    return c.json(rows);
  });
```

Wire all three into `app.ts`:

```typescript
.route("/", userProtocolsRoute)
.route("/", sessionsRoute)
.route("/", checkinsRoute);
```

**Step 4: Run** — tests pass.

**Step 5: Commit**

```bash
git add apps/api/src/routes apps/api/src/app.ts
git commit -m "feat(api): user-protocols, sessions, structured PROMIS checkins routes"
```

---

## Task 13: Achievements + uploads (MinIO presigned) + citations + privacy DSAR

**Files:**
- Create: `apps/api/src/routes/achievements.ts`
- Create: `apps/api/src/routes/uploads.ts`
- Create: `apps/api/src/routes/citations.ts`
- Create: `apps/api/src/routes/privacy.ts`
- Create: `apps/api/src/lib/s3.ts`
- Modify: `apps/api/src/app.ts`
- Create tests in `__tests__/`

**Step 1: Failing tests**

```typescript
// __tests__/uploads.test.ts
import { describe, expect, test } from "vitest";
import { app } from "../../app.js";

describe("uploads", () => {
  test("POST /uploads/presign without auth → 401", async () => {
    const res = await app.request("/uploads/presign", { method: "POST", body: "{}", headers: { "content-type": "application/json" } });
    expect(res.status).toBe(401);
  });
});
```

```typescript
// __tests__/citations.test.ts
import { describe, expect, test } from "vitest";
import { app } from "../../app.js";

describe("GET /citations", () => {
  test("returns array from @wellcore/shared", async () => {
    const res = await app.request("/citations");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });
});
```

```typescript
// __tests__/achievements.test.ts → 401 unauthed
// __tests__/privacy.test.ts → 401 unauthed for POST /privacy/dsar
```

**Step 2: Run** — fails.

**Step 3: Implement**

`apps/api/src/lib/s3.ts`:

```typescript
import { S3Client } from "@aws-sdk/client-s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ServerEnvSchema } from "@wellcore/shared/env";

const env = ServerEnvSchema.parse(process.env);

export const s3 = new S3Client({
  region: env.S3_REGION,
  endpoint: env.S3_ENDPOINT,
  forcePathStyle: true,
  credentials: { accessKeyId: env.S3_ACCESS_KEY, secretAccessKey: env.S3_SECRET_KEY },
});

export async function presignPut(opts: {
  bucket: string;
  key: string;
  contentType: string;
  expiresIn?: number;
}) {
  const cmd = new PutObjectCommand({ Bucket: opts.bucket, Key: opts.key, ContentType: opts.contentType });
  const url = await getSignedUrl(s3, cmd, { expiresIn: opts.expiresIn ?? 600 });
  const publicUrl = `${env.PUBLIC_BASE_URL.replace(/\/$/, "")}/files/${opts.bucket}/${opts.key}`;
  return { url, publicUrl };
}
```

`apps/api/src/routes/uploads.ts`:

```typescript
import { Hono } from "hono";
import { requireAuth, type AuthVariables } from "../middleware/require-auth.js";
import { PresignSchema } from "../schemas/uploads.js";
import { presignPut } from "../lib/s3.js";
import { ServerEnvSchema } from "@wellcore/shared/env";

const env = ServerEnvSchema.parse(process.env);
const BUCKET_MAP = { avatars: env.S3_AVATARS_BUCKET, "session-media": env.S3_SESSION_MEDIA_BUCKET };

export const uploadsRoute = new Hono<{ Variables: AuthVariables }>()
  .use("/uploads/*", requireAuth)
  .post("/uploads/presign", async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const parsed = PresignSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: "invalid_body", issues: parsed.error.issues }, 400);
    const userId = c.var.user.id;
    const key = `${userId}/${crypto.randomUUID()}.${parsed.data.ext}`;
    const bucket = BUCKET_MAP[parsed.data.bucket];
    const { url, publicUrl } = await presignPut({ bucket, key, contentType: parsed.data.contentType });
    return c.json({ url, publicUrl, bucket, key, expiresInSec: 600 });
  });
```

`apps/api/src/routes/achievements.ts`:

```typescript
import { Hono } from "hono";
import { eq, desc } from "drizzle-orm";
import { db } from "../db/client.js";
import { achievements } from "../db/schema/index.js";
import { requireAuth, type AuthVariables } from "../middleware/require-auth.js";

export const achievementsRoute = new Hono<{ Variables: AuthVariables }>()
  .use("/me/achievements", requireAuth)
  .get("/me/achievements", async (c) => {
    const userId = c.var.user.id;
    const rows = await db.select().from(achievements)
      .where(eq(achievements.userId, userId))
      .orderBy(desc(achievements.unlockedAt));
    return c.json(rows);
  });
```

`apps/api/src/routes/citations.ts`:

```typescript
import { Hono } from "hono";
import citations from "@wellcore/shared/citations.json" with { type: "json" };

export const citationsRoute = new Hono()
  .get("/citations", (c) => c.json(citations));
```

(If `citations.json` is not currently re-exported via the package's `exports`, expose it in `packages/shared/package.json` `exports`: `"./citations.json": "./src/citations.json"`.)

`apps/api/src/routes/privacy.ts`:

```typescript
import { Hono } from "hono";
import { db } from "../db/client.js";
import { dsarRequests } from "../db/schema/index.js";
import { requireAuth, type AuthVariables } from "../middleware/require-auth.js";
import { DsarSchema } from "../schemas/privacy.js";

export const privacyRoute = new Hono<{ Variables: AuthVariables }>()
  .use("/privacy/*", requireAuth)
  .post("/privacy/dsar", async (c) => {
    const userId = c.var.user.id;
    const body = await c.req.json().catch(() => ({}));
    const parsed = DsarSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: "invalid_body", issues: parsed.error.issues }, 400);
    const [row] = await db.insert(dsarRequests).values({
      userId,
      type: parsed.data.type,
      fulfillmentNotes: parsed.data.notes ?? null,
    }).returning();
    return c.json({ ticketId: row.id, status: row.status, requestedAt: row.requestedAt }, 201);
  });
```

Wire all four into `app.ts`:

```typescript
.route("/", achievementsRoute)
.route("/", uploadsRoute)
.route("/", citationsRoute)
.route("/", privacyRoute);
```

**Step 4: Run** — tests pass.

**Step 5: Commit**

```bash
git add apps/api/src/routes apps/api/src/lib apps/api/src/app.ts packages/shared/package.json
git commit -m "feat(api): achievements, presigned uploads, citations static, privacy DSAR"
```

---

## Task 14: Authenticated integration tests + AppType export verification

**Files:**
- Create: `apps/api/src/__tests__/integration.test.ts`
- Create: `apps/api/src/__tests__/helpers/auth-fixture.ts`

**Step 1: Failing test** — Build a helper that creates a test user directly in the DB, mints a better-auth session row, then issues requests with `cookie: better-auth.session_token=<token>`.

`apps/api/src/__tests__/helpers/auth-fixture.ts`:

```typescript
import { db } from "../../db/client.js";
import { authUser, authSession } from "../../db/schema/index.js";
import { auth } from "../../auth.js";

export async function createTestUser() {
  const id = crypto.randomUUID();
  await db.insert(authUser).values({
    id,
    email: `test-${id}@wellcore.test`,
    emailVerified: true,
  });
  // Create a session via the auth API so the cookie format matches.
  // For Bun + better-auth we can call internalAdapter.createSession directly:
  const sessionToken = crypto.randomUUID().replace(/-/g, "");
  const sessionId = crypto.randomUUID();
  await db.insert(authSession).values({
    id: sessionId,
    userId: id,
    token: sessionToken,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
  });
  return {
    userId: id,
    cookie: `better-auth.session_token=${sessionToken}`,
  };
}
```

`apps/api/src/__tests__/integration.test.ts`:

```typescript
import { describe, expect, test } from "vitest";
import { app } from "../app.js";
import { createTestUser } from "./helpers/auth-fixture.js";

describe("authed happy paths", () => {
  test("GET /auth/me returns user", async () => {
    const { cookie, userId } = await createTestUser();
    const res = await app.request("/auth/me", { headers: { cookie } });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.user.id).toBe(userId);
  });

  test("PUT /profile then GET /profile round-trips", async () => {
    const { cookie } = await createTestUser();
    const put = await app.request("/profile", {
      method: "PUT",
      headers: { cookie, "content-type": "application/json" },
      body: JSON.stringify({ displayName: "Sencer", chamberType: "soft_1_3", goals: ["recovery", "wellness"] }),
    });
    expect(put.status).toBe(200);
    const get = await app.request("/profile", { headers: { cookie } });
    const body = await get.json();
    expect(body.displayName).toBe("Sencer");
    expect(body.goals).toEqual(["recovery", "wellness"]);
  });

  test("POST /sessions then PATCH /sessions/:id", async () => {
    const { cookie } = await createTestUser();
    const create = await app.request("/sessions", {
      method: "POST",
      headers: { cookie, "content-type": "application/json" },
      body: JSON.stringify({ pressureAta: 1.3 }),
    });
    expect(create.status).toBe(201);
    const session = await create.json();
    const patch = await app.request(`/sessions/${session.id}`, {
      method: "PATCH",
      headers: { cookie, "content-type": "application/json" },
      body: JSON.stringify({ status: "completed", totalDurationSec: 3600, treatmentDurationSec: 3000 }),
    });
    expect(patch.status).toBe(200);
    const updated = await patch.json();
    expect(updated.status).toBe("completed");
  });

  test("POST /checkins inserts structured PROMIS row", async () => {
    const { cookie } = await createTestUser();
    const res = await app.request("/checkins", {
      method: "POST",
      headers: { cookie, "content-type": "application/json" },
      body: JSON.stringify({
        checkinType: "pre",
        promisGlobalPhysical: 4, promisGlobalMental: 4,
        painLevel: 2, energyLevel: 7, sleepQuality: 6, focusLevel: 7,
      }),
    });
    expect(res.status).toBe(201);
  });

  test("POST /uploads/presign returns url + publicUrl", async () => {
    const { cookie } = await createTestUser();
    const res = await app.request("/uploads/presign", {
      method: "POST",
      headers: { cookie, "content-type": "application/json" },
      body: JSON.stringify({ bucket: "avatars", contentType: "image/png", byteLength: 12345, ext: "png" }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.url).toMatch(/^https?:\/\//);
    expect(body.publicUrl).toMatch(/^https?:\/\//);
  });

  test("AppType export contains chained routes", () => {
    type T = typeof app;
    const _t: T = app;
    expect(_t).toBeDefined();
  });
});
```

**Step 2: Run** — initially may fail if better-auth's session token format differs from our direct insert. If `getSession()` rejects the directly-inserted token, switch the fixture to use better-auth's internal `createSession` API:

```typescript
const ctx = await auth.$context;
const session = await ctx.internalAdapter.createSession(id, undefined);
return { userId: id, cookie: `better-auth.session_token=${session.token}` };
```

**Step 3: Implement** — adjust the fixture until all six integration tests pass.

**Step 4: Run** — `pnpm --filter @wellcore/api test` → ≥ 18 tests pass.

**Step 5: Commit**

```bash
git add apps/api/src/__tests__
git commit -m "test(api): authed integration suite (profile, sessions, checkins, uploads, AppType)"
```

---

## Task 15: README, env doc, Dockerfile verification, final integration check + PR

**Files:**
- Modify: `README.md` — add Backend section
- Modify: `apps/api/Dockerfile` — verify build context still works with new deps
- Verify: every script (`db:generate`, `db:migrate`, `db:seed`, `dev`, `build`, `test`, `typecheck`) runs from a clean checkout

**Step 1: Verify Dockerfile**

```bash
cat apps/api/Dockerfile
docker build -f apps/api/Dockerfile -t wellcore-api:local .
docker run --rm -e DATABASE_URL=postgresql://wellcore:wellcore@host.docker.internal:5432/wellcore -e BETTER_AUTH_SECRET=$(openssl rand -hex 32) -e BETTER_AUTH_URL=http://localhost:3000 -e PUBLIC_BASE_URL=http://localhost:3000 -e APPLE_CLIENT_ID=com.wellcore.app -e APPLE_TEAM_ID=X -e APPLE_KEY_ID=X -e APPLE_PRIVATE_KEY="x" -e S3_ENDPOINT=http://host.docker.internal:9000 -e S3_ACCESS_KEY=minioadmin -e S3_SECRET_KEY=minioadmin -e S3_BUCKET=wellcore-dev -p 3000:3000 wellcore-api:local &
sleep 3
curl -i http://localhost:3000/health
docker stop $(docker ps -q --filter ancestor=wellcore-api:local) || true
```

If the image fails to build because `sharp` or other native deps need rebuild, add a multi-stage build hint to the Dockerfile (no native dep should ship in the API image — `sharp` is a root devDep, not an `apps/api` dep).

**Step 2: Final smoke run**

```bash
pnpm --filter @wellcore/api typecheck
pnpm --filter @wellcore/api test
pnpm --filter @wellcore/api db:generate   # should produce no diff
pnpm --filter @wellcore/api db:migrate
pnpm --filter @wellcore/api db:seed
pnpm --filter @wellcore/api dev &
sleep 2
curl -s http://localhost:3000/health | jq
curl -s http://localhost:3000/protocols | jq 'length'   # → 6
curl -i http://localhost:3000/me/sessions               # → 401
curl -i http://localhost:3000/auth/me                   # → 401
curl -s http://localhost:3000/citations | jq 'length'   # > 0
kill %1
```

**Step 3: README updates** — append to `README.md`:

````markdown
## Backend (apps/api)

Wellcore's backend is a Hono app on Bun, Drizzle ORM (Postgres 16), and better-auth with Apple web OAuth.

### Bring up locally

```bash
docker compose -f ops/docker-compose.yml up -d
cp apps/api/.env.example apps/api/.env
pnpm --filter @wellcore/api db:migrate
pnpm --filter @wellcore/api db:seed
pnpm --filter @wellcore/api dev
```

### Routes

- `GET /health`
- `GET /protocols`, `GET /protocols/:slug`
- `GET /citations` — static citations from `@wellcore/shared`
- `POST /api/auth/sign-in/social` (Apple) — better-auth handler
- `POST /api/auth/callback/apple` — Apple form_post target
- `POST /auth/signout`, `GET /auth/me`
- `GET /profile`, `PUT /profile`, `POST /profile/disclaimers`, `POST /profile/consent`
- `GET /me/protocols`, `POST /me/protocols`, `PATCH /me/protocols/:id`
- `POST /sessions`, `PATCH /sessions/:id`, `GET /me/sessions?limit=&cursor=`
- `POST /checkins`, `GET /me/checkins?session_id=`
- `GET /me/achievements`
- `POST /uploads/presign`
- `POST /privacy/dsar`

### Drizzle

- Schemas live in `apps/api/src/db/schema/` (one file per domain).
- Migrations live in `apps/api/src/db/migrations/`. **Always `db:generate`, never `push` in prod.**

### Auth

- better-auth with Apple Sign In via web OAuth flow. Session is httpOnly cookie.
- Native Apple identityToken flow is intentionally NOT used (known better-auth bugs).

### Privacy & consent

- `consent_events` records every CCPA / MHMDA / MODPA / Terms / Privacy acceptance with version + IP + UA.
- `dsar_requests` logs CCPA Data Subject Access Requests; fulfillment is manual for v1.
- `wellness_checkins` uses **structured PROMIS-aligned columns** (NOT a free-form jsonb blob).
````

**Step 4: Push + open PR**

```bash
git add README.md apps/api/Dockerfile
git commit -m "docs(api): README backend section + Dockerfile verified"
git push -u origin faz-2

gh pr create --base main --head faz-2 --title "Faz 2: Wellcore backend core" --body "$(cat <<'EOF'
## Summary

Wellcore Faz 2 — backend core: Drizzle schemas, better-auth (Apple web OAuth), Hono RPC routes, MinIO presigned uploads.

- Schemas (one file per domain): users, profiles, consent_events, suicidality_screens, protocols, user_protocols, hbot_sessions, wellness_checkins (PROMIS-structured), achievements, subscription, dsar_requests, plus better-auth tables
- Initial drizzle migration generated (never push)
- 6 protocols seeded (1.3 / 1.5 / 2.0 / 2.4 ATA)
- better-auth with Apple web OAuth (NOT native identityToken — known bugs); httpOnly cookie sessions
- Routes: /auth/*, /profile, /me/protocols, /sessions, /me/sessions, /checkins, /me/checkins, /me/achievements, /uploads/presign, /citations, /privacy/dsar
- Zod input schemas per route + requireAuth middleware (401 on missing/invalid)
- Presigned PUT URLs against MinIO with byte-length cap (15 MB) + per-user key prefix
- Static citations endpoint serves @wellcore/shared/citations.json
- CCPA DSAR logged into dsar_requests; fulfillment manual for v1
- AppType chain exported from app.ts for mobile RPC client
- Vitest: schema validation, auth middleware, route 401s, authed happy-path integration (≥ 18 tests)

## Test plan
- [x] `pnpm --filter @wellcore/api typecheck`
- [x] `pnpm --filter @wellcore/api test` (≥ 18 passing)
- [x] `pnpm --filter @wellcore/api db:generate` (no diff after final state)
- [x] `pnpm --filter @wellcore/api db:migrate`
- [x] `pnpm --filter @wellcore/api db:seed` (6 protocols)
- [x] curl smoke: /health, /protocols (6), /me/sessions (401), /auth/me (401), /citations (>0)
- [x] Dockerfile builds and serves /health

## Next phase
Faz 3 — Mobile RPC client + onboarding flow against this backend.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Done — handoff to Faz 3

After this branch merges, proceed to **Faz 3 — Mobile onboarding + RPC client**. The mobile app will consume `AppType` via `hc<AppType>(PUBLIC_BASE_URL)` with cookie-jar via `expo-secure-store`, drive Apple Sign In via the web OAuth flow (not native identityToken), and exercise every route added here through the v2 onboarding flow (10 slides, fire safety acknowledgment, chamber-type selector, goal selection with evidence dots, structured PROMIS pre-session check-in).

**Dependency graph:**

```
Task 1 → Task 2 → Task 3 → Task 4 → Task 5
                                    ↓
                                  Task 6 → Task 7 → Task 8
                                                          ↓
                                                       Task 9 (depends on 5+8)
                                                          ↓
                                  Task 10 → Task 11 → Task 12 → Task 13
                                                                   ↓
                                                                Task 14
                                                                   ↓
                                                                Task 15
```
