# Wellcore — From-Scratch Design Doc

**Status:** Approved
**Date:** 2026-05-01
**Owner:** Sencer Soylu

---

## 1. Context

Velora (existing React Native + Expo + Supabase app for hyperbaric oxygen therapy
tracking) is being **rebuilt from scratch** — not rebranded. The existing
`velora-app/` repo stays as a reference implementation; Wellcore lives in a new
monorepo with a new identity, new backend, and new architecture.

**Reference inputs:**
- Design handoff bundle from Claude Design (warm-paper light theme, Atrium logo,
  three-ring metric system, Bevel + Whoop hybrid). Source files lived in
  `/tmp/velora-design/velora/project/` during scoping.
- Existing velora-app business logic (session state machine, goals, achievements,
  offline queue) — to be ported, not copy-pasted.

## 2. Brand

| | Value |
|---|---|
| Name | Wellcore |
| Domain | wellcore.app |
| Bundle ID | `com.sencersoylu.wellcore` |
| Tagline | "Pressure into clarity. One breath at a time." |
| Logo | **Atrium** — two concentric ink rings (outer = chamber, inner = self) |
| Wordmark | Newsreader Italic, lowercase, `-0.02em` tracking |
| Theme | Light only — warm paper aesthetic |
| Surface | `#f6f4ef` bg · `#ffffff` elevated · `#efece5` soft |
| Ink | `#1a1a1a` primary · `#3d3a36` / `#6b6760` / `#9a958c` scale |
| Accents (3 rings) | Amber `#e8a06a` (Adherence) · Sage `#5b8c7b` (Recovery) · Terracotta `#c66a5b` (Vitality) |
| Hero gradient | Peach `#f4d6c0` → Blush `#e9c8d5` → Sky `#c8d8e4` |
| Display font | Newsreader (italic-leaning) |
| Body font | Inter |
| Iconography | Custom 1.5px stroke line icons (no external lib) |

## 3. Tech Stack (locked)

### Mobile (`apps/mobile`)
- React Native + **Expo SDK 55** (New Architecture, Reanimated 4)
- Expo Router (file-based)
- TanStack Query (server state) + Zustand + AsyncStorage persist (client state)
- expo-secure-store (auth tokens), expo-file-system (new File API for uploads),
  expo-web-browser (better-auth OAuth flow), expo-haptics, expo-notifications,
  react-native-svg, expo-linear-gradient
- **i18n:** `i18next` + `react-i18next`, locales: `tr`, `en` (TR primary)

### Backend (`apps/api`)
- **Hono** + `hc` typed RPC client (Metro resolver patch on mobile side)
- **Drizzle ORM** (strict mode, `drizzle-kit generate` only — never `push` in prod)
- PostgreSQL 16
- **better-auth** with `@better-auth/expo` plugin
  - Email + password
  - Apple Sign In via **web OAuth flow** (not native identityToken — known bugs)
  - JWT + refresh, sessions in DB
- **MinIO** (S3-compatible) — presigned PUT URLs for uploads (avatars, audio notes)
- Zod for request/response validation (schemas exported from `packages/shared`)

