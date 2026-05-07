# Wellcore Faz 4 — Core Screens Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Land the daily-use core of Wellcore. After Faz 3 onboarding the user is dropped into a real Home dashboard rendering their TripleRing (Adherence / Recovery / Vitality), can pick a protocol filtered by their `chamberType`, run a session through a 4-phase state machine ported from velora-app (pressurization → treatment → decompression → completed), gate every session start behind a PROMIS pre-check-in, prompt a post-check-in on finish/abort, browse history (paginated), inspect single sessions, view achievements, manage settings (profile, locale, sign-out, DSAR, citations), and read the citations browser. The session state machine is the load-bearing piece: it must survive backgrounding, force-close mid-session, pause/resume with paused-duration accounting, and recompute elapsed time from wall-clock on every foreground event — never trust the JS interval alone. All server reads go through TanStack Query; all writes through `useMutation` with optimistic local state in a Zustand `useSessionStore` separate from the onboarding store. No backend addenda — Faz 4 consumes the surface that Faz 2 already exposes.

**Architecture:** A new Expo Router group at `apps/mobile/app/(app)/*` becomes the authenticated shell (Stack with no header, individual screens drive their own headers). Inside it: `home`, `protocols/index`, `protocols/[slug]`, `session/[id]`, `checkin/pre`, `checkin/post/[sessionId]`, `history/index`, `history/[id]`, `achievements`, `settings`, `citations`. Auth gate — `app/_layout.tsx` already knows the user via `useAuth()`; we add a redirect-on-mount wrapper that sends unauthenticated users to `/onboarding/welcome` and authenticated-but-not-onboarded users back into onboarding. Server state: one TanStack Query hook per resource under `apps/mobile/src/queries/` (`useProtocols`, `useProtocol`, `useUserProtocols`, `useStartProtocol`, `useSessions`, `useSession`, `useCreateSession`, `useUpdateSession`, `useCheckins`, `useCreateCheckin`, `useAchievements`, `useDsar`, `useCitations`). Client state: `useSessionStore` (Zustand + custom `expo-secure-store` persist adapter) holds the live session — `phase`, `phaseStartedAt`, `totalStartedAt`, `pausedDurationMs`, `pauseStartedAt | null`, `wallClockLastTick`, `serverSessionId`, `protocolId`, `pressureAta`, `targetTreatmentSec`, `targetPressurizationSec`, `targetDecompressionSec`. The state machine is a pure-function reducer at `apps/mobile/src/session/state-machine.ts` (8+ cases, fully unit-tested), and `useSession()` is the React hook that wires reducer → store → AppState listener → `setInterval` ticker → debounced backend PATCH. Home aggregates check-ins client-side via `useHomeStats(7)` (or 30) — pure function over the last N days of check-ins to compute three normalized 0-1 ring values. CitationModal/CitedText/EvidenceDot/TripleRing are reused from Faz 1 untouched. All visible strings live in i18n under new namespace keys.

**Tech Stack:** All Faz 1/2/3 deps **plus**:
- `expo-keep-awake` ~14.0.0 — prevent screen sleep during active session
- `expo-haptics` ~14.0.0 — phase-transition feedback (already in Expo SDK 55 metapackage; ensure listed)
- `expo-image-picker` ~16.0.0 — avatar upload (defer to last task; behind a feature flag if scope tight)
- No new backend deps. No new Drizzle schemas.

**Definition of done:**
- `pnpm --filter @wellcore/mobile typecheck` passes.
- `pnpm --filter @wellcore/mobile test` passes (≥ 22 tests total: state-machine reducer ≥ 8, home-stats ≥ 5, history-pagination ≥ 3, queries hook smoke ≥ 6).
- Backend tests still pass: `pnpm --filter @wellcore/api test`.
- iOS simulator smoke: cold-launch authenticated → `/(app)/home` renders TripleRing with three values + today's hero card. Tap a protocol → detail → "Start with this protocol" → pre-check-in (4 sliders + 2 PROMIS Global) → session active. Phase advances pressurization (1 min seeded short for dev) → treatment → decompression → completed. Pause once during treatment, resume — paused duration is subtracted. Background the app for 60s during treatment, foreground — elapsed time advanced by 60s (wall-clock recovery). Tap **Finish** → post-check-in → `/home`. Open History → see the session row → tap → see paired pre/post check-ins. Open Settings → change display name → sign-out works. Open Citations → tap a row → CitationModal renders.
- Force-quit during active session → relaunch lands on `/(app)/session/[id]` with the same phase + correct elapsed time (wall-clock recomputed from `wallClockLastTick`).
- Long-press TripleRing on Home toggles 7-day ↔ 30-day window (ring values recompute, animation re-fires).
- Aborting a session always routes to post-check-in; user can skip but it's defaulted to show.
- DSAR submit modal works end-to-end (`POST /privacy/dsar` → ticket toast).
- All visible strings have `en-US` and `tr-TR` keys under `mobile/src/i18n/locales/{en,tr}/app.json` and `session.json`.
- Web fallbacks: every native-only module (expo-keep-awake, expo-haptics, expo-image-picker) has a `.web.ts` shim returning `noop` per the Faz 1/3 pattern, so `pnpm --filter @wellcore/mobile typecheck` is clean against `react-native-web`.
- One commit per task on a `faz-4` branch. Final task pushes the branch — user opens the PR manually.

**Pre-flight:** Branch `main` is checked out. Faz 3 has been merged. No uncommitted changes. iOS simulator available. Backend running locally on `http://localhost:3000` with seeded protocols. A real Apple-signed-in user already exists in the local DB (use the simulator from Faz 3 smoke).

```bash
cd /Users/sencersoylu/Projects/wellcore
git checkout main && git pull
git checkout -b faz-4
docker compose -f ops/docker-compose.yml up -d
pnpm --filter @wellcore/api db:migrate
pnpm --filter @wellcore/api db:seed
pnpm --filter @wellcore/api dev &   # leave running in another terminal
```

**Note on velora-app reference:** This plan ports the session state machine logic from the prior velora-app codebase. If the velora source tree is not present in the working copy at `../velora-app`, clone it read-only into a sibling directory before starting Task 6:

```bash
git -C .. clone --depth 1 <velora-repo-url> velora-app-ref
```

Mine `velora-app-ref/src/screens/SessionScreen` (or equivalent) and `velora-app-ref/src/state/sessionStore` for the timer math and AppState handling. The velora source is a reference — do not import or copy files; transcribe the algorithm to Wellcore's TypeScript with new types.

---

## Task 1: Dependencies + auth-gated `(app)` group + i18n namespaces

