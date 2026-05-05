# Wellcore

Hyperbaric oxygen therapy companion. Mobile (Expo) + API (Hono) monorepo.

## Setup

```bash
nvm use                 # if using nvm — picks v22 from .nvmrc
pnpm install
cp apps/api/.env.example apps/api/.env
cp apps/mobile/.env.example apps/mobile/.env
pnpm dev                # starts docker (postgres + minio) + api + mobile
```

API: http://localhost:3000/health
Mobile: press `i` in the Expo terminal for iOS simulator.

## Workspaces

- `apps/api` — Hono API on Bun
- `apps/mobile` — Expo SDK 55 React Native app
- `packages/shared` — Zod schemas + Hono AppType

## Useful commands

```bash
pnpm typecheck                       # all workspaces
pnpm --filter @wellcore/api test     # api tests only
pnpm --filter @wellcore/api db:generate
pnpm --filter @wellcore/api db:studio
pnpm infra:up                        # postgres + minio only
pnpm infra:down
```

See `docs/plans/` for design docs and phase plans.
`ops/dokploy.md` for deployment notes.

## Design system showcase

Faz 1 ships every brand primitive at the dev-only `/design-system` route.

```bash
pnpm exec --filter @wellcore/mobile expo start --port 8090
# in the simulator, type `wellcore://design-system` or navigate via deep link
```

Primitives included:
- Brand: `WellcoreMark` (xs/sm/md/lg/xl), `WellcoreWordmark`, `Ring`, `TripleRing`, `HeroGradient`
- Data: `CitedText` with bottom-sheet `CitationModal`, `EvidenceDot` (●●● / ●●○ / ●○○)
- Onboarding: `ChamberTypeSelector`, `FireSafetySlide`, `CrisisResourcesScreen`
- 13-icon line set
- Citations data: `@wellcore/shared/citations` (zod-validated, 3 vitest tests)

To regenerate Atrium app assets from SVG:

```bash
pnpm gen:assets
```

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

Postgres is mapped to host port **5434** (avoids local Homebrew PG14 conflict on 5432). MinIO is on 9000 (S3 API) + 9001 (console).

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
- `auth_user` is the canonical user table (better-auth manages it). All domain `userId` columns reference `auth_user.id` (text).

### Auth

- better-auth with Apple Sign In via web OAuth flow. Session is httpOnly cookie.
- Native Apple identityToken flow is intentionally NOT used (known better-auth bugs).
- Apple `clientSecret` requires JWT generation in production (see better-auth Apple docs).

### Privacy & consent

- `consent_events` records every CCPA / MHMDA / MODPA / Terms / Privacy acceptance with version + IP + UA.
- `dsar_requests` logs CCPA Data Subject Access Requests; fulfillment is manual for v1.
- `wellness_checkins` uses **structured PROMIS-aligned columns** (NOT a free-form jsonb blob).

## Mobile (apps/mobile) — Onboarding

The mobile app uses Apple **web** OAuth (NOT native identityToken — known better-auth bugs), persists session cookies in `expo-secure-store`, and persists intermediate onboarding state so users can resume on relaunch.

### Bring up

```bash
docker compose -f ops/docker-compose.yml up -d
pnpm --filter @wellcore/api db:migrate && pnpm --filter @wellcore/api db:seed
pnpm --filter @wellcore/api dev    # terminal A
pnpm --filter @wellcore/mobile dev # terminal B
```

### Env

- `EXPO_PUBLIC_API_URL` (optional) — defaults to LAN IP from `expoConfig.hostUri:3000`.
- Apple OAuth client must be configured on the backend (`APPLE_CLIENT_ID`, `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY`).

### Onboarding flow

Welcome → Apple sign-in → Goals (max 5) → Chamber type → Fire safety (non-skippable, FDA Aug 2025) → Disclaimer → Health cards 1-5 (hard contraindications) → cards 6-7 (soft warnings) → PHQ-9 Item 9 (≥ 1 → mandatory crisis resources screen + suicidality log) → Consent (5 acceptances) → Locale → Profile → Preview → Done (batch commits) → /home.

### Crisis & contraindications

- Cards 1-5 YES → `/onboarding/hard-stop` (terminal — exits to declined page).
- Cards 6-7 YES → soft warning banner, allows continue.
- PHQ-9 Item 9 ≥ 1 → mandatory `CrisisResourcesScreen` + `POST /me/suicidality` server log.

### Persistence

- Onboarding store key: `wellcore.onboarding.v1` in `expo-secure-store`.
- Cookie jar key: `wellcore.cookies.v1`. Force-quit + relaunch resumes on the same screen with state intact.
