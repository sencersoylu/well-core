#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "→ starting docker infra"
docker compose -f ops/docker-compose.yml up -d --wait

echo "→ starting api + mobile (turbo --parallel)"
pnpm turbo run dev --parallel