**Files:**
- Modify: `apps/mobile/package.json` — add `expo-keep-awake`, `expo-haptics`, `expo-image-picker`
- Create: `apps/mobile/app/(app)/_layout.tsx` — auth gate
- Modify: `apps/mobile/app/_layout.tsx` — register `(app)` group with Stack
- Modify: `apps/mobile/app/index.tsx` (splash) — route authenticated users to `/(app)/home`
- Create: `apps/mobile/src/i18n/locales/en/app.json` — empty `{}` placeholder
- Create: `apps/mobile/src/i18n/locales/tr/app.json` — empty `{}` placeholder
- Create: `apps/mobile/src/i18n/locales/en/session.json` — empty `{}` placeholder
- Create: `apps/mobile/src/i18n/locales/tr/session.json` — empty `{}` placeholder
- Modify: `apps/mobile/src/i18n/index.ts` — register the two new namespaces
- Modify: `pnpm-lock.yaml` (via install)

**Step 1: Edit `apps/mobile/package.json`** — add to `dependencies`:

```json
"expo-keep-awake": "~14.0.0",
"expo-haptics": "~14.0.0",
"expo-image-picker": "~16.0.0"
```

**Step 2: Create `apps/mobile/app/(app)/_layout.tsx`**:

```typescript
import { Redirect, Stack } from "expo-router";
import { useAuth } from "../../src/auth/useAuth";
import { View, ActivityIndicator } from "react-native";
import { Colors } from "../../src/theme";

export default function AppLayout() {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.bg, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={Colors.ink2} />
      </View>
    );
  }
  if (!user) return <Redirect href="/onboarding/welcome" />;
  if (!user.onboardedAt) return <Redirect href="/onboarding/welcome" />;
  return <Stack screenOptions={{ headerShown: false, animation: "fade" }} />;
}
```

**Step 3: Edit `apps/mobile/app/index.tsx`** — after font/auth bootstrap, redirect authenticated, onboarded users to `/(app)/home` instead of `/home`. The current stub `app/home.tsx` should be deleted in Task 2. (For Step 3 leave the redirect target as `/home` until Task 2 lands the new home; the stub still works.)

**Step 4: Edit `apps/mobile/src/i18n/index.ts`** — add `app` and `session` namespaces alongside the existing `common`/`onboarding` registrations.

**Step 5: Install + commit**:

```bash
pnpm install
pnpm --filter @wellcore/mobile typecheck
git add apps/mobile/package.json apps/mobile/app pnpm-lock.yaml apps/mobile/src/i18n
git commit -m "chore(mobile): faz-4 deps + (app) auth-gated group + i18n namespaces"
```

Expected: typecheck silent, `(app)` group registered, splash still routes to existing `/home` stub for now.

---

## Task 2: TanStack Query hooks per resource (`useProtocols` family)

**Files:**
- Create: `apps/mobile/src/queries/keys.ts` — single source of truth for query keys
- Create: `apps/mobile/src/queries/useProtocols.ts`
- Create: `apps/mobile/src/queries/useProtocol.ts`
- Create: `apps/mobile/src/queries/useUserProtocols.ts`
- Create: `apps/mobile/src/queries/useStartProtocol.ts`
- Create: `apps/mobile/src/queries/__tests__/queries.test.ts` — smoke tests with mock `api`

**Step 1: Failing test** — `apps/mobile/src/queries/__tests__/queries.test.ts`:

```typescript
import { describe, expect, test, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useProtocols } from "../useProtocols";

vi.mock("../../api/client", () => ({
  api: {
    protocols: {
      $get: vi.fn().mockResolvedValue({ ok: true, json: async () => [{ id: "p1", slug: "wound-healing", name: "Wound", treatmentMin: 90, pressureAta: "2.0", targetSessionCount: 40, chamberType: "hard", goalIds: ["recovery"], citationTags: ["cao2024"] }] }),
    },
  },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
};

describe("useProtocols", () => {
  test("returns server protocols on success", async () => {
    const { result } = renderHook(() => useProtocols(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.[0]?.slug).toBe("wound-healing");
  });
});
```

**Step 2: Run** `pnpm --filter @wellcore/mobile test queries` — fails (modules don't exist).

**Step 3: Implement** — `apps/mobile/src/queries/keys.ts`:

```typescript
export const qk = {
  protocols: () => ["protocols"] as const,
  protocol: (slug: string) => ["protocols", slug] as const,
  userProtocols: () => ["me", "protocols"] as const,
  sessions: (cursor?: string) => ["me", "sessions", cursor ?? null] as const,
  session: (id: string) => ["sessions", id] as const,
  checkins: (sessionId?: string) => ["me", "checkins", sessionId ?? null] as const,
  achievements: () => ["me", "achievements"] as const,
  citations: () => ["citations"] as const,
};
```

`apps/mobile/src/queries/useProtocols.ts`:

```typescript
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { qk } from "./keys";

export function useProtocols() {
  return useQuery({
    queryKey: qk.protocols(),
    queryFn: async () => {
      const res = await api.protocols.$get();
      if (!res.ok) throw new Error("protocols_fetch_failed");
      return res.json();
    },
    staleTime: 5 * 60_000,
  });
}
```

`apps/mobile/src/queries/useProtocol.ts` — analog for `api.protocols[":slug"].$get({ param: { slug } })`.

`apps/mobile/src/queries/useUserProtocols.ts` — analog for `api.me.protocols.$get()` (uses `staleTime: 30_000`).

`apps/mobile/src/queries/useStartProtocol.ts`:

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import { qk } from "./keys";

export function useStartProtocol() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (protocolId: string) => {
      const res = await api.me.protocols.$post({ json: { protocolId } });
      if (!res.ok) throw new Error("start_protocol_failed");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.userProtocols() }),
  });
}
```

**Step 4: Run** `pnpm --filter @wellcore/mobile test queries` — passes.

**Step 5: Commit**:

```bash
git add apps/mobile/src/queries
git commit -m "feat(mobile): TanStack Query hooks for protocols + user-protocols"
```

---

## Task 3: TanStack Query hooks for sessions, check-ins, achievements, citations, DSAR

**Files:**
- Create: `apps/mobile/src/queries/useSessions.ts` — paginated list (returns `useInfiniteQuery`)
- Create: `apps/mobile/src/queries/useCreateSession.ts`
- Create: `apps/mobile/src/queries/useUpdateSession.ts`
- Create: `apps/mobile/src/queries/useCheckins.ts`
- Create: `apps/mobile/src/queries/useCreateCheckin.ts`
- Create: `apps/mobile/src/queries/useAchievements.ts`
- Create: `apps/mobile/src/queries/useCitations.ts`
- Create: `apps/mobile/src/queries/useDsar.ts`
- Create: `apps/mobile/src/queries/__tests__/sessions-pagination.test.ts`

**Step 1: Failing test** — `sessions-pagination.test.ts` — assert that `useSessions` calls `api.me.sessions.$get` with the `cursor` from the prior page on `fetchNextPage`. Cover three cases: empty initial page, one full page → `nextCursor` set, follow-up call carries the cursor.

**Step 2: Run** — fails.

**Step 3: Implement** `useSessions`:

```typescript
import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { qk } from "./keys";

