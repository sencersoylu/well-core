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
