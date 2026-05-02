# Wellcore Faz 0 — Foundation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Stand up an empty-but-runnable Wellcore monorepo: API replies `{ ok: true }` on `/health`, Expo app boots into a themed dev splash in EN with Wellcore fonts/theme rendering correctly, all wired through `pnpm dev`. (Dev splash includes an EN↔TR sanity toggle to prove i18n bundling works; that toggle is scaffolding only — the production onboarding from Faz 3 onward is EN-only in v1.)

**Architecture:** pnpm workspaces + Turborepo. Three workspace targets (`apps/api`, `apps/mobile`, `packages/shared`). API is Hono on Bun runtime (Bun chosen over Node for native TypeScript + faster cold start; Dokploy supports Bun via Dockerfile). Mobile is Expo SDK 55 with Expo Router. Shared package exposes Zod schemas + Hono `AppType` for end-to-end RPC types. Postgres + MinIO run locally via Docker Compose.

**Tech Stack:** pnpm 9 · Turborepo 2 · TypeScript 5.5 · Bun 1.1 · Hono 4 · Drizzle ORM · Drizzle-kit · Vitest (API tests) · Expo SDK 55 · Expo Router · React Native 0.83 · Reanimated 4 · @expo-google-fonts/newsreader · @expo-google-fonts/inter · i18next + react-i18next · expo-localization · Docker Compose (Postgres 16 + MinIO).

**Definition of done:**
- `pnpm install` at root works.
- `pnpm dev` starts API (port 3000) + Mobile (Expo dev server) + DB containers in parallel.
- `curl http://localhost:3000/health` → `{"ok":true,"version":"0.0.0"}`.
- Expo app launches on iOS simulator: warm-paper background, Atrium mark + "wellcore" italic wordmark + tagline rendered with Newsreader + Inter fonts loaded.
- Tapping the EN↔TR dev sanity toggle on the splash flips the tagline live (proves both locale resources bundle correctly; toggle is removed when real onboarding ships).
- API has one passing Vitest test for `/health`.
- Drizzle migration scaffold exists; `pnpm db:push` (against local docker Postgres) succeeds with empty schema.
- Mobile typechecks (`pnpm typecheck`); API typechecks; shared package typechecks.
- One commit per task. Final commit on a single feature branch ready for review.

---

## Pre-flight

**Before Task 1 — verify tooling:**

```bash
node --version    # expect v20.x or v22.x
pnpm --version    # expect 9.x (install: npm i -g pnpm@9)
bun --version     # expect 1.1.x or newer (install: curl -fsSL https://bun.sh/install | bash)
docker --version  # expect 24+
git --version
```

If any missing, install before proceeding. Do NOT use npm or yarn — pnpm is required for workspace resolution.

Run from `/Users/sencersoylu/Projects/wellcore`. The directory is already a git repo with one design-doc commit.

**Create branch:**

```bash
git checkout -b foundation
```

---

## Task 1: Monorepo root scaffolding

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `turbo.json`
- Create: `.gitignore`
- Create: `.nvmrc`
- Create: `tsconfig.base.json`
- Create: `.editorconfig`
- Create: `README.md`

**Step 1: Write `package.json`**

```json
{
  "name": "wellcore",
  "private": true,
  "version": "0.0.0",
  "packageManager": "pnpm@9.12.0",
  "engines": {
    "node": ">=20.11.0"
  },
  "scripts": {
    "dev": "turbo run dev --parallel",
    "build": "turbo run build",
    "typecheck": "turbo run typecheck",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "clean": "turbo run clean && rm -rf node_modules"
  },
  "devDependencies": {
    "turbo": "^2.3.0",
    "typescript": "^5.5.4"
  }
}
```

**Step 2: Write `pnpm-workspace.yaml`**

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

**Step 3: Write `turbo.json`**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [".env", ".env.*"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "lint": {},
    "test": {
      "dependsOn": ["^build"]
    },
    "clean": {
      "cache": false
    }
  }
}
```

**Step 4: Write `.gitignore`**

```gitignore
node_modules/
.turbo/
dist/
.expo/
.expo-shared/
*.log
.env
.env.local
.env.*.local
.DS_Store
ios/
android/
.tamagui/
*.tsbuildinfo
coverage/
.next/
```

**Step 5: Write `.nvmrc`**

```
v22.11.0
```

**Step 6: Write `tsconfig.base.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": false
  }
}
```

**Step 7: Write `.editorconfig`**

```ini
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false
```

**Step 8: Write `README.md`**

```markdown
# Wellcore

Hyperbaric oxygen therapy companion. Mobile (Expo) + API (Hono) monorepo.

## Setup

\`\`\`bash
pnpm install
docker compose -f ops/docker-compose.yml up -d
pnpm dev
\`\`\`

See \`docs/plans/\` for design and phase plans.
```

**Step 9: Install + commit**

```bash
pnpm install
git add .
git commit -m "feat(foundation): monorepo root scaffolding (pnpm + turbo)"
```

Expected: `pnpm install` exits clean, no workspace errors.

---

## Task 2: Shared package skeleton