export function useSessions(limit = 20) {
  return useInfiniteQuery({
    queryKey: qk.sessions(),
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const res = await api.me.sessions.$get({
        query: { limit: String(limit), ...(pageParam ? { cursor: pageParam } : {}) },
      });
      if (!res.ok) throw new Error("sessions_fetch_failed");
      return res.json();
    },
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });
}
```

`useCreateSession`, `useUpdateSession`, `useCreateCheckin` — `useMutation` against `api.sessions.$post`, `api.sessions[":id"].$patch`, `api.checkins.$post`. On success invalidate the relevant `qk.*` keys.

`useCheckins(sessionId?: string)` — `useQuery` against `api.me.checkins.$get({ query: { sessionId, limit: '40' } })`.

`useAchievements`, `useCitations` — single-page `useQuery` with `staleTime: 60_000`.

`useDsar` — `useMutation` against `api.privacy.dsar.$post`.

**Step 4: Run** — passes.

**Step 5: Commit**:

```bash
git add apps/mobile/src/queries
git commit -m "feat(mobile): query hooks for sessions, check-ins, achievements, citations, DSAR"
```

---

## Task 4: Session state-machine reducer (pure functions + tests)

**Files:**
- Create: `apps/mobile/src/session/state-machine.ts`
- Create: `apps/mobile/src/session/__tests__/state-machine.test.ts`

**Step 1: Failing tests** — `apps/mobile/src/session/__tests__/state-machine.test.ts` — cover ≥ 8 cases:

```typescript
import { describe, expect, test } from "vitest";
import { reduce, initial, type SessionAction, type SessionState } from "../state-machine";

const T0 = 1_000_000_000_000;
const baseTargets = { pressurizationSec: 60, treatmentSec: 600, decompressionSec: 60 };

const startAction = (now = T0): SessionAction => ({
  type: "START",
  now,
  serverSessionId: "s1",
  protocolId: "p1",
  pressureAta: 2.0,
  targets: baseTargets,
});

describe("session state machine", () => {
  test("initial state is idle with null fields", () => {
    expect(initial.phase).toBe("idle");
    expect(initial.serverSessionId).toBeNull();
  });

  test("START transitions idle → pressurization, captures wall-clock anchors", () => {
    const s = reduce(initial, startAction());
    expect(s.phase).toBe("pressurization");
    expect(s.totalStartedAt).toBe(T0);
    expect(s.phaseStartedAt).toBe(T0);
    expect(s.pausedDurationMs).toBe(0);
    expect(s.serverSessionId).toBe("s1");
  });

  test("TICK during pressurization advances elapsed via wall-clock", () => {
    const s1 = reduce(initial, startAction());
    const s2 = reduce(s1, { type: "TICK", now: T0 + 30_000 });
    expect(s2.wallClockLastTick).toBe(T0 + 30_000);
    // elapsed in current phase is derived in selectors, not stored — but lastTick advances
  });

  test("ADVANCE_PHASE pressurization → treatment when target reached", () => {
    const s1 = reduce(initial, startAction());
    const s2 = reduce(s1, { type: "ADVANCE_PHASE", now: T0 + 60_000 });
    expect(s2.phase).toBe("treatment");
    expect(s2.phaseStartedAt).toBe(T0 + 60_000);
  });

  test("PAUSE captures pauseStartedAt, RESUME accumulates pausedDurationMs", () => {
    const s1 = reduce(initial, startAction());
    const s2 = reduce(s1, { type: "PAUSE", now: T0 + 30_000 });
    expect(s2.pauseStartedAt).toBe(T0 + 30_000);
    const s3 = reduce(s2, { type: "RESUME", now: T0 + 50_000 });
    expect(s3.pauseStartedAt).toBeNull();
    expect(s3.pausedDurationMs).toBe(20_000);
  });

  test("PAUSE while already paused is a no-op", () => {
    const s1 = reduce(initial, startAction());
    const s2 = reduce(s1, { type: "PAUSE", now: T0 + 10_000 });
    const s3 = reduce(s2, { type: "PAUSE", now: T0 + 20_000 });
    expect(s3.pauseStartedAt).toBe(T0 + 10_000);
  });

  test("FOREGROUND_RESYNC after long background recomputes wallClockLastTick", () => {
    const s1 = reduce(initial, startAction());
    const s2 = reduce(s1, { type: "TICK", now: T0 + 10_000 });
    const s3 = reduce(s2, { type: "FOREGROUND_RESYNC", now: T0 + 70_000 });
    expect(s3.wallClockLastTick).toBe(T0 + 70_000);
    // phase remains, but consumers compute new elapsed from phaseStartedAt → 70s
  });

  test("ABORT moves to aborted regardless of phase", () => {
    const s1 = reduce(initial, startAction());
    const s2 = reduce(s1, { type: "ADVANCE_PHASE", now: T0 + 60_000 });
    const s3 = reduce(s2, { type: "ABORT", now: T0 + 90_000 });
    expect(s3.phase).toBe("aborted");
    expect(s3.endedAt).toBe(T0 + 90_000);
  });

  test("COMPLETE only valid from decompression", () => {
    const s1 = reduce(initial, startAction());
    const sBadComplete = reduce(s1, { type: "COMPLETE", now: T0 + 1 });
    expect(sBadComplete.phase).toBe("pressurization"); // ignored
    const sToTreatment = reduce(s1, { type: "ADVANCE_PHASE", now: T0 + 60_000 });
    const sToDecomp = reduce(sToTreatment, { type: "ADVANCE_PHASE", now: T0 + 660_000 });
    const sDone = reduce(sToDecomp, { type: "COMPLETE", now: T0 + 720_000 });
    expect(sDone.phase).toBe("completed");
  });

  test("RESET returns to initial", () => {
    const s1 = reduce(initial, startAction());
    expect(reduce(s1, { type: "RESET" })).toEqual(initial);
  });
});
```

**Step 2: Run** — fails (no module).

**Step 3: Implement** — `apps/mobile/src/session/state-machine.ts`:

```typescript
export type Phase = "idle" | "pressurization" | "treatment" | "decompression" | "completed" | "aborted";

export interface PhaseTargets {
  pressurizationSec: number;
  treatmentSec: number;
  decompressionSec: number;
}

