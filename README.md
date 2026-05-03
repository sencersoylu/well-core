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