**Files:**
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/index.ts`
- Create: `packages/shared/src/env.ts`

**Step 1: Write `packages/shared/package.json`**

```json
{
  "name": "@wellcore/shared",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./env": "./src/env.ts"
  },
  "scripts": {
    "typecheck": "tsc --noEmit",
    "clean": "rm -rf .turbo *.tsbuildinfo"
  },
  "dependencies": {
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "typescript": "^5.5.4"
  }
}
```

**Step 2: Write `packages/shared/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "declaration": true
  },
  "include": ["src/**/*"]
}
```

**Step 3: Write `packages/shared/src/index.ts`**

```typescript
export const APP_NAME = "Wellcore" as const;
export const APP_VERSION = "0.0.0" as const;
```

**Step 4: Write `packages/shared/src/env.ts`**

```typescript
import { z } from "zod";

export const ServerEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),
  S3_ENDPOINT: z.string().url(),
  S3_REGION: z.string().default("us-east-1"),
  S3_ACCESS_KEY: z.string().min(1),
  S3_SECRET_KEY: z.string().min(1),
  S3_BUCKET: z.string().min(1),
});

export type ServerEnv = z.infer<typeof ServerEnvSchema>;
```

**Step 5: Install + verify**

```bash
pnpm install
pnpm --filter @wellcore/shared typecheck
```

Expected: typecheck passes silently.

**Step 6: Commit**

```bash
git add packages/shared
git commit -m "feat(shared): zod-based env schema + package skeleton"
```

---

## Task 3: API skeleton — Hono + Bun + health endpoint (TDD)

**Files:**
- Create: `apps/api/package.json`
- Create: `apps/api/tsconfig.json`
- Create: `apps/api/src/app.ts`
- Create: `apps/api/src/server.ts`
- Create: `apps/api/src/__tests__/health.test.ts`
- Create: `apps/api/.env.example`

**Step 1: Write `apps/api/package.json`**

```json
{
  "name": "@wellcore/api",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "bun run --hot src/server.ts",
    "build": "bun build src/server.ts --target bun --outdir dist",
    "start": "bun run dist/server.js",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "clean": "rm -rf dist .turbo"
  },
  "dependencies": {
    "@wellcore/shared": "workspace:*",
    "hono": "^4.6.0"
  },
  "devDependencies": {
    "@types/bun": "^1.1.13",
    "typescript": "^5.5.4",
    "vitest": "^2.1.0"
  }
}
```

**Step 2: Write `apps/api/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "types": ["bun"],
    "outDir": "dist",
    "rootDir": "src",
    "jsx": "react-jsx",
    "jsxImportSource": "hono/jsx"
  },
  "include": ["src/**/*"]
}
```

**Step 3: Write `apps/api/.env.example`**

```dotenv
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://wellcore:wellcore@localhost:5432/wellcore
BETTER_AUTH_SECRET=replace-with-32-chars-of-random-secret-here
BETTER_AUTH_URL=http://localhost:3000
S3_ENDPOINT=http://localhost:9000
S3_REGION=us-east-1
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=wellcore-dev
```

Then `cp apps/api/.env.example apps/api/.env`.

**Step 4: Write the failing test — `apps/api/src/__tests__/health.test.ts`**

```typescript
import { describe, expect, it } from "vitest";
import { app } from "../app.js";

describe("GET /health", () => {
  it("returns ok and version", async () => {
    const res = await app.request("/health");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ ok: true, version: "0.0.0" });
  });
});
```

**Step 5: Run the test to verify it fails**

```bash
pnpm install
pnpm --filter @wellcore/api test
```

Expected: FAIL with `Cannot find module '../app.js'` (or similar).

**Step 6: Implement minimal — `apps/api/src/app.ts`**

```typescript
import { Hono } from "hono";
import { APP_VERSION } from "@wellcore/shared";

export const app = new Hono()
  .get("/health", (c) => c.json({ ok: true, version: APP_VERSION }));

export type AppType = typeof app;
```

**Step 7: Implement entrypoint — `apps/api/src/server.ts`**

```typescript
import { ServerEnvSchema } from "@wellcore/shared/env";
import { app } from "./app.js";

const env = ServerEnvSchema.parse(process.env);

export default {
  port: env.PORT,
  fetch: app.fetch,
};

console.log(`[wellcore-api] listening on http://localhost:${env.PORT}`);
```

**Step 8: Run test — verify it passes**

```bash
pnpm --filter @wellcore/api test
```

Expected: 1 test passing.

**Step 9: Smoke test the dev server**

```bash
pnpm --filter @wellcore/api dev &
sleep 2
curl -s http://localhost:3000/health
kill %1
```

Expected: `{"ok":true,"version":"0.0.0"}`.

**Step 10: Commit**

```bash
git add apps/api
git commit -m "feat(api): Hono + Bun skeleton with /health endpoint and vitest"
```

---

## Task 4: Local infrastructure — Postgres + MinIO via Docker Compose

**Files:**
- Create: `ops/docker-compose.yml`
- Create: `ops/postgres/init.sql`
- Modify: `README.md` (already mentions docker compose; verify path matches)

**Step 1: Write `ops/docker-compose.yml`**

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: wellcore-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: wellcore
      POSTGRES_PASSWORD: wellcore
      POSTGRES_DB: wellcore
    ports:
      - "5432:5432"
    volumes:
      - wellcore_postgres:/var/lib/postgresql/data
      - ./postgres/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U wellcore"]
      interval: 5s
      timeout: 3s
      retries: 5

  minio:
    image: minio/minio:latest
    container_name: wellcore-minio
    restart: unless-stopped
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - wellcore_minio:/data
    healthcheck:
      test: ["CMD", "mc", "ready", "local"]
      interval: 10s
      timeout: 3s
      retries: 5

  minio-init:
    image: minio/mc:latest
    depends_on:
      minio:
        condition: service_healthy
    entrypoint: >
      /bin/sh -c "
      mc alias set local http://minio:9000 minioadmin minioadmin &&
      mc mb --ignore-existing local/wellcore-dev &&
      mc anonymous set download local/wellcore-dev &&
      echo 'minio bucket ready';
      "

volumes:
  wellcore_postgres:
  wellcore_minio:
```