export interface SessionState {
  phase: Phase;
  serverSessionId: string | null;
  protocolId: string | null;
  pressureAta: number | null;
  targets: PhaseTargets | null;
  totalStartedAt: number | null;       // ms epoch
  phaseStartedAt: number | null;       // ms epoch (anchor for elapsed-in-phase)
  pausedDurationMs: number;            // total accumulated paused time across the whole session
  pauseStartedAt: number | null;       // ms epoch when paused, null when running
  wallClockLastTick: number | null;    // last TICK / FOREGROUND_RESYNC time
  endedAt: number | null;
}

export const initial: SessionState = {
  phase: "idle",
  serverSessionId: null,
  protocolId: null,
  pressureAta: null,
  targets: null,
  totalStartedAt: null,
  phaseStartedAt: null,
  pausedDurationMs: 0,
  pauseStartedAt: null,
  wallClockLastTick: null,
  endedAt: null,
};

export type SessionAction =
  | { type: "START"; now: number; serverSessionId: string; protocolId: string | null; pressureAta: number; targets: PhaseTargets }
  | { type: "TICK"; now: number }
  | { type: "FOREGROUND_RESYNC"; now: number }
  | { type: "ADVANCE_PHASE"; now: number }
  | { type: "PAUSE"; now: number }
  | { type: "RESUME"; now: number }
  | { type: "ABORT"; now: number }
  | { type: "COMPLETE"; now: number }
  | { type: "RESET" };

const PHASE_ORDER: Phase[] = ["pressurization", "treatment", "decompression", "completed"];

function nextPhase(p: Phase): Phase {
  const i = PHASE_ORDER.indexOf(p);
  if (i < 0 || i === PHASE_ORDER.length - 1) return p;
  return PHASE_ORDER[i + 1]!;
}

export function reduce(s: SessionState, a: SessionAction): SessionState {
  switch (a.type) {
    case "START":
      if (s.phase !== "idle") return s;
      return {
        ...initial,
        phase: "pressurization",
        serverSessionId: a.serverSessionId,
        protocolId: a.protocolId,
        pressureAta: a.pressureAta,
        targets: a.targets,
        totalStartedAt: a.now,
        phaseStartedAt: a.now,
        wallClockLastTick: a.now,
      };
    case "TICK":
    case "FOREGROUND_RESYNC":
      if (s.phase === "idle" || s.phase === "completed" || s.phase === "aborted") return s;
      return { ...s, wallClockLastTick: a.now };
    case "ADVANCE_PHASE": {
      if (s.phase === "idle" || s.phase === "completed" || s.phase === "aborted") return s;
      const np = nextPhase(s.phase);
      if (np === "completed") return { ...s, phase: "completed", endedAt: a.now };
      return { ...s, phase: np, phaseStartedAt: a.now, wallClockLastTick: a.now };
    }
    case "PAUSE":
      if (s.phase === "idle" || s.phase === "completed" || s.phase === "aborted") return s;
      if (s.pauseStartedAt !== null) return s;
      return { ...s, pauseStartedAt: a.now };
    case "RESUME":
      if (s.pauseStartedAt === null) return s;
      return {
        ...s,
        pausedDurationMs: s.pausedDurationMs + (a.now - s.pauseStartedAt),
        pauseStartedAt: null,
        wallClockLastTick: a.now,
      };
    case "ABORT":
      if (s.phase === "idle" || s.phase === "completed" || s.phase === "aborted") return s;
      return { ...s, phase: "aborted", endedAt: a.now };
    case "COMPLETE":
      if (s.phase !== "decompression") return s;
      return { ...s, phase: "completed", endedAt: a.now };
    case "RESET":
      return initial;
  }
}

// Pure selectors (consumed by hook + UI).
export function elapsedInPhaseSec(s: SessionState, now: number): number {
  if (!s.phaseStartedAt) return 0;
  const reference = s.pauseStartedAt ?? now;
  return Math.max(0, Math.floor((reference - s.phaseStartedAt) / 1000));
}

export function totalElapsedSec(s: SessionState, now: number): number {
  if (!s.totalStartedAt) return 0;
  const reference = s.endedAt ?? s.pauseStartedAt ?? now;
  const raw = reference - s.totalStartedAt - s.pausedDurationMs;
  return Math.max(0, Math.floor(raw / 1000));
}

export function shouldAutoAdvance(s: SessionState, now: number): boolean {
  if (!s.targets) return false;
  const e = elapsedInPhaseSec(s, now);
  if (s.phase === "pressurization") return e >= s.targets.pressurizationSec;
  if (s.phase === "treatment") return e >= s.targets.treatmentSec;
  if (s.phase === "decompression") return e >= s.targets.decompressionSec;
  return false;
}
```

**Step 4: Run** — passes.

**Step 5: Commit**:

```bash
git add apps/mobile/src/session
git commit -m "feat(mobile): session state machine reducer + pure selectors with tests"
```

---

## Task 5: `useSessionStore` (Zustand + secure-store persist) and `useSession()` hook

**Files:**
- Create: `apps/mobile/src/session/useSessionStore.ts`
- Create: `apps/mobile/src/session/useSession.ts`
- Create: `apps/mobile/src/session/__tests__/useSessionStore.test.ts`

**Step 1: Failing test** — assert that `useSessionStore` rehydrates from secure-store on first load and that `dispatch({ type: "START", ... })` persists. Reuse the secure-store mock from Faz 3.

**Step 2: Run** — fails.

**Step 3: Implement** — `useSessionStore.ts`:

```typescript
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import * as SecureStore from "expo-secure-store";
import { initial, reduce, type SessionState, type SessionAction } from "./state-machine";

const STORAGE_KEY = "wellcore.session.v1";

type Store = SessionState & {
  dispatch: (a: SessionAction) => void;
  __hydrated: boolean;
};

const secureStorage = createJSONStorage(() => ({
  getItem: (n: string) => SecureStore.getItemAsync(n),
  setItem: (n: string, v: string) => SecureStore.setItemAsync(n, v),
  removeItem: (n: string) => SecureStore.deleteItemAsync(n),
}));

