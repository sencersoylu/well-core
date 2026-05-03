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

```bash
curl https://api.wellcore.app/health
# expect: {"ok":true,"version":"<x.y.z>"}
```