**Step 2: Write `ops/postgres/init.sql`**

```sql
-- Wellcore — initial database setup
-- Migrations are applied by drizzle-kit; this file only handles extensions.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

**Step 3: Bring infra up + verify**

```bash
docker compose -f ops/docker-compose.yml up -d
docker compose -f ops/docker-compose.yml ps
docker exec wellcore-postgres pg_isready -U wellcore
```

Expected: both `wellcore-postgres` and `wellcore-minio` healthy; `pg_isready` reports `accepting connections`.

**Step 4: Commit**

```bash
git add ops
git commit -m "feat(ops): docker-compose for local Postgres + MinIO"
```

---

## Task 5: Drizzle ORM scaffold

**Files:**
- Modify: `apps/api/package.json` (add drizzle deps)
- Create: `apps/api/drizzle.config.ts`
- Create: `apps/api/src/db/client.ts`
- Create: `apps/api/src/db/schema/index.ts`
- Create: `apps/api/drizzle/.gitkeep`

**Step 1: Add deps**

Modify `apps/api/package.json` `dependencies` to include:

```json
"drizzle-orm": "^0.36.0",
"postgres": "^3.4.5"
```

And `devDependencies`:

```json
"drizzle-kit": "^0.28.0"
```

Add to `scripts`:

```json
"db:generate": "drizzle-kit generate",
"db:migrate": "drizzle-kit migrate",
"db:studio": "drizzle-kit studio"
```

Run `pnpm install` from repo root.

**Step 2: Write `apps/api/drizzle.config.ts`**

```typescript
import { defineConfig } from "drizzle-kit";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required for drizzle-kit");

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url },
  strict: true,
  verbose: true,
});
```

**Step 3: Write `apps/api/src/db/client.ts`**

```typescript
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { ServerEnvSchema } from "@wellcore/shared/env";
import * as schema from "./schema/index.js";

const env = ServerEnvSchema.parse(process.env);

const queryClient = postgres(env.DATABASE_URL, { max: 10 });

export const db = drizzle(queryClient, { schema, logger: env.NODE_ENV === "development" });
export type DB = typeof db;
```

**Step 4: Write `apps/api/src/db/schema/index.ts` (placeholder)**

```typescript
// Wellcore DB schema. Tables ship in Faz 2 (backend core).
// This empty file lets drizzle-kit generate an initial empty migration so the
// pipeline is wired before tables exist.
export {};
```

**Step 5: Generate empty migration to verify pipeline**

```bash
cd apps/api
pnpm db:generate
ls drizzle/
```

Expected: at least a `meta/` folder created (no `.sql` since schema is empty — that is fine).

Return to repo root: `cd ../..`.

**Step 6: Commit**

```bash
git add apps/api/drizzle apps/api/drizzle.config.ts apps/api/src/db apps/api/package.json pnpm-lock.yaml
git commit -m "feat(api): drizzle ORM scaffold (postgres-js client, empty schema)"
```

---

## Task 6: API Dockerfile + Dokploy hints

**Files:**
- Create: `apps/api/Dockerfile`
- Create: `apps/api/.dockerignore`
- Create: `ops/dokploy.md`

**Step 1: Write `apps/api/Dockerfile`**

```dockerfile
# syntax=docker/dockerfile:1.7
FROM oven/bun:1.1-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
RUN apk add --no-cache nodejs npm && npm i -g pnpm@9 && pnpm install --frozen-lockfile

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY . .
RUN cd apps/api && bun build src/server.ts --target bun --outdir dist

FROM oven/bun:1.1-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/drizzle ./drizzle
COPY --from=build /app/apps/api/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages ./packages
EXPOSE 3000
CMD ["bun", "run", "dist/server.js"]
```

**Step 2: Write `apps/api/.dockerignore`**

```
node_modules
dist
.turbo
.env
.env.*
*.log
__tests__
```

**Step 3: Write `ops/dokploy.md`**

```markdown
# Dokploy deployment notes

## App: wellcore-api

- **Repository:** sencersoylu/wellcore (set up after first push)
- **Build path:** `/` (monorepo root — Dockerfile references workspace files)
- **Dockerfile path:** `apps/api/Dockerfile`
- **Port:** 3000
- **Domain:** api.wellcore.app (set up Traefik routing in Dokploy UI)
- **Environment:** copy from `apps/api/.env.example`, generate strong
  `BETTER_AUTH_SECRET` (e.g. `openssl rand -hex 32`)

## Services

1. **Postgres** — Dokploy managed Postgres add-on. Wire `DATABASE_URL` via
   service link.