export const useSessionStore = create<Store>()(
  persist(
    (set, get) => ({
      ...initial,
      __hydrated: false,
      dispatch: (a) => set((s) => reduce(s, a)),
    }),
    {
      name: STORAGE_KEY,
      storage: secureStorage,
      onRehydrateStorage: () => (state) => {
        if (state) state.__hydrated = true;
      },
      partialize: (s) => {
        const { dispatch: _d, __hydrated: _h, ...rest } = s;
        return rest;
      },
    }
  )
);
```

`useSession.ts` — the React hook that wires everything:

```typescript
import { useEffect, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { useSessionStore } from "./useSessionStore";
import { shouldAutoAdvance, totalElapsedSec } from "./state-machine";
import { useUpdateSession } from "../queries/useUpdateSession";
import { activateKeepAwake, deactivateKeepAwake } from "expo-keep-awake";
import * as Haptics from "expo-haptics";

const TICK_MS = 1000;
const SYNC_DEBOUNCE_MS = 15_000;

export function useSession() {
  const state = useSessionStore();
  const { mutate: patchSession } = useUpdateSession();
  const lastSyncRef = useRef(0);
  const lastPhaseRef = useRef(state.phase);

  // Keep-awake while active.
  useEffect(() => {
    const isActive = state.phase === "pressurization" || state.phase === "treatment" || state.phase === "decompression";
    if (isActive) activateKeepAwake("wellcore-session");
    else deactivateKeepAwake("wellcore-session");
    return () => deactivateKeepAwake("wellcore-session");
  }, [state.phase]);

  // 1Hz ticker.
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      useSessionStore.getState().dispatch({ type: "TICK", now });
      const s = useSessionStore.getState();
      if (shouldAutoAdvance(s, now)) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
        s.dispatch({ type: "ADVANCE_PHASE", now });
      }
      // Debounced server sync.
      if (s.serverSessionId && now - lastSyncRef.current > SYNC_DEBOUNCE_MS) {
        lastSyncRef.current = now;
        patchSession({
          id: s.serverSessionId,
          totalDurationSec: totalElapsedSec(s, now),
          pausedDurationSec: Math.floor(s.pausedDurationMs / 1000),
          status: "in_progress",
          clientState: { phase: s.phase, phaseStartedAt: s.phaseStartedAt, pausedDurationMs: s.pausedDurationMs },
        });
      }
    }, TICK_MS);
    return () => clearInterval(id);
  }, [patchSession]);

  // Phase-transition definitive PATCH.
  useEffect(() => {
    if (lastPhaseRef.current !== state.phase && state.serverSessionId) {
      const now = Date.now();
      const finalStatus = state.phase === "completed" ? "completed" : state.phase === "aborted" ? "aborted" : "in_progress";
      patchSession({
        id: state.serverSessionId,
        totalDurationSec: totalElapsedSec(state, now),
        pausedDurationSec: Math.floor(state.pausedDurationMs / 1000),
        status: finalStatus,
        endedAt: state.endedAt ? new Date(state.endedAt).toISOString() : undefined,
        clientState: { phase: state.phase, phaseStartedAt: state.phaseStartedAt },
      });
      lastPhaseRef.current = state.phase;
    }
  }, [state.phase, state.serverSessionId, patchSession]);

  // AppState listener — wall-clock recovery.
  useEffect(() => {
    const onChange = (next: AppStateStatus) => {
      if (next === "active") {
        useSessionStore.getState().dispatch({ type: "FOREGROUND_RESYNC", now: Date.now() });
      }
    };
    const sub = AppState.addEventListener("change", onChange);
    return () => sub.remove();
  }, []);

  return state;
}
```

**Step 4: Run** — passes.

**Step 5: Commit**:

```bash
git add apps/mobile/src/session
git commit -m "feat(mobile): useSessionStore + useSession hook with AppState + keep-awake + debounced PATCH"
```

---

## Task 6: Web fallbacks for native-only modules

**Files:**
- Create: `apps/mobile/src/session/keep-awake.web.ts` — re-export `activateKeepAwake`/`deactivateKeepAwake` as no-ops
- Create: `apps/mobile/src/session/haptics.web.ts` — no-op `notificationAsync`/`impactAsync`
- Modify: `useSession.ts` — import from `./keep-awake` and `./haptics` aliases, not directly from packages
- Modify: `apps/mobile/metro.config.js` (if present) or rely on `*.web.ts` resolution (Expo 55 default)

**Step 1: Failing typecheck** — set `pnpm --filter @wellcore/mobile typecheck` with `EXPO_PLATFORM=web` (smoke).

**Step 2: Implement** the two shim files. Each native file (`keep-awake.ts`) re-exports from the package; each `.web.ts` returns no-ops. Update `useSession.ts` imports to the local shims.

**Step 3: Run** typecheck on web — passes.

**Step 4: Commit**:

```bash
git add apps/mobile/src/session
git commit -m "feat(mobile): web fallbacks for keep-awake + haptics in session hook"
```

---

## Task 7: `useHomeStats` aggregator + tests

**Files:**
- Create: `apps/mobile/src/home/useHomeStats.ts`
- Create: `apps/mobile/src/home/__tests__/useHomeStats.test.ts`

**Step 1: Failing tests** — ≥ 5 cases:

1. Empty input → all three rings return 0.
2. One pre-checkin per day for 7 days → adherence = 1.0.
3. Last 7 days vs last 30 days return different denominators.
4. Energy + sleep average computes vitality correctly.
5. Pain (inverted) contributes to recovery — high pain → low recovery.

**Step 2: Run** — fails.

**Step 3: Implement** — pure function `computeHomeStats(checkins, sessions, windowDays, now)`:

```typescript
export interface HomeStats { adherence: number; recovery: number; vitality: number; sessionsThisWeek: number; }

export function computeHomeStats(
  checkins: { recordedAt: string; checkinType: "pre" | "post"; energyLevel: number; sleepQuality: number; painLevel: number; focusLevel: number; promisGlobalPhysical: number; promisGlobalMental: number; }[],
  sessions: { startedAt: string; status: string }[],
  windowDays: number,
  now: Date,
): HomeStats {
  const cutoff = new Date(now.getTime() - windowDays * 86_400_000);
  const recent = checkins.filter((c) => new Date(c.recordedAt) >= cutoff);
  const recentSessions = sessions.filter((s) => new Date(s.startedAt) >= cutoff && s.status === "completed");

  // Adherence = completed sessions / windowDays * targetPerDay (0.5 default — every other day).
  const adherence = Math.min(1, recentSessions.length / Math.max(1, windowDays * 0.5));

  // Recovery = avg of (sleep/10) and (1 - pain/10).
  const sleep = avg(recent.map((c) => c.sleepQuality)) / 10;
  const pain = avg(recent.map((c) => c.painLevel)) / 10;
  const recovery = clamp01((sleep + (1 - pain)) / 2);

  // Vitality = avg of energy/10 and focus/10 (and a bonus from PROMIS Global Mental/5).
  const energy = avg(recent.map((c) => c.energyLevel)) / 10;
  const focus = avg(recent.map((c) => c.focusLevel)) / 10;
  const promis = avg(recent.map((c) => c.promisGlobalMental)) / 5;
  const vitality = clamp01((energy + focus + promis) / 3);

  return { adherence, recovery, vitality, sessionsThisWeek: recentSessions.length };
}