### Infrastructure
- **Dokploy** on VPS (self-hosted PaaS)
  - Traefik for automatic Let's Encrypt HTTPS
  - Postgres + MinIO as managed containers
  - GitHub auto-deploy webhooks + manual deploy fallback (webhook flakiness
    documented in dokploy#3787)
  - Subdirectory builds via "Build Path" config (monorepo-aware)

### Monorepo
- `pnpm` workspaces + Turborepo
- Layout:
  ```
  wellcore/
  ├── apps/
  │   ├── mobile/       Expo app
  │   └── api/          Hono server
  ├── packages/
  │   └── shared/       Zod schemas, types, AppType export from Hono
  ├── docs/
  └── ops/              Dokploy config, Dockerfiles
  ```

## 4. Data Model (Drizzle target)

| Table | Purpose |
|---|---|
| `user` (better-auth) | Auth identity (email, password hash, OAuth links) |
| `session_auth` (better-auth) | Auth sessions, refresh tokens |
| `account` (better-auth) | OAuth provider links (Apple) |
| `profile` | App-level user data: name, avatar_url, avatar_emoji, timezone, locale |
| `user_settings` | Default durations, reminder intervals, notification prefs, weekly goal, push token |
| `protocols` | Static seed: per-goal preset protocols (total_sessions, frequency, session_config) |
| `user_protocols` | User's active protocol — goal_key, sessions_completed, status, disclaimer_accepted_at |
| `sessions` | Therapy session records — phases, duration, mood_rating, notes, sync metadata |
| `wellness_checkins` | Per-session goal-specific metrics (jsonb) |
| `user_achievements` | Unlocked achievement keys per user |

## 5. Domain Logic to Port (from velora-app)

These are non-negotiable — port the logic faithfully, swap only the data layer.

### Session state machine (`stores/sessionStore.ts`)
- 4 phases: `idle → pressurization → treatment → decompression → idle`
- Per-phase elapsed + total elapsed counters, `tick()` driven by interval hook
- **Pause/resume** with pause-duration accounting
- **Wall-clock recalculation on background resume** — critical correctness logic;
  recomputes phase + elapsed from `sessionStartedAt` minus `pausedDurationSeconds`
  when app comes back to foreground
- **Ear reminder** during pressurization (every `earReminderInterval` seconds)
- **Mask reminder** during treatment (every `maskReminderInterval` seconds, if > 0)
- Persisted via Zustand AsyncStorage middleware

### Goals → Protocols → User Protocols
- 9 wellness goals: `radiance`, `recovery`, `vitality`, `wellness`, `brain_fog`,
  `long_covid`, `neuro_recovery`, `athletic_performance`, `anti_aging`
- 3 categories: `beauty_wellness`, `energy_performance`, `recovery_healing`
- Each goal has a preset Protocol (total sessions, weekly frequency range,
  session config). User picks goal → instantiates UserProtocol.
- `isMedicalCondition` goals (long_covid, neuro_recovery) require disclaimer
  acceptance with timestamp before first session.

### Wellness check-ins
- After each session, user submits goal-specific metrics (`Record<string, number>`)
- Linked to `user_protocols.id` and `sessions.id`
- Drives the Recovery ring on home screen.

### Achievements (8 keys)
- `first_session` (bronze) · `week_warrior` (silver, 7-day streak) ·
  `month_master` (gold, 30-day streak) · `century_club` (platinum, 100 sessions) ·
  `hour_hero` (bronze, 60min in single session) ·
  `early_bird` (silver, 10 sessions before 9 AM) ·
  `night_owl` (silver, 10 sessions after 8 PM) ·
  `consistency_king` (gold, 28 sessions in 4 weeks)
- Time-of-day counters live on user record; checked + unlocked on session complete.

### Offline queue (`services/offline.ts`)
- NetInfo listener; queue ops: `CREATE_SESSION`, `UPDATE_SESSION`, `DELETE_SESSION`
- Max 3 retries per op, dropped after; processed on reconnect
- Local IDs (`generateLocalId()`) reconciled with server IDs after sync

## 6. Screen Inventory (mobile)

### Auth (3 screens)
- `auth/login` · `auth/register` · `auth/forgot-password`
- Apple Sign In via better-auth web OAuth flow

### Onboarding (10 screens, "Long" variant)
1. **Welcome** — atmospheric gradient bloom, breathing ring, "A new way to *breathe*"
2. **Education 1/3 — What** (chamber + light rays illustration)
3. **Education 2/3 — How** (blood vessel + O₂ molecules, "%1500 oxygen increase")
4. **Education 3/3 — Why** (4-week calendar grid, use cases)
5. **Goal Select** — 9 goals across 3 categories
6. **Personalize** — age slider, activity (4 chips), sleep slider, target date (4w/12w/Ongoing)
7. **Health Screening** — 5 yes/no cards (lung, sinus, ear, pregnancy, heart, meds).
   Single "yes" → red-flag state, "Talk to a clinician" CTA.
8. **Expectations Timeline** — goal-specific dynamic timeline (week 1 → 4 → 12)
9. **Prep Checklist** — 5 items (ear equalization, no tight clothing, hydration,
   no nicotine, plan 60min)
10. **Ready** — cinematic bloom, "Welcome, {name}", protocol summary card

"Short" variant (4 screens) gated behind tweaks panel for testing only — not
shipped in v1.

### Main tabs (5)
- **Home** — TripleRing hero (Adherence/Recovery/Vitality), active protocol card,
  "Begin session" CTA, daily tip
- **Progress** — weekly adherence chart + 14-day mood trend + achievements grid
- **Start** — quick-launch session (FAB target)
- **History/Journal** — 35-day calendar dot grid + mood trend graph + session list
- **Profile** — account, settings, notifications, sign out

### Session flow (modal stack)
- `session/pre-check` — pre-session form (mood, symptoms) → `persistSessionStart()`
- `session/active` — 3-phase timer + live pressure curve + ear/mask reminders +
  pause/end controls
- `session/complete` — celebration, mood selection, reflection note,
  achievement unlock toast

**Total: 21 screens** (3 auth + 10 onboarding + 5 tabs + 3 session)

## 7. Phase Roadmap

| Phase | Scope | Est. |
|---|---|---|
| **0 — Foundation** | Monorepo scaffold (pnpm + Turborepo), shared zod package, Hono boilerplate + Drizzle + Postgres + Docker, Expo SDK 55 init + Expo Router + theme tokens + font loading + i18next | 1 wk |
| **1 — Design system** | Wellcore theme tokens, brand primitives (WellcoreMark, Wordmark, Ring, TripleRing, HeroGradient), icon set, asset generation (icon, splash, adaptive-icon), Storybook-ish showcase screen | 1 wk |
| **2 — Backend core** | Drizzle schemas + migrations, better-auth setup with Apple web OAuth, sessions/profile/settings/achievements/protocols/checkins endpoints, MinIO presigned URL endpoint, Dokploy deploy + smoke test | 1.5 wk |
| **3 — Auth + onboarding** | 3 auth screens, 10-step onboarding flow with health-screening branching, secure token storage, locale picker | 1 wk |
| **4 — Core mobile screens** | Home (TripleRing), Active Session (timer + reminders + wall-clock recalc), Complete (mood + reflection), History (calendar + trend), Progress (charts + achievements), Profile | 2 wk |
| **5 — Polish & ship** | Offline queue with retry, animations (Reanimated layouts, ring fills, hero blooms), haptics, accessibility pass, EAS build, store-listing, TestFlight + internal testing track | 1 wk |
| **Total** | | **~7-8 wk** |

## 8. Out of Scope (v1)

- Subscription / paywall (deferred — design chat noted "onboarding'de yok, sonra gel")
- Device pairing (BLE / chamber integration)
- Partner sharing / social features
- Push notification campaigns
- Watch app (iOS/wearOS)

## 9. Open Risks

| Risk | Mitigation |
|---|---|
| better-auth Apple Sign In bugs | Use web OAuth flow only; pin to recent stable version |
| Hono RPC client + Metro bundler | Custom resolver in `metro.config.js`; verify in Faz 0 |
| Dokploy webhook reliability | Manual deploy fallback procedure documented |
| Offline → online sync edge cases | Reuse velora-app's tested queue logic; max-3 retry semantics |
| Wall-clock recalc correctness | Port verbatim from velora; add unit tests in Faz 4 |

## 10. Next Step

After this doc lands, transition to **writing-plans** skill to produce
`docs/plans/2026-05-01-wellcore-faz-0-foundation-plan.md` — an executable,
goal-backward task list for Phase 0 (Foundation).