2. **MinIO** — deploy from `ops/docker-compose.yml` snippet (Compose tab).
3. **Auto-deploy** — enable GitHub webhook. **Fallback:** if webhook misses
   (dokploy issue #3787), use `Deploy` button or Dokploy API.

## Verifying

\`\`\`bash
curl https://api.wellcore.app/health
# expect: {"ok":true,"version":"<x.y.z>"}
\`\`\`
```

**Step 4: Smoke test the Dockerfile locally**

```bash
docker build -f apps/api/Dockerfile -t wellcore-api:dev .
docker run --rm -p 3001:3000 \
  -e DATABASE_URL=postgresql://wellcore:wellcore@host.docker.internal:5432/wellcore \
  -e BETTER_AUTH_SECRET=$(openssl rand -hex 32) \
  -e BETTER_AUTH_URL=http://localhost:3001 \
  -e S3_ENDPOINT=http://host.docker.internal:9000 \
  -e S3_ACCESS_KEY=minioadmin -e S3_SECRET_KEY=minioadmin -e S3_BUCKET=wellcore-dev \
  --name wellcore-api-test wellcore-api:dev &
sleep 3
curl -s http://localhost:3001/health
docker stop wellcore-api-test
```

Expected: `{"ok":true,"version":"0.0.0"}`.

**Step 5: Commit**

```bash
git add apps/api/Dockerfile apps/api/.dockerignore ops/dokploy.md
git commit -m "feat(ops): Dockerfile for api + dokploy deployment notes"
```

---

## Task 7: Mobile app — Expo SDK 55 init

**Files:**
- Create: `apps/mobile/package.json`
- Create: `apps/mobile/tsconfig.json`
- Create: `apps/mobile/app.json`
- Create: `apps/mobile/babel.config.js`
- Create: `apps/mobile/metro.config.js`
- Create: `apps/mobile/index.ts`
- Create: `apps/mobile/app/_layout.tsx`
- Create: `apps/mobile/app/index.tsx`
- Create: `apps/mobile/.env.example`

**Step 1: Write `apps/mobile/package.json`**

```json
{
  "name": "@wellcore/mobile",
  "version": "0.0.0",
  "private": true,
  "main": "index.ts",
  "scripts": {
    "dev": "expo start",
    "ios": "expo run:ios",
    "android": "expo run:android",
    "typecheck": "tsc --noEmit",
    "clean": "rm -rf .expo .turbo"
  },
  "dependencies": {
    "@wellcore/shared": "workspace:*",
    "expo": "~55.0.0",
    "expo-constants": "~17.0.0",
    "expo-font": "~13.0.0",
    "expo-linear-gradient": "~14.0.0",
    "expo-linking": "~7.0.0",
    "expo-localization": "~17.0.0",
    "expo-router": "~5.0.0",
    "expo-secure-store": "~15.0.0",
    "expo-splash-screen": "~0.30.0",
    "expo-status-bar": "~2.0.0",
    "expo-system-ui": "~4.0.0",
    "react": "19.2.0",
    "react-dom": "19.2.0",
    "react-native": "0.83.0",
    "react-native-gesture-handler": "~2.21.0",
    "react-native-reanimated": "~4.0.0",
    "react-native-safe-area-context": "~5.0.0",
    "react-native-screens": "~4.4.0",
    "react-native-svg": "~16.0.0"
  },
  "devDependencies": {
    "@types/react": "~19.2.0",
    "typescript": "^5.5.4"
  }
}
```

> If `expo` 55.x has not yet been published as `~55.0.0` when this plan
> executes, replace with the closest published 55.x version. Verify with
> `npm view expo versions --json | tail -20`.

**Step 2: Write `apps/mobile/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "react-native",
    "lib": ["ES2022", "DOM"],
    "moduleResolution": "Bundler",
    "allowJs": true,
    "noEmit": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts"
  ]
}
```

**Step 3: Write `apps/mobile/app.json`**

```json
{
  "expo": {
    "name": "Wellcore",
    "slug": "wellcore",
    "scheme": "wellcore",
    "version": "0.0.0",
    "orientation": "portrait",
    "userInterfaceStyle": "light",
    "newArchEnabled": true,
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#f6f4ef"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.sencersoylu.wellcore",
      "buildNumber": "1",
      "usesAppleSignIn": true,
      "infoPlist": {
        "ITSAppUsesNonExemptEncryption": false
      }
    },
    "android": {
      "package": "com.sencersoylu.wellcore",
      "versionCode": 1,
      "edgeToEdgeEnabled": true,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#f6f4ef"
      }
    },
    "plugins": [
      "expo-router",
      "expo-font",
      "expo-secure-store",
      ["expo-splash-screen", {
        "backgroundColor": "#f6f4ef",
        "image": "./assets/splash-icon.png",
        "imageWidth": 200
      }]
    ],
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

> Real assets ship in Faz 1. For now create 1×1 placeholders so Expo doesn't
> error on missing files:
> ```bash
> mkdir -p apps/mobile/assets
> # 1x1 transparent PNG (base64) — repeat for icon.png, adaptive-icon.png, splash-icon.png, favicon.png
> echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkAAIAAAoAAv/lxKUAAAAASUVORK5CYII=" | base64 -d > apps/mobile/assets/icon.png
> cp apps/mobile/assets/icon.png apps/mobile/assets/adaptive-icon.png
> cp apps/mobile/assets/icon.png apps/mobile/assets/splash-icon.png
> cp apps/mobile/assets/icon.png apps/mobile/assets/favicon.png
> ```

**Step 4: Write `apps/mobile/babel.config.js`**

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [],
  };
};
```

> Reanimated 4 no longer needs a Babel plugin — `babel-preset-expo` handles
> worklets transformation when the New Architecture is enabled.

**Step 5: Write `apps/mobile/metro.config.js`**

```javascript
const { getDefaultConfig } = require("expo/metro-config");
const path = require("node:path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Watch the entire monorepo so changes in packages/shared trigger reload.
config.watchFolders = [workspaceRoot];

// Resolve dependencies from monorepo root + this app's node_modules.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

config.resolver.disableHierarchicalLookup = true;

// Hono ships its client under "hono/client" with a custom export map that
// Metro 0.82+ resolves correctly out of the box. Forcing unstable_enablePackageExports
// guarantees subpath imports work.
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
```

**Step 6: Write `apps/mobile/index.ts`**

```typescript
import "expo-router/entry";
```

**Step 7: Write `apps/mobile/app/_layout.tsx` (minimal — full provider tree comes in later tasks)**

```tsx
import { Stack } from "expo-router";

export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
```

**Step 8: Write `apps/mobile/app/index.tsx` (temporary smoke screen)**

```tsx
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#f6f4ef" }}>
      <Text style={{ fontSize: 24, color: "#1a1a1a" }}>Wellcore</Text>
    </View>
  );
}
```

**Step 9: Write `apps/mobile/.env.example`**

```dotenv
EXPO_PUBLIC_API_URL=http://localhost:3000
```

Then `cp apps/mobile/.env.example apps/mobile/.env`.

**Step 10: Install + typecheck**

```bash
pnpm install
pnpm --filter @wellcore/mobile typecheck
```

Expected: typecheck passes.

**Step 11: Smoke test — start Expo dev server**

```bash
pnpm --filter @wellcore/mobile dev
```

Expected: Expo CLI prints QR code and "Metro waiting" without errors. Press `Ctrl+C` to stop. (We don't run on a simulator yet — that requires Faz 1 fonts and theme.)

**Step 12: Commit**

```bash
git add apps/mobile pnpm-lock.yaml
git commit -m "feat(mobile): Expo SDK 55 + Expo Router skeleton"
```

---

## Task 8: Wellcore theme tokens

**Files:**
- Create: `apps/mobile/src/theme/index.ts`
- Create: `apps/mobile/src/theme/colors.ts`
- Create: `apps/mobile/src/theme/typography.ts`
- Create: `apps/mobile/src/theme/spacing.ts`

**Step 1: Write `apps/mobile/src/theme/colors.ts`**

```typescript
export const Colors = {
  // Surface — warm paper whites
  bg: "#f6f4ef",
  bgElev: "#ffffff",
  bgSoft: "#efece5",
  bgTint: "#e9e5dc",

  // Ink — warm near-black scale
  ink: "#1a1a1a",
  ink2: "#3d3a36",
  ink3: "#6b6760",
  ink4: "#9a958c",
  ink5: "#c5c1b8",

  // Hairlines
  hairline: "rgba(26, 26, 26, 0.08)",
  hairlineStrong: "rgba(26, 26, 26, 0.14)",

  // Wellcore three-ring accents
  adherence: "#e8a06a", // warm amber — protocol adherence
  recovery: "#5b8c7b",  // sage teal — recovery / mood
  vitality: "#c66a5b",  // terracotta — vitality / streak

  // Hero gradient (Bevel-style sky)
  hero1: "#f4d6c0",
  hero2: "#e9c8d5",
  hero3: "#c8d8e4",

  // Semantic
  positive: "#5b8c7b",
  negative: "#c66a5b",
} as const;

export type ColorToken = keyof typeof Colors;

export const Gradients = {
  hero: ["#f4d6c0", "#e9c8d5", "#c8d8e4"] as const,
  paperBloom: ["#f7e7d8", "#f6f4ef"] as const,
} as const;
```

**Step 2: Write `apps/mobile/src/theme/typography.ts`**

```typescript
export const FontFamily = {
  serif: "Newsreader_400Regular",
  serifItalic: "Newsreader_400Regular_Italic",
  serifMedium: "Newsreader_500Medium",
  serifSemibold: "Newsreader_600SemiBold",
  sans: "Inter_400Regular",
  sansMedium: "Inter_500Medium",
  sansSemibold: "Inter_600SemiBold",
  sansBold: "Inter_700Bold",
} as const;

export const TextStyles = {
  display: {
    fontFamily: FontFamily.serif,
    fontSize: 56,
    letterSpacing: -2,
    lineHeight: 60,
  },
  h1: {
    fontFamily: FontFamily.serif,
    fontSize: 36,
    letterSpacing: -0.7,
    lineHeight: 38,
  },
  h2: {
    fontFamily: FontFamily.serif,
    fontSize: 26,
    letterSpacing: -0.4,
    lineHeight: 29,
  },
  h3: {
    fontFamily: FontFamily.sansSemibold,
    fontSize: 15,
    letterSpacing: -0.075,
    lineHeight: 20,
  },
  body: {
    fontFamily: FontFamily.sans,
    fontSize: 14,
    lineHeight: 21,
  },
  caption: {
    fontFamily: FontFamily.sans,
    fontSize: 12,
    lineHeight: 17,
  },
  eyebrow: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11,
    letterSpacing: 1.76,
    textTransform: "uppercase" as const,
  },
  wordmark: {
    fontFamily: FontFamily.serifItalic,
    fontSize: 22,
    letterSpacing: -0.44,
  },
} as const;

export type TextStyleToken = keyof typeof TextStyles;
```

**Step 3: Write `apps/mobile/src/theme/spacing.ts`**

```typescript
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 40,
  "3xl": 48,
  "4xl": 64,
  screenH: 20,
  screenTop: 60,
  screenBottom: 100,
} as const;

export const Radius = {
  none: 0,
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  "2xl": 32,
  pill: 999,
} as const;

export const Shadows = {
  sm: {
    shadowColor: "#1a1a1a",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: "#1a1a1a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: "#1a1a1a",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.10,
    shadowRadius: 48,
    elevation: 12,
  },
} as const;
```

**Step 4: Write `apps/mobile/src/theme/index.ts`**

```typescript
export { Colors, Gradients } from "./colors.js";
export { FontFamily, TextStyles } from "./typography.js";
export { Spacing, Radius, Shadows } from "./spacing.js";
```

**Step 5: Typecheck + commit**

```bash
pnpm --filter @wellcore/mobile typecheck
git add apps/mobile/src/theme
git commit -m "feat(mobile): Wellcore theme tokens (colors, typography, spacing)"
```

---

## Task 9: Font loading — Newsreader + Inter

**Files:**
- Modify: `apps/mobile/package.json` (add @expo-google-fonts deps)
- Create: `apps/mobile/src/theme/fonts.ts`
- Modify: `apps/mobile/app/_layout.tsx`

**Step 1: Add dependencies**

In `apps/mobile/package.json` `dependencies`:

```json
"@expo-google-fonts/newsreader": "^0.2.3",
"@expo-google-fonts/inter": "^0.2.3"
```

Run `pnpm install` from repo root.

**Step 2: Write `apps/mobile/src/theme/fonts.ts`**

```typescript
import {
  Newsreader_400Regular,
  Newsreader_400Regular_Italic,
  Newsreader_500Medium,
  Newsreader_600SemiBold,
} from "@expo-google-fonts/newsreader";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

export const wellcoreFontMap = {
  Newsreader_400Regular,
  Newsreader_400Regular_Italic,
  Newsreader_500Medium,
  Newsreader_600SemiBold,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} as const;
```

**Step 3: Update `apps/mobile/app/_layout.tsx`**

```tsx
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import { wellcoreFontMap } from "../src/theme/fonts.js";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const [loaded, error] = useFonts(wellcoreFontMap);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}
```

**Step 4: Smoke test — verify dev server boots**

```bash
pnpm --filter @wellcore/mobile dev
```

Expected: Metro starts, no font-related errors. Stop with `Ctrl+C`.

**Step 5: Commit**

```bash
git add apps/mobile/package.json apps/mobile/src/theme/fonts.ts apps/mobile/app/_layout.tsx pnpm-lock.yaml
git commit -m "feat(mobile): load Newsreader + Inter via expo-google-fonts"
```

---

## Task 10: i18n — i18next, EN primary, TR retained in codebase

> **Note (post-v2 design pivot):** Wellcore is US-primary. EN (US English) is
> the default and the only locale exposed to users in v1. The `tr.json` file
> is created and kept in the repo (no UI affordance to switch to TR), so
> future locale work has a starting point and dev-only toggles can flip to TR
> for QA. Device language detection is disabled — we always start in EN.

**Files:**
- Modify: `apps/mobile/package.json` (add i18next deps)
- Create: `apps/mobile/src/i18n/index.ts`
- Create: `apps/mobile/src/i18n/locales/en.json`
- Create: `apps/mobile/src/i18n/locales/tr.json`

**Step 1: Add deps**

In `apps/mobile/package.json` `dependencies`:

```json
"i18next": "^23.16.0",
"react-i18next": "^15.1.0",
"intl-pluralrules": "^2.0.1"
```

Run `pnpm install`.

**Step 2: Write `apps/mobile/src/i18n/locales/tr.json`**

```json
{
  "brand": {
    "name": "wellcore",
    "tagline": "Berraklığa basınç. Birer nefeste."
  },
  "common": {
    "continue": "Devam et",
    "back": "Geri",
    "skip": "Atla"
  }
}
```

**Step 3: Write `apps/mobile/src/i18n/locales/en.json`**

```json
{
  "brand": {
    "name": "wellcore",
    "tagline": "Pressure into clarity. One breath at a time."
  },
  "common": {
    "continue": "Continue",
    "back": "Back",
    "skip": "Skip"
  }
}
```

**Step 4: Write `apps/mobile/src/i18n/index.ts`**

```typescript
import "intl-pluralrules";
import i18next from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import tr from "./locales/tr.json";

// US-primary launch. TR resources are bundled but not user-selectable in v1.
// Dev/QA can flip via i18next.changeLanguage("tr") at runtime.
const SUPPORTED = ["en", "tr"] as const;
type Lang = (typeof SUPPORTED)[number];

void i18next.use(initReactI18next).init({
  compatibilityJSON: "v4",
  resources: {
    en: { translation: en },
    tr: { translation: tr },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  returnNull: false,
});

export { i18next };
export type { Lang };
```

**Step 5: Wire i18n into root layout — modify `apps/mobile/app/_layout.tsx`**

Add at top:

```tsx
import "../src/i18n/index.js";
```

(Keep the rest of the file unchanged.)

**Step 6: Typecheck**

```bash
pnpm --filter @wellcore/mobile typecheck
```

Expected: passes.

**Step 7: Commit**

```bash
git add apps/mobile/package.json apps/mobile/src/i18n apps/mobile/app/_layout.tsx pnpm-lock.yaml
git commit -m "feat(mobile): i18next with EN primary, TR bundled but hidden in v1"
```

---

## Task 11: Dev splash screen — proves theme + fonts + i18n work

**Files:**
- Modify: `apps/mobile/app/index.tsx`
- Create: `apps/mobile/src/components/WellcoreMark.tsx`

**Step 1: Write `apps/mobile/src/components/WellcoreMark.tsx`**

```tsx
import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";

type Props = {
  size?: number;
  stroke?: number;
  color?: string;
};

export function WellcoreMark({ size = 32, stroke = 1.5, color = "#1a1a1a" }: Props) {
  const c = size / 2;
  const r1 = size / 2 - stroke / 2;
  const r2 = r1 - 5;
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle cx={c} cy={c} r={r1} fill="none" stroke={color} strokeWidth={stroke} />
        <Circle cx={c} cy={c} r={r2} fill="none" stroke={color} strokeWidth={stroke} opacity={0.45} />
      </Svg>
    </View>
  );
}
```

**Step 2: Replace `apps/mobile/app/index.tsx`**

```tsx
import { useState } from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { i18next, type Lang } from "../src/i18n/index.js";
import { WellcoreMark } from "../src/components/WellcoreMark.js";
import { Colors, Spacing, TextStyles } from "../src/theme/index.js";

export default function Index() {
  const { t } = useTranslation();
  const [lang, setLang] = useState<Lang>(i18next.language as Lang);

  const toggle = () => {
    const next: Lang = lang === "tr" ? "en" : "tr";
    void i18next.changeLanguage(next);
    setLang(next);
  };

  return (
    <View style={styles.root}>
      <View style={styles.brand}>
        <WellcoreMark size={36} />
        <Text style={styles.wordmark}>{t("brand.name")}</Text>
      </View>
      <Text style={styles.tagline}>{t("brand.tagline")}</Text>

      <Pressable accessibilityRole="button" onPress={toggle} style={styles.toggle}>
        <Text style={styles.toggleText}>{lang.toUpperCase()} → {lang === "tr" ? "EN" : "TR"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.screenH,
    gap: Spacing.lg,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  wordmark: {
    ...TextStyles.wordmark,
    color: Colors.ink,
    fontStyle: "italic",
  },
  tagline: {
    ...TextStyles.body,
    color: Colors.ink2,
    textAlign: "center",
    maxWidth: 280,
  },
  toggle: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.hairlineStrong,
  },
  toggleText: {
    ...TextStyles.eyebrow,
    color: Colors.ink2,
  },
});
```

**Step 3: Smoke test — run on iOS simulator**

```bash
pnpm --filter @wellcore/mobile dev
# Press `i` to launch iOS simulator (requires Xcode)
```

Expected:
- Splash hides, then warm-paper background appears.
- Atrium mark (two concentric ink circles) + italic *wellcore* wordmark.
- Tagline text matches device locale (TR on a TR device, EN otherwise).
- Tapping the pill toggle flips language live.

Stop with `Ctrl+C`.

**Step 4: Commit**

```bash
git add apps/mobile/app/index.tsx apps/mobile/src/components/WellcoreMark.tsx
git commit -m "feat(mobile): dev splash with Atrium mark + wordmark + i18n toggle"
```

---

## Task 12: Hono RPC client + end-to-end /health smoke

**Files:**
- Create: `apps/mobile/src/api/client.ts`
- Modify: `apps/mobile/app/index.tsx` (add health badge)

**Step 1: Write `apps/mobile/src/api/client.ts`**

```typescript
import { hc } from "hono/client";
import type { AppType } from "@wellcore/api/src/app.js";
import Constants from "expo-constants";

const baseUrl = process.env.EXPO_PUBLIC_API_URL
  ?? Constants.expoConfig?.hostUri?.replace(/:\d+$/, ":3000")
  ?? "http://localhost:3000";

export const api = hc<AppType>(baseUrl);
```

> The `@wellcore/api/src/app.js` import works because Metro watches the
> monorepo (Task 7 metro.config.js). The API package exports `AppType` from
> `app.ts`. We import only the type — no runtime API code reaches the bundle.

**Step 2: Add the type-only export to API package — modify `apps/api/package.json`**

Add `exports`:

```json
"exports": {
  ".": "./src/app.ts",
  "./src/app.js": "./src/app.ts"
}
```

**Step 3: Add health badge to `apps/mobile/app/index.tsx`**

Add at the top of imports:

```tsx
import { useEffect, useState } from "react";
import { api } from "../src/api/client.js";
```

Inside `Index()`, before the `return`:

```tsx
const [health, setHealth] = useState<"loading" | "ok" | "fail">("loading");

useEffect(() => {
  let cancelled = false;
  api.health.$get()
    .then(async (res) => {
      if (cancelled) return;
      const body = await res.json();
      setHealth(body.ok ? "ok" : "fail");
    })
    .catch(() => !cancelled && setHealth("fail"));
  return () => { cancelled = true; };
}, []);
```

In the JSX, below the toggle, add:

```tsx
<Text style={[styles.toggleText, { color: health === "ok" ? Colors.positive : Colors.ink3, marginTop: Spacing.md }]}>
  api: {health}
</Text>
```

**Step 4: Smoke test end-to-end**

In one terminal:

```bash
docker compose -f ops/docker-compose.yml up -d
pnpm --filter @wellcore/api dev
```

In another:

```bash
pnpm --filter @wellcore/mobile dev
# press `i` for simulator
```

Expected: dev splash shows `api: ok`. If using a physical device, ensure
`EXPO_PUBLIC_API_URL` in `apps/mobile/.env` points to your machine's LAN IP.

**Step 5: Commit**

```bash
git add apps/api/package.json apps/mobile/src/api/client.ts apps/mobile/app/index.tsx
git commit -m "feat: end-to-end Hono RPC client wired into mobile dev splash"
```

---

## Task 13: Root `pnpm dev` orchestration

**Files:**
- Modify: `package.json` (root scripts)
- Modify: `turbo.json` (already has dev — verify)
- Create: `scripts/dev.sh`

**Step 1: Write `scripts/dev.sh`**

```bash
#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "→ starting docker infra"
docker compose -f ops/docker-compose.yml up -d --wait

echo "→ starting api + mobile (turbo --parallel)"
pnpm turbo run dev --parallel
```

Make it executable:

```bash
chmod +x scripts/dev.sh
```

**Step 2: Update root `package.json` `scripts.dev`**

```json
"dev": "bash scripts/dev.sh",
"dev:turbo": "turbo run dev --parallel",
"infra:up": "docker compose -f ops/docker-compose.yml up -d",
"infra:down": "docker compose -f ops/docker-compose.yml down"
```

**Step 3: Smoke test**

```bash
pnpm dev
```

Expected: Docker services come up healthy, then both `api` and `mobile` workspaces start in parallel under turbo. Stop with `Ctrl+C` (turbo handles cleanup).

**Step 4: Commit**

```bash
git add scripts/dev.sh package.json
git commit -m "feat(dx): root pnpm dev orchestrates docker + api + mobile"
```

---

## Task 14: Workspace typecheck + minimal CI hook

**Files:**
- Create: `.github/workflows/ci.yml`

**Step 1: Verify typecheck across workspaces locally**

```bash
pnpm typecheck
```

Expected: turbo runs typecheck in api, mobile, shared — all pass.

**Step 2: Write `.github/workflows/ci.yml`**

```yaml
name: ci

on:
  push:
    branches: [main, foundation]
  pull_request:

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: pnpm
      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: "1.1"
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck
      - run: pnpm --filter @wellcore/api test
```

**Step 3: Commit**

```bash
git add .github
git commit -m "ci: typecheck + api tests on push and PR"
```

---

## Task 15: Final sanity sweep + handoff

**Step 1: Run the full happy path from a clean state**

```bash
pnpm clean
pnpm install
docker compose -f ops/docker-compose.yml up -d
pnpm typecheck
pnpm --filter @wellcore/api test
pnpm dev
```

Expected:
- Clean install completes.
- Typecheck passes for `@wellcore/api`, `@wellcore/mobile`, `@wellcore/shared`.
- Vitest reports 1 passing test.
- `pnpm dev` boots both servers; `curl http://localhost:3000/health` →
  `{"ok":true,"version":"0.0.0"}`; iOS simulator shows themed splash with
  `api: ok` badge.

**Step 2: Update `README.md` with verified setup steps**

Replace the README setup block with:

```markdown
## Setup

\`\`\`bash
nvm use                 # if using nvm — picks v22 from .nvmrc
pnpm install
cp apps/api/.env.example apps/api/.env
cp apps/mobile/.env.example apps/mobile/.env
pnpm dev                # starts docker (postgres + minio) + api + mobile
\`\`\`

API: http://localhost:3000/health
Mobile: press \`i\` in the Expo terminal for iOS simulator.

## Workspaces

- \`apps/api\` — Hono API on Bun
- \`apps/mobile\` — Expo SDK 55 React Native app
- \`packages/shared\` — Zod schemas + Hono AppType

## Useful commands

\`\`\`bash
pnpm typecheck                       # all workspaces
pnpm --filter @wellcore/api test     # api tests only
pnpm --filter @wellcore/api db:generate
pnpm --filter @wellcore/api db:studio
pnpm infra:up                        # postgres + minio only
pnpm infra:down
\`\`\`

See \`docs/plans/\` for design docs and phase plans.
\`ops/dokploy.md\` for deployment notes.
```

**Step 3: Final commit + push**

```bash
git add README.md
git commit -m "docs: verified setup steps for foundation"
git push -u origin foundation
```

**Step 4: Open PR (or merge directly)**

```bash
gh pr create --title "Faz 0: Wellcore foundation" --body "$(cat <<'EOF'
## Summary
- Monorepo scaffold (pnpm + Turborepo)
- Hono API on Bun with /health endpoint + Vitest
- Drizzle ORM scaffold
- Docker Compose for Postgres + MinIO
- Expo SDK 55 mobile app with Wellcore theme tokens, Newsreader + Inter fonts, i18next (EN primary, TR bundled but hidden)
- End-to-end Hono RPC types from API to mobile
- Dockerfile + Dokploy deploy notes
- CI: typecheck + tests on push/PR

## Test plan
- [x] \`pnpm install\` clean
- [x] \`pnpm typecheck\` passes all workspaces
- [x] \`pnpm --filter @wellcore/api test\` 1 passing
- [x] \`pnpm dev\` brings up infra + api + mobile
- [x] \`curl localhost:3000/health\` returns ok
- [x] iOS simulator shows themed splash with TR/EN toggle
- [x] Dev splash badge shows \`api: ok\`

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Done — handoff to Faz 1

After this branch merges, proceed to **Faz 1 — Design system**: brand primitives
(WellcoreWordmark, Ring, TripleRing, HeroGradient), full icon set, generated
Atrium app icon + splash assets, and a design-system showcase route.

Plan file for Faz 1 should land at
`docs/plans/2026-XX-XX-wellcore-faz-1-design-system.md` and be authored after
Faz 0 ships.