const avg = (xs: number[]) => xs.length === 0 ? 0 : xs.reduce((a, b) => a + b, 0) / xs.length;
const clamp01 = (n: number) => Math.max(0, Math.min(1, isFinite(n) ? n : 0));
```

`useHomeStats(windowDays = 7)` — React hook that pulls `useSessions()` (first page) + `useCheckins()` and memoizes `computeHomeStats(...)`.

**Step 4: Run** — passes.

**Step 5: Commit**:

```bash
git add apps/mobile/src/home
git commit -m "feat(mobile): useHomeStats aggregator with pure compute fn + tests"
```

---

## Task 8: `/(app)/home` — TripleRing dashboard

**Files:**
- Create: `apps/mobile/app/(app)/home.tsx`
- Delete: `apps/mobile/app/home.tsx` (the Faz 3 stub)
- Modify: `apps/mobile/app/index.tsx` (splash) — redirect target now `/(app)/home`
- Add i18n keys: `apps/mobile/src/i18n/locales/en/app.json`, `tr/app.json`

**Step 1: Implement** — `home.tsx` lays out:
- SafeArea container, top row: greeting + today's date (`format(new Date(), "EEE d LLL")`).
- Centerpiece: `<TripleRing />` from Faz 1, sized to ~min(screen.w * 0.7, 320). Long-press toggles `windowDays` between 7 and 30 (local `useState`).
- Hero card: if `useUserProtocols()` returns an active protocol, show its name + ATA + "Start session" CTA (routes to `/(app)/checkin/pre?userProtocolId=...`). Else "Pick a protocol" CTA → `/(app)/protocols`.
- Achievement strip: latest unlocked from `useAchievements()` (if any) — small horizontal pill.
- Quick stat: `sessionsThisWeek` count from `useHomeStats()`.

The TripleRing values come from `useHomeStats(windowDays)`. On mount and when data changes, call `tripleRingRef.setRingValues({ a: stats.adherence, b: stats.recovery, c: stats.vitality })` so Reanimated re-fires the animation.

**Step 2: Run** simulator → smoke render.

**Step 3: Commit**:

```bash
git add apps/mobile/app/(app)/home.tsx apps/mobile/src/i18n
git rm apps/mobile/app/home.tsx
git commit -m "feat(mobile): home dashboard with TripleRing + 7/30-day toggle + hero card"
```

(No new test required — `useHomeStats` is already tested.)

---

## Task 9: `/(app)/protocols` list + `/(app)/protocols/[slug]` detail

**Files:**
- Create: `apps/mobile/app/(app)/protocols/index.tsx`
- Create: `apps/mobile/app/(app)/protocols/[slug].tsx`
- i18n strings under `app.protocols.*`

**Step 1: Implement list** — `useProtocols()` filtered client-side by `user.chamberType === protocol.chamberType || protocol.chamberType === null`. Each card: `name`, `treatmentMin` min, `pressureAta` ATA, `targetSessionCount` sessions, `<EvidenceDot evidence={protocol.evidenceLevel ?? "moderate"} />` row, `<CitedText citationTags={protocol.citationTags} />` summary line. Tap → `router.push("/(app)/protocols/" + protocol.slug)`.

**Step 2: Implement detail** — `useProtocol(slug)` for full body (name, description, ATA, treatmentMin, target session count, all citations rendered as `<CitedText />`). CTA "Start with this protocol" → `useStartProtocol().mutate(protocol.id)` → on success, route to `/(app)/checkin/pre?userProtocolId=<row.id>&pressureAta=<row.pressureAta>&treatmentSec=<treatmentMin*60>`.

**Step 3: Smoke + commit**:

```bash
git add apps/mobile/app/(app)/protocols apps/mobile/src/i18n
git commit -m "feat(mobile): protocols list (chamber-filtered) + detail with start CTA"
```

---

## Task 10: `/(app)/checkin/pre` — PROMIS sliders gate

**Files:**
- Create: `apps/mobile/app/(app)/checkin/pre.tsx`
- Create: `apps/mobile/src/components/checkin/PromisSlider.tsx` (0–10 slider with label + value)
- Create: `apps/mobile/src/components/checkin/PromisGlobalChip.tsx` (1–5 segmented control)

**Step 1: Implement** — local form state for `energyLevel`, `painLevel`, `sleepQuality`, `focusLevel` (all 0–10) + `promisGlobalPhysical`, `promisGlobalMental` (1–5). Continue is disabled until all six values set.

On Continue: read query params (`userProtocolId`, `pressureAta`, `treatmentSec`). Call `useCreateCheckin()` with `{ checkinType: "pre", sessionId: null, ...values }`. On success, call `useCreateSession()` with `{ userProtocolId, pressureAta, clientState: null }`. On success, dispatch `{ type: "START", now: Date.now(), serverSessionId: row.id, protocolId: <protocolId>, pressureAta, targets: { pressurizationSec: 90, treatmentSec, decompressionSec: 60 } }` then `router.replace("/(app)/session/" + row.id)`.

**Step 2: Smoke + commit**:

```bash
git add apps/mobile/app/(app)/checkin apps/mobile/src/components/checkin
git commit -m "feat(mobile): pre-session check-in with PROMIS sliders + session bootstrap"
```

---

## Task 11: `/(app)/session/[id]` — active session screen (the centerpiece)

**Files:**
- Create: `apps/mobile/app/(app)/session/[id].tsx`
- Create: `apps/mobile/src/components/session/PhaseLabel.tsx`
- Create: `apps/mobile/src/components/session/PhaseTimer.tsx`
- Create: `apps/mobile/src/components/session/EarReminder.tsx`
- Create: `apps/mobile/src/components/session/MaskReminder.tsx`
- Create: `apps/mobile/src/components/session/AbortConfirmSheet.tsx` (uses `@gorhom/bottom-sheet`)

**Step 1: Implement** — top of the screen `useSession()` (so the ticker + AppState wiring runs while this screen is mounted). On mount: if `state.phase === "idle"` (e.g., user landed here without going through pre-checkin) **redirect** to `/(app)/home` — the START dispatch happens in pre-checkin, never here.

Layout:
- Big TripleRing center (no ring values, just a brand visual — pass `0/0/0` or use a dedicated "active session" variant that renders just the outer Reanimated ring whose progress = `elapsedInPhaseSec(state, now) / target(phase)`).
- Big numerals: `formatHMS(totalElapsedSec(state, now))` — re-render every 1s via `useTick()` (small `useState(now)` + `useEffect(setInterval(..., 1000))`).
- `<PhaseLabel phase={state.phase} />` — localized label.
- `<EarReminder visible={state.phase === "pressurization"} />` — flashes every 30s (`opacity` toggles).
- `<MaskReminder visible={state.phase === "treatment"} flashEverySec={300} />`.
- Bottom controls: Pause/Resume button (calls `state.dispatch({ type: "PAUSE", now })` / `RESUME`) + Abort (opens `AbortConfirmSheet` → on confirm `state.dispatch({ type: "ABORT", now: Date.now() })` → `router.replace("/(app)/checkin/post/" + state.serverSessionId)`).
- When `state.phase === "completed"`, auto-route to `/(app)/checkin/post/<id>` after a 1s delay (let the user see the "Done" frame).

**Step 2: Smoke + commit**:

```bash
git add apps/mobile/app/(app)/session apps/mobile/src/components/session
git commit -m "feat(mobile): active session screen with 4-phase state machine + reminders + abort sheet"
```

---

## Task 12: `/(app)/checkin/post/[sessionId]` — post-session check-in

**Files:**
- Create: `apps/mobile/app/(app)/checkin/post/[sessionId].tsx`

**Step 1: Implement** — same form widgets as pre-checkin. On submit: `useCreateCheckin().mutate({ checkinType: "post", sessionId, ...values })`. Header shows a "Skip" link → routes to `/(app)/home` without posting. On either path: call `useSessionStore.getState().dispatch({ type: "RESET" })` to clear the persisted active session, then route home.

**Step 2: Commit**:

```bash
git add apps/mobile/app/(app)/checkin/post
git commit -m "feat(mobile): post-session check-in (skippable) + session store reset"
```

---

## Task 13: `/(app)/history` list + `/(app)/history/[id]` detail

**Files:**
- Create: `apps/mobile/app/(app)/history/index.tsx`
- Create: `apps/mobile/app/(app)/history/[id].tsx`
- Create: `apps/mobile/src/queries/useSessionDetail.ts` — single-session lookup by id (cache from list, fall back to fetch from list query).

**Step 1: Implement** — list uses `useSessions()` (`useInfiniteQuery`). Render in `<FlatList>` with `onEndReached={() => fetchNextPage()}`. Each row: date + duration (`formatHMS(totalDurationSec)`) + `pressureAta` ATA + status pill (`completed`/`aborted`/`in_progress`).

Detail screen pulls the session from the cached list + `useCheckins(sessionId)` to render the paired pre/post check-in (side-by-side cards comparing all six metrics).

**Step 2: Test** — already covered by `sessions-pagination.test.ts` from Task 3.

**Step 3: Commit**:

```bash
git add apps/mobile/app/(app)/history apps/mobile/src/queries
git commit -m "feat(mobile): session history list (paginated) + detail with paired check-ins"
```

---

## Task 14: `/(app)/achievements`

**Files:**
- Create: `apps/mobile/app/(app)/achievements.tsx`
- Create: `apps/mobile/src/components/achievements/AchievementCard.tsx`

**Step 1: Implement** — `useAchievements()` → `<FlatList>` of cards (icon + name + unlocked-on date + description). Empty state: "Complete your first session to unlock your first achievement."

**Step 2: Commit**:

```bash
git add apps/mobile/app/(app)/achievements apps/mobile/src/components/achievements
git commit -m "feat(mobile): achievements screen"
```

---

## Task 15: `/(app)/settings` — profile editor + sign-out + DSAR

**Files:**
- Create: `apps/mobile/app/(app)/settings.tsx`
- Create: `apps/mobile/src/components/settings/DsarSheet.tsx` (bottom sheet — type selector + Submit)
- Create: `apps/mobile/src/queries/useUpdateProfile.ts` — `api.profile.$put`

**Step 1: Implement** — sections:
1. **Profile** — display name, dob, goals (multi-select chips), chamber type (segmented). Save → `useUpdateProfile().mutate(...)`.
2. **Locale** — segmented `en` / `tr` → calls `i18next.changeLanguage(...)` and stores in secure-store (so it persists).
3. **Citations** — link → `/(app)/citations`.
4. **Privacy** — DSAR button opens `DsarSheet`. Sheet has segmented `Access | Deletion | Correction` + Submit. On submit: `useDsar().mutate({ type, notes: "" })` → success toast with `ticketId`.
5. **About** — app version (`Constants.expoConfig?.version`), build number.
6. **Sign out** — `useAuth().signOut()` then `router.replace("/onboarding/welcome")`.

**Step 2: Commit**:

```bash
git add apps/mobile/app/(app)/settings.tsx apps/mobile/src/components/settings apps/mobile/src/queries
git commit -m "feat(mobile): settings (profile, locale, DSAR, sign-out)"
```

---

## Task 16: `/(app)/citations` — citations browser

**Files:**
- Create: `apps/mobile/app/(app)/citations.tsx`

**Step 1: Implement** — `useCitations()` → `<FlatList>`. Each row: tag + title + authors + year. Tap → `useCitationModal().open(tag)` (the existing Faz 1 CitationProvider context).

**Step 2: Commit**:

```bash
git add apps/mobile/app/(app)/citations.tsx
git commit -m "feat(mobile): citations browser"
```

---

## Task 17: Avatar upload (gated; defer if scope tight)

**Files:**
- Create: `apps/mobile/src/components/settings/AvatarPicker.tsx`
- Create: `apps/mobile/src/queries/useAvatarUpload.ts` — `api.uploads.avatar.$post` for presigned URL, then `fetch(PUT, file)`, then `useUpdateProfile()` with the resulting URL
- Modify: `apps/mobile/app/(app)/settings.tsx` to embed `<AvatarPicker />` at the top of Profile

**Step 1: Implement** — `expo-image-picker` to pick a square image, request presigned PUT URL, upload, store URL.

**Step 2: Commit**:

```bash
git add apps/mobile/src/components/settings/AvatarPicker.tsx apps/mobile/src/queries/useAvatarUpload.ts apps/mobile/app/(app)/settings.tsx
git commit -m "feat(mobile): avatar upload via presigned URL"
```

If time is tight, **skip this task** and mark in README. The Definition of Done permits skipping.

---

## Task 18: Wire splash + auth bootstrap to `/(app)/home`; design-system preview

**Files:**
- Modify: `apps/mobile/app/index.tsx` — final redirect target `/(app)/home`
- Modify: `apps/mobile/app/design-system.tsx` — add a "Faz 4 preview" section rendering one example each of HomeHeroCard, AchievementCard, AbortConfirmSheet, PromisSlider, EarReminder, MaskReminder

**Step 1: Implement** — splash flow now: load fonts → bootstrap auth (`/auth/me`) → if `user && user.onboardedAt` → `router.replace("/(app)/home")`, else → `/onboarding/welcome`.

**Step 2: Commit**:

```bash
git add apps/mobile/app
git commit -m "feat(mobile): splash routes to (app)/home; design-system preview for faz-4 components"
```

---

## Task 19: i18n string sweep + en/tr coverage check

**Files:**
- Modify: `apps/mobile/src/i18n/locales/en/app.json`, `en/session.json`, `tr/app.json`, `tr/session.json`
- Create: `apps/mobile/src/i18n/__tests__/coverage.test.ts` — every key in `en/app.json` exists in `tr/app.json` and vice versa (deep walk). Same for `session`.

**Step 1: Failing test** — run `pnpm --filter @wellcore/mobile test coverage` — fails if any key is missing.

**Step 2: Implement** — fill in every TR string. Common ones below; finalize during the task:

- `app.home.greeting`, `app.home.startCta`, `app.home.pickProtocolCta`, `app.home.weekStat`, `app.home.window7`, `app.home.window30`
- `app.protocols.title`, `app.protocols.startCta`, `app.protocols.notForChamber`
- `session.phase.pressurization`, `session.phase.treatment`, `session.phase.decompression`, `session.phase.completed`, `session.phase.aborted`
- `session.controls.pause`, `session.controls.resume`, `session.controls.abort`, `session.controls.abortConfirmTitle`, `session.controls.abortConfirmBody`
- `session.reminders.ear`, `session.reminders.mask`
- `app.checkin.pre.title`, `app.checkin.post.title`, `app.checkin.skip`
- `app.history.empty`, `app.history.duration`
- `app.settings.profile`, `app.settings.locale`, `app.settings.privacy`, `app.settings.dsar.access`, `app.settings.dsar.deletion`, `app.settings.dsar.correction`, `app.settings.dsar.submit`, `app.settings.signOut`, `app.settings.about`

**Step 3: Run coverage test** — passes.

**Step 4: Commit**:

```bash
git add apps/mobile/src/i18n
git commit -m "i18n(mobile): faz-4 strings + en/tr coverage test"
```

---

## Task 20: README update + simulator smoke + push

**Files:**
- Modify: `apps/mobile/README.md` — "Faz 4 Core Screens" section
- Modify: `README.md` (root) — bump roadmap status

**Step 1: Smoke** — full pass on iOS simulator:

1. Cold-launch authenticated → `/(app)/home`.
2. Tap "Pick a protocol" → list → tap one → detail → "Start with this protocol" → pre-checkin → fill all six → Continue → session/[id] starts.
3. Watch pressurization elapse (use a dev-shortened 60s pressurization). Phase auto-advances → treatment.
4. Pause once for 10s, resume — watch `pausedDurationMs` reflect.
5. Background app for 60s during treatment, foreground — total elapsed has advanced ~60s.
6. Tap Abort → confirm sheet → confirm → routes to post-checkin.
7. Submit post-checkin → `/(app)/home`.
8. Open History → see new row. Tap → see paired pre/post.
9. Settings → change locale to TR → strings flip. Sign out works. Sign back in.
10. Force-quit during a fresh session → relaunch lands on session/[id] with the right phase + elapsed.

**Step 2: Run all tests + typecheck**:

```bash
pnpm --filter @wellcore/api typecheck && pnpm --filter @wellcore/api test
pnpm --filter @wellcore/mobile typecheck && pnpm --filter @wellcore/mobile test
```

**Step 3: Push branch**:

```bash
git push -u origin faz-4
```

User opens the PR manually.

**Step 4: Commit README**:

```bash
git add README.md apps/mobile/README.md
git commit -m "docs: faz-4 readme + roadmap bump"
git push
```

---

## Dependency graph

```
Task 1 (deps + (app) group + i18n NS)
  └─ Task 2 (protocol queries)
       └─ Task 3 (sessions/checkins/achievements/citations/dsar queries)
            ├─ Task 4 (state-machine reducer + tests)
            │    └─ Task 5 (useSessionStore + useSession)
            │         └─ Task 6 (web fallbacks)
            │              └─ Task 11 (session active screen)
            │                   └─ Task 12 (post-checkin)
            ├─ Task 7 (useHomeStats)
            │    └─ Task 8 (home dashboard)
            ├─ Task 9 (protocols list/detail)
            │    └─ Task 10 (pre-checkin)
            │         └─ Task 11 (session active)
            ├─ Task 13 (history list+detail)
            ├─ Task 14 (achievements)
            ├─ Task 15 (settings + DSAR)
            │    └─ Task 17 (avatar upload — optional)
            └─ Task 16 (citations browser)
Tasks 8-17 ─┬─→ Task 18 (splash wiring + design-system preview)
            └─→ Task 19 (i18n coverage)
                 └─ Task 20 (README + smoke + push)
```

Tasks 8–10 and 13–16 can be parallelized after Task 7 lands; Task 11 blocks on 4-6 + 10. Task 18 waits on all UI tasks. Task 19 can run in parallel with 18 if i18n keys are added inside each task as it lands. Task 20 is terminal.

---

## Critical correctness notes

1. **The reducer is the truth.** All UI reads `useSessionStore()` and computes display values via the pure selectors `elapsedInPhaseSec` / `totalElapsedSec` / `shouldAutoAdvance`. The 1Hz `setInterval` only emits `TICK` actions; it does not advance phase by itself. `ADVANCE_PHASE` happens iff `shouldAutoAdvance(s, now)` returns true, which is wall-clock-based — backgrounding cannot stall a phase.
2. **Wall-clock recovery.** `FOREGROUND_RESYNC` fires on every `AppState change → "active"`. The selectors derive elapsed from `phaseStartedAt` and `Date.now()`, so recovering from background is automatic; no explicit "advance the timer by N seconds" math is needed.
3. **Pause math.** `pauseStartedAt` freezes elapsed (selectors return the pre-pause value because they substitute `pauseStartedAt` for `now`). On RESUME we accumulate the paused span into `pausedDurationMs` and `wallClockLastTick` is bumped. `totalElapsedSec` subtracts `pausedDurationMs` from total wall-clock span.
4. **Pre-checkin gate.** A session row is only created **after** the pre-checkin POST succeeds. If pre-checkin fails, no session exists. This is the safety property the design doc calls out.
5. **Post-checkin always offered on abort.** Confirm sheet on Abort dispatches `ABORT`, then routes to post-checkin. User may skip; both paths reset the session store.
6. **Force-quit recovery.** The persisted Zustand state contains `phase`, `phaseStartedAt`, `totalStartedAt`, `pausedDurationMs`, `serverSessionId`. On relaunch, `(app)/_layout.tsx` checks `useSessionStore.getState().phase` — if it's an active phase and `serverSessionId` is set, redirect to `/(app)/session/<serverSessionId>` (if not already there). This redirect is added in Task 18.
7. **Debounced sync vs definitive sync.** The 15s debounce keeps the server warm with `in_progress` rows; the phase-transition `useEffect` writes the **definitive** PATCH (status / endedAt) on every transition — never lost.
8. **Long-press on TripleRing.** Pure local `useState`, no backend involvement. Reanimated re-fires on `windowDays` change because `useHomeStats` returns new ring values.
