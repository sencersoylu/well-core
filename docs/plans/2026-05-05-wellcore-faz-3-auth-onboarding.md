# Wellcore Faz 3 — Auth + Onboarding Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Wire the mobile app to the Faz 2 backend with cookie-based session auth, drive Apple Sign In via the **web OAuth** flow (NOT the native `identityToken` flow — known better-auth bugs), implement the v2 14-screen onboarding flow (welcome → goals → chamber type → fire safety → disclaimer → 8 health-screening cards including PHQ-9 Item 9 → consent → locale → profile → preview → done), persist intermediate state to `expo-secure-store` so the user can resume after force-close, and end up on a stub `/home` route that proves the full pipeline works against a real backend. Adds one backend addendum: `POST /me/suicidality` + `suicidality_screens` write path.

**Architecture:** RPC client wraps `hc<AppType>(url, { fetch })` with a custom fetch that reads/writes a cookie jar persisted in `expo-secure-store` — every request attaches `cookie:`, every response extracts `set-cookie` and merges in. Apple OAuth uses `expo-web-browser.openAuthSessionAsync()` to open the backend's `/api/auth/sign-in/social` URL in an in-app browser; the backend redirects to `wellcore://auth/callback?session=...`; `expo-linking` resolves the callback, the cookie has already been written by the in-app browser cookie jar, and `GET /auth/me` confirms the session. Onboarding is one Expo Router stack at `/onboarding/*` (welcome, goals, chamber, fire-safety, disclaimer, health/[card], consent, locale, profile, preview, done) plus two terminal screens (`/onboarding/hard-stop`, `/onboarding/crisis`). Client state lives in a single Zustand store (`useOnboardingStore`) with a custom `persist` adapter wired to `expo-secure-store`. Server state (auth bootstrap, `/profile`, `/profile/disclaimers`, `/profile/consent`) goes through TanStack Query. Final commit (last screen) batches `PUT /profile` + N × `POST /profile/consent` + `POST /profile/disclaimers` + (if score ≥ 1) `POST /me/suicidality`. All visible strings live in i18n (EN primary, TR bundled).

**Tech Stack:** All Faz 1 deps (Expo SDK 55, Expo Router, Reanimated 4, react-native-svg, @gorhom/bottom-sheet v5, i18next, expo-secure-store, expo-linking, hono client) **plus**:
- `@tanstack/react-query` ^5.59.0 — server state
- `zustand` ^5.0.0 — client state machine
- `expo-web-browser` ^15.0.0 (already part of Expo SDK 55 metapackage; ensure it's installed)
- `vitest` ^2.1.0 + `@testing-library/react-native` ^12.7.0 — unit tests for the cookie jar and pure logic
- Backend addendum: nothing new; uses existing drizzle/zod/hono/better-auth.

**Definition of done:**
- `pnpm --filter @wellcore/mobile typecheck` passes.
- `pnpm --filter @wellcore/mobile test` passes (cookie jar + onboarding store reducer tests, ≥ 8 tests).
- `pnpm --filter @wellcore/api typecheck` and `test` still pass after the suicidality addendum.
- iOS simulator: cold-launch the app → unauthenticated → lands on `/onboarding/welcome`. Tap **Sign in with Apple** → in-app browser → real Apple → returns to app authenticated. Walk through every screen. Final tap on `/onboarding/done` lands on `/home`. Force-quit at any mid-step screen → relaunch resumes on the same screen with state intact.
- Health screening: cards 1-5 YES → routes to `/onboarding/hard-stop` (cannot continue). Cards 6-7 YES → soft-warning banner but Continue allowed. PHQ-9 Item 9 ≥ 1 → mandatory `/onboarding/crisis` (existing CrisisResourcesScreen) AND `POST /me/suicidality` succeeds.
- Fire Safety slide is non-skippable: **Acknowledge** button is disabled until the user has scrolled to the bottom AND tapped the explicit ack checkbox.
- `consent_events` rows show: terms / privacy / ccpa_sale / mhmda / modpa with version + IP + UA captured server-side.
- `/design-system` route gains a "Onboarding preview" section that renders one example of each screen for visual review without state machine progression.
- All visible strings have `en-US` and `tr-TR` keys under `mobile/src/i18n/locales/{en,tr}/onboarding.json`.
- One commit per task on a `faz-3` branch. Final task pushes the branch — user opens the PR manually.

**Pre-flight:** Branch `main` is checked out. Faz 2 has been merged. No uncommitted changes. iOS simulator available. Backend running locally on `http://localhost:3000` with seeded protocols.

```bash
cd /Users/sencersoylu/Projects/wellcore
git checkout main && git pull
git checkout -b faz-3
docker compose -f ops/docker-compose.yml up -d
pnpm --filter @wellcore/api db:migrate
pnpm --filter @wellcore/api db:seed
pnpm --filter @wellcore/api dev &   # leave running in another terminal
```

---

## Task 1: Dependencies + vitest scaffold + Expo deep link config

**Files:**
- Modify: `apps/mobile/package.json` — add deps and scripts
- Modify: `apps/mobile/app.json` — declare `scheme: "wellcore"` + `associatedDomains` (ios) + intent filter (android)
- Create: `apps/mobile/vitest.config.ts`
- Create: `apps/mobile/src/test/setup.ts`
- Modify: `pnpm-lock.yaml` (via install)

**Step 1: Edit `apps/mobile/package.json`** — add to `dependencies`:

```json
"@tanstack/react-query": "^5.59.0",
"zustand": "^5.0.0",
"expo-web-browser": "~15.0.0"
```

Add to `devDependencies`:

```json
"@testing-library/react-native": "^12.7.0",
"vitest": "^2.1.0",
"@vitest/coverage-v8": "^2.1.0",
"jsdom": "^25.0.0"
```

Replace `scripts` with:

```json
"scripts": {
  "dev": "expo start --port 8090",
  "ios": "expo run:ios",
  "android": "expo run:android",
  "typecheck": "tsc --noEmit",
  "test": "vitest run",
  "test:watch": "vitest",
  "clean": "rm -rf .expo .turbo"
}
```

**Step 2: Edit `apps/mobile/app.json`** — ensure `expo.scheme` is `"wellcore"` and add iOS `associatedDomains` placeholder + Android intent filter for `wellcore://auth/callback`:

```json
{
  "expo": {
    "scheme": "wellcore",
    "ios": {
      "bundleIdentifier": "com.wellcore.app",
      "associatedDomains": ["applinks:wellcore.app"]
    },
    "android": {
      "package": "com.wellcore.app",
      "intentFilters": [
        {
          "action": "VIEW",
          "data": [{ "scheme": "wellcore", "host": "auth" }],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

**Step 3: Create `apps/mobile/vitest.config.ts`**

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
  resolve: {
    alias: {
      "expo-secure-store": new URL("./src/test/mocks/expo-secure-store.ts", import.meta.url).pathname,
    },
  },
});
```

**Step 4: Create `apps/mobile/src/test/setup.ts`** — empty for now (placeholder to grow).

```typescript
import { afterEach, vi } from "vitest";
afterEach(() => vi.clearAllMocks());
```

**Step 5: Create `apps/mobile/src/test/mocks/expo-secure-store.ts`**

```typescript
const store = new Map<string, string>();
export async function getItemAsync(key: string) { return store.get(key) ?? null; }
export async function setItemAsync(key: string, value: string) { store.set(key, value); }
export async function deleteItemAsync(key: string) { store.delete(key); }
export function __reset() { store.clear(); }
```

**Step 6: Install + commit**

```bash
pnpm install
pnpm --filter @wellcore/mobile typecheck
git add apps/mobile/package.json apps/mobile/app.json apps/mobile/vitest.config.ts apps/mobile/src/test pnpm-lock.yaml
git commit -m "chore(mobile): faz-3 deps (tanstack-query, zustand, expo-web-browser) + vitest"
```

Expected: typecheck silent; `vitest run` reports "no test files" — that's fine.

---

## Task 2: RPC client cookie jar + auth-aware fetch wrapper

**Files:**
- Create: `apps/mobile/src/api/cookie-jar.ts`
- Create: `apps/mobile/src/api/__tests__/cookie-jar.test.ts`
- Modify: `apps/mobile/src/api/client.ts` — wrap `fetch`

**Step 1: Failing test** — `apps/mobile/src/api/__tests__/cookie-jar.test.ts`:

```typescript
import { describe, expect, test, beforeEach } from "vitest";
import { createCookieJar } from "../cookie-jar";
import { __reset } from "../../test/mocks/expo-secure-store";

beforeEach(() => __reset());

describe("cookie jar", () => {
  test("attachCookies reads stored cookie and sets the cookie header", async () => {
    const jar = createCookieJar();
    await jar.setRawSetCookieHeader("better-auth.session_token=abc123; Path=/; HttpOnly");
    const headers = await jar.attachCookies(new Headers());
    expect(headers.get("cookie")).toBe("better-auth.session_token=abc123");
  });

  test("captureSetCookies merges multiple cookies and persists", async () => {
    const jar = createCookieJar();
    await jar.captureSetCookies(["a=1; Path=/", "b=2; Path=/"]);
    const headers = await jar.attachCookies(new Headers());
    expect(headers.get("cookie")).toMatch(/a=1/);
    expect(headers.get("cookie")).toMatch(/b=2/);
  });

  test("clear() wipes the persisted cookie jar", async () => {
    const jar = createCookieJar();
    await jar.setRawSetCookieHeader("x=1");
    await jar.clear();
    const headers = await jar.attachCookies(new Headers());
    expect(headers.get("cookie")).toBeNull();
  });

  test("Max-Age=0 / Expires in past removes the cookie", async () => {
    const jar = createCookieJar();
    await jar.setRawSetCookieHeader("x=1");
    await jar.setRawSetCookieHeader("x=; Max-Age=0");
    const headers = await jar.attachCookies(new Headers());
    expect(headers.get("cookie")).toBeNull();
  });
});
```

**Step 2: Run** — `pnpm --filter @wellcore/mobile test` → fails (module not found).

**Step 3: Implement** — `apps/mobile/src/api/cookie-jar.ts`:

```typescript
import * as SecureStore from "expo-secure-store";

const STORAGE_KEY = "wellcore.cookies.v1";

type CookieRecord = { name: string; value: string; expiresAt?: number };

function parseSetCookie(line: string): CookieRecord | null {
  const [pair, ...attrs] = line.split(";").map((s) => s.trim());
  if (!pair) return null;
  const eq = pair.indexOf("=");
  if (eq < 0) return null;
  const name = pair.slice(0, eq).trim();
  const value = pair.slice(eq + 1).trim();
  let expiresAt: number | undefined;
  for (const a of attrs) {
    const [k, v] = a.split("=").map((s) => s.trim());
    if (!k) continue;
    if (k.toLowerCase() === "max-age" && v) {
      const seconds = parseInt(v, 10);
      if (Number.isFinite(seconds)) expiresAt = Date.now() + seconds * 1000;
    } else if (k.toLowerCase() === "expires" && v) {
      const t = Date.parse(v);
      if (Number.isFinite(t)) expiresAt = t;
    }
  }
  return { name, value, expiresAt };
}

async function read(): Promise<Map<string, CookieRecord>> {
  const raw = await SecureStore.getItemAsync(STORAGE_KEY);
  if (!raw) return new Map();
  try {
    const arr = JSON.parse(raw) as CookieRecord[];
    return new Map(arr.map((c) => [c.name, c]));
  } catch {
    return new Map();
  }
}

async function write(map: Map<string, CookieRecord>) {
  const now = Date.now();
  const live = [...map.values()].filter((c) => !c.expiresAt || c.expiresAt > now);
  await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(live));
}

export function createCookieJar() {
  return {
    async attachCookies(headers: Headers): Promise<Headers> {
      const map = await read();
      const live = [...map.values()].filter((c) => !c.expiresAt || c.expiresAt > Date.now());
      if (!live.length) return headers;
      const cookieHeader = live.map((c) => `${c.name}=${c.value}`).join("; ");
      headers.set("cookie", cookieHeader);
      return headers;
    },
    async captureSetCookies(lines: string[]): Promise<void> {
      const map = await read();
      for (const line of lines) {
        const c = parseSetCookie(line);
        if (!c) continue;
        if (c.expiresAt && c.expiresAt <= Date.now()) {
          map.delete(c.name);
        } else {
          map.set(c.name, c);
        }
      }
      await write(map);
    },
    async setRawSetCookieHeader(raw: string): Promise<void> {
      // RN fetch returns a single comma-joined string for set-cookie; split safely.
      // Cookie attribute values can contain commas (Expires=Wed, 09 Jun ...) — but better-auth doesn't use Expires, only Max-Age.
      const lines = raw.split(/,(?=\s*[A-Za-z0-9!#$%&'*+\-.^_`|~]+=)/);
      await this.captureSetCookies(lines);
    },
    async clear(): Promise<void> {
      await SecureStore.deleteItemAsync(STORAGE_KEY);
    },
  };
}

export type CookieJar = ReturnType<typeof createCookieJar>;
```

Replace `apps/mobile/src/api/client.ts`:

```typescript
import { hc } from "hono/client";
import type { AppType } from "@wellcore/api";
import Constants from "expo-constants";
import { createCookieJar, type CookieJar } from "./cookie-jar";

const baseUrl =
  process.env.EXPO_PUBLIC_API_URL ??
  Constants.expoConfig?.hostUri?.replace(/:\d+$/, ":3000") ??
  "http://localhost:3000";

export const cookieJar: CookieJar = createCookieJar();

const authedFetch: typeof fetch = async (input, init = {}) => {
  const headers = new Headers(init.headers ?? {});
  await cookieJar.attachCookies(headers);
  const res = await fetch(input, { ...init, headers, credentials: "omit" });
  const setCookie = res.headers.get("set-cookie");
  if (setCookie) await cookieJar.setRawSetCookieHeader(setCookie);
  return res;
};

export const api = hc<AppType>(baseUrl, { fetch: authedFetch });
export const apiBaseUrl = baseUrl;
```

**Step 4: Run** — `pnpm --filter @wellcore/mobile test` → 4 tests pass.

**Step 5: Commit**

```bash
git add apps/mobile/src/api
git commit -m "feat(mobile): rpc client cookie jar persisted in expo-secure-store"
```

---

## Task 3: TanStack Query provider + auth bootstrap hook

**Files:**
- Create: `apps/mobile/src/query/QueryProvider.tsx`
- Create: `apps/mobile/src/auth/useAuth.ts`
- Modify: `apps/mobile/app/_layout.tsx` — wrap with QueryProvider + auth bootstrap routing

**Step 1: Create `apps/mobile/src/query/QueryProvider.tsx`**

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type PropsWithChildren, useState } from "react";

export function QueryProvider({ children }: PropsWithChildren) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, staleTime: 30_000, refetchOnWindowFocus: false },
          mutations: { retry: 0 },
        },
      }),
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
```

**Step 2: Create `apps/mobile/src/auth/useAuth.ts`**

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, cookieJar } from "../api/client";

export type AuthUser = { id: string; email: string; name?: string } | null;

const ME_KEY = ["auth", "me"] as const;

export function useAuth() {
  const qc = useQueryClient();

  const me = useQuery({
    queryKey: ME_KEY,
    queryFn: async (): Promise<AuthUser> => {
      const res = await api.auth.me.$get();
      if (res.status === 401) return null;
      if (!res.ok) throw new Error(`auth/me ${res.status}`);
      const body = await res.json();
      return body.user ?? null;
    },
  });

  const signOut = useMutation({
    mutationFn: async () => {
      await api.auth.signout.$post();
      await cookieJar.clear();
    },
    onSuccess: () => qc.setQueryData(ME_KEY, null),
  });

  return {
    user: me.data ?? null,
    status: me.isLoading ? "loading" : me.data ? "authenticated" : "unauthenticated",
    refetch: me.refetch,
    signOut: signOut.mutateAsync,
  } as const;
}
```

**Step 3: Modify `apps/mobile/app/_layout.tsx`** — wrap with `QueryProvider`:

```tsx
import "../src/i18n";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { wellcoreFontMap } from "../src/theme/fonts";
import { CitationProvider } from "../src/components/data/CitationProvider";
import { CitationModal } from "../src/components/data/CitationModal";
import { QueryProvider } from "../src/query/QueryProvider";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const [loaded, error] = useFonts(wellcoreFontMap);
  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync().catch(() => undefined);
  }, [loaded, error]);
  if (!loaded && !error) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryProvider>
        <CitationProvider>
          <Stack screenOptions={{ headerShown: false }} />
          <CitationModal />
        </CitationProvider>
      </QueryProvider>
    </GestureHandlerRootView>
  );
}
```

**Step 4: Typecheck + commit**

```bash
pnpm --filter @wellcore/mobile typecheck
git add apps/mobile/src/query apps/mobile/src/auth apps/mobile/app/_layout.tsx
git commit -m "feat(mobile): tanstack-query provider + useAuth bootstrap"
```

---

## Task 4: Zustand onboarding store with secure-store persistence

**Files:**
- Create: `apps/mobile/src/onboarding/types.ts`
- Create: `apps/mobile/src/onboarding/store.ts`
- Create: `apps/mobile/src/onboarding/__tests__/store.test.ts`

**Step 1: Failing test** — `apps/mobile/src/onboarding/__tests__/store.test.ts`:

```typescript
import { describe, expect, test, beforeEach } from "vitest";
import { useOnboardingStore } from "../store";
import { __reset } from "../../test/mocks/expo-secure-store";

beforeEach(() => {
  __reset();
  useOnboardingStore.getState().reset();
});

describe("onboarding store", () => {
  test("starts at welcome step", () => {
    expect(useOnboardingStore.getState().step).toBe("welcome");
  });

  test("setGoals enforces max 5", () => {
    useOnboardingStore.getState().setGoals(["recovery","wellness","brain_fog","long_covid","radiance","anti_aging"]);
    expect(useOnboardingStore.getState().goals.length).toBe(5);
  });

  test("addHealthAnswer with hard contraindication on card 1 marks hardStop", () => {
    useOnboardingStore.getState().addHealthAnswer("pregnancy", true);
    expect(useOnboardingStore.getState().hardStop).toBe(true);
    expect(useOnboardingStore.getState().hardStopReason).toBe("pregnancy");
  });

  test("PHQ-9 Item 9 score >= 1 marks crisis", () => {
    useOnboardingStore.getState().setSuicidalityScore(2);
    expect(useOnboardingStore.getState().crisisRequired).toBe(true);
  });

  test("hydrate roundtrips through secure store", async () => {
    useOnboardingStore.getState().setGoals(["recovery", "wellness"]);
    useOnboardingStore.getState().setChamberType("hard_2_0");
    await useOnboardingStore.getState().persistNow();
    useOnboardingStore.getState().reset();
    expect(useOnboardingStore.getState().goals).toEqual([]);
    await useOnboardingStore.getState().hydrate();
    expect(useOnboardingStore.getState().goals).toEqual(["recovery", "wellness"]);
    expect(useOnboardingStore.getState().chamberType).toBe("hard_2_0");
  });
});
```

**Step 2: Run** — fails.

**Step 3: Implement** — `apps/mobile/src/onboarding/types.ts`:

```typescript
export type OnboardingStep =
  | "welcome"
  | "goals"
  | "chamber"
  | "fire-safety"
  | "disclaimer"
  | "health-1"
  | "health-2"
  | "health-3"
  | "health-4"
  | "health-5"
  | "health-6"
  | "health-7"
  | "health-8"
  | "consent"
  | "locale"
  | "profile"
  | "preview"
  | "done";

export type GoalId =
  | "recovery"
  | "wellness"
  | "brain_fog"
  | "long_covid"
  | "neuro_recovery"
  | "athletic_performance"
  | "radiance"
  | "anti_aging"
  | "vitality";

export type ChamberType = "soft_1_3" | "hard_1_5" | "hard_2_0";

export type HealthCardId =
  | "pregnancy"
  | "pneumothorax"
  | "ear_surgery"
  | "active_malignancy"
  | "severe_copd"
  | "claustrophobia"
  | "recent_surgery"
  | "phq9_item9";

export type ConsentType = "terms" | "privacy" | "ccpa_sale" | "mhmda" | "modpa";

export type ConsentAcceptance = { type: ConsentType; version: string; acceptedAt: string };
```

`apps/mobile/src/onboarding/store.ts`:

```typescript
import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import type {
  ChamberType,
  ConsentAcceptance,
  GoalId,
  HealthCardId,
  OnboardingStep,
} from "./types";

const STORAGE_KEY = "wellcore.onboarding.v1";

const HARD_CARDS: HealthCardId[] = [
  "pregnancy",
  "pneumothorax",
  "ear_surgery",
  "active_malignancy",
  "severe_copd",
];
const SOFT_CARDS: HealthCardId[] = ["claustrophobia", "recent_surgery"];

type State = {
  step: OnboardingStep;
  goals: GoalId[];
  chamberType: ChamberType | null;
  fireSafetyAcked: boolean;
  disclaimersAcked: boolean;
  healthAnswers: Array<{ cardId: HealthCardId; answer: boolean }>;
  suicidalityScore: number | null; // 0-3 PHQ-9 Item 9
  crisisRequired: boolean;
  hardStop: boolean;
  hardStopReason: HealthCardId | null;
  softWarning: boolean;
  consentAcceptances: ConsentAcceptance[];
  locale: "en-US" | "tr-TR";
  displayName: string;
  dob: string | null;
};

type Actions = {
  setStep: (s: OnboardingStep) => void;
  setGoals: (g: GoalId[]) => void;
  setChamberType: (c: ChamberType) => void;
  ackFireSafety: () => void;
  ackDisclaimers: () => void;
  addHealthAnswer: (cardId: HealthCardId, answer: boolean) => void;
  setSuicidalityScore: (n: number) => void;
  addConsent: (c: ConsentAcceptance) => void;
  setLocale: (l: "en-US" | "tr-TR") => void;
  setProfile: (p: { displayName?: string; dob?: string | null }) => void;
  reset: () => void;
  persistNow: () => Promise<void>;
  hydrate: () => Promise<void>;
};

const initial: State = {
  step: "welcome",
  goals: [],
  chamberType: null,
  fireSafetyAcked: false,
  disclaimersAcked: false,
  healthAnswers: [],
  suicidalityScore: null,
  crisisRequired: false,
  hardStop: false,
  hardStopReason: null,
  softWarning: false,
  consentAcceptances: [],
  locale: "en-US",
  displayName: "",
  dob: null,
};

export const useOnboardingStore = create<State & Actions>()((set, get) => ({
  ...initial,
  setStep: (step) => { set({ step }); void get().persistNow(); },
  setGoals: (g) => { set({ goals: g.slice(0, 5) }); void get().persistNow(); },
  setChamberType: (c) => { set({ chamberType: c }); void get().persistNow(); },
  ackFireSafety: () => { set({ fireSafetyAcked: true }); void get().persistNow(); },
  ackDisclaimers: () => { set({ disclaimersAcked: true }); void get().persistNow(); },
  addHealthAnswer: (cardId, answer) => {
    const next = get().healthAnswers.filter((a) => a.cardId !== cardId).concat({ cardId, answer });
    const hardStopHit = next.find((a) => a.answer && HARD_CARDS.includes(a.cardId));
    const softHit = next.some((a) => a.answer && SOFT_CARDS.includes(a.cardId));
    set({
      healthAnswers: next,
      hardStop: !!hardStopHit,
      hardStopReason: hardStopHit?.cardId ?? null,
      softWarning: softHit,
    });
    void get().persistNow();
  },
  setSuicidalityScore: (n) => {
    set({ suicidalityScore: n, crisisRequired: n >= 1 });
    void get().persistNow();
  },
  addConsent: (c) => {
    const next = get().consentAcceptances.filter((x) => x.type !== c.type).concat(c);
    set({ consentAcceptances: next });
    void get().persistNow();
  },
  setLocale: (l) => { set({ locale: l }); void get().persistNow(); },
  setProfile: ({ displayName, dob }) => {
    set({
      displayName: displayName ?? get().displayName,
      dob: dob === undefined ? get().dob : dob,
    });
    void get().persistNow();
  },
  reset: () => { set(initial); void SecureStore.deleteItemAsync(STORAGE_KEY); },
  persistNow: async () => {
    const { setStep: _a, setGoals: _b, setChamberType: _c, ackFireSafety: _d, ackDisclaimers: _e,
      addHealthAnswer: _f, setSuicidalityScore: _g, addConsent: _h, setLocale: _i, setProfile: _j,
      reset: _k, persistNow: _l, hydrate: _m, ...snap } = get();
    await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(snap));
  },
  hydrate: async () => {
    const raw = await SecureStore.getItemAsync(STORAGE_KEY);
    if (!raw) return;
    try { set({ ...JSON.parse(raw) as State }); } catch { /* ignore */ }
  },
}));
```

**Step 4: Run** — `pnpm --filter @wellcore/mobile test` → all pass.

**Step 5: Commit**

```bash
git add apps/mobile/src/onboarding
git commit -m "feat(mobile): zustand onboarding store with secure-store persistence"
```

---

## Task 5: Backend addendum — POST /me/suicidality

**Files:**
- Create: `apps/api/src/schemas/suicidality.ts`
- Create: `apps/api/src/routes/suicidality.ts`
- Create: `apps/api/src/routes/__tests__/suicidality.test.ts`
- Modify: `apps/api/src/app.ts`

**Step 1: Failing test** — `apps/api/src/routes/__tests__/suicidality.test.ts`:

```typescript
import { describe, expect, test } from "vitest";
import { app } from "../../app.js";
import { createTestUser } from "../../__tests__/helpers/auth-fixture.js";

describe("suicidality screen", () => {
  test("POST /me/suicidality without auth → 401", async () => {
    const res = await app.request("/me/suicidality", {
      method: "POST",
      body: "{}",
      headers: { "content-type": "application/json" },
    });
    expect(res.status).toBe(401);
  });
  test("POST /me/suicidality with score 2 logs and returns 201", async () => {
    const { cookie } = await createTestUser();
    const res = await app.request("/me/suicidality", {
      method: "POST",
      headers: { cookie, "content-type": "application/json" },
      body: JSON.stringify({ score: 2, instrument: "phq9_item9", crisisShown: true }),
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.score).toBe(2);
    expect(body.crisisResourcesShown).toBe(true);
  });
  test("score out of range → 400", async () => {
    const { cookie } = await createTestUser();
    const res = await app.request("/me/suicidality", {
      method: "POST",
      headers: { cookie, "content-type": "application/json" },
      body: JSON.stringify({ score: 9, instrument: "phq9_item9", crisisShown: true }),
    });
    expect(res.status).toBe(400);
  });
});
```

**Step 2: Run** — `pnpm --filter @wellcore/api test` → fails.

**Step 3: Implement** — `apps/api/src/schemas/suicidality.ts`:

```typescript
import { z } from "zod";

export const SuicidalityScreenSchema = z.object({
  score: z.number().int().min(0).max(3),
  instrument: z.literal("phq9_item9").default("phq9_item9"),
  crisisShown: z.boolean(),
});

export type SuicidalityScreenInput = z.infer<typeof SuicidalityScreenSchema>;
```

`apps/api/src/routes/suicidality.ts`:

```typescript
import { Hono } from "hono";
import { db } from "../db/client.js";
import { suicidalityScreens } from "../db/schema/index.js";
import { requireAuth, type AuthVariables } from "../middleware/require-auth.js";
import { SuicidalityScreenSchema } from "../schemas/suicidality.js";

export const suicidalityRoute = new Hono<{ Variables: AuthVariables }>()
  .use("/me/suicidality", requireAuth)
  .post("/me/suicidality", async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const parsed = SuicidalityScreenSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: "invalid_body", issues: parsed.error.issues }, 400);
    const userId = c.var.user.id;
    const [row] = await db.insert(suicidalityScreens).values({
      userId,
      score: parsed.data.score,
      instrument: parsed.data.instrument,
      crisisResourcesShown: parsed.data.crisisShown,
    }).returning();
    return c.json(row, 201);
  });
```

If `suicidality_screens` doesn't already include the columns `score` (int), `instrument` (text), `crisisResourcesShown` (bool), `recordedAt` (timestamp default now), update `apps/api/src/db/schema/suicidality_screens.ts` accordingly and regenerate the migration:

```bash
pnpm --filter @wellcore/api db:generate
pnpm --filter @wellcore/api db:migrate
```

Mount in `apps/api/src/app.ts`:

```typescript
import { suicidalityRoute } from "./routes/suicidality.js";
// ...chain...
.route("/", suicidalityRoute);
```

**Step 4: Run** — `pnpm --filter @wellcore/api test` → all pass (≥ 21).

**Step 5: Commit**

```bash
git add apps/api/src/schemas apps/api/src/routes apps/api/src/app.ts apps/api/src/db
git commit -m "feat(api): POST /me/suicidality logs PHQ-9 Item 9 score with crisis flag"
```

---

## Task 6: Apple OAuth web flow + deep link callback

**Files:**
- Create: `apps/mobile/src/auth/appleSignIn.ts`
- Create: `apps/mobile/app/auth/callback.tsx` — deep link landing route
- Modify: `apps/mobile/app/_layout.tsx` — register the route in the stack

**Step 1: Create `apps/mobile/src/auth/appleSignIn.ts`**

```typescript
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { apiBaseUrl, cookieJar } from "../api/client";

WebBrowser.maybeCompleteAuthSession();

const RETURN_URL = Linking.createURL("auth/callback"); // wellcore://auth/callback

export type AppleSignInResult =
  | { ok: true }
  | { ok: false; reason: "cancel" | "dismiss" | "error"; message?: string };

export async function signInWithApple(): Promise<AppleSignInResult> {
  // Better-auth web OAuth: GET /api/auth/sign-in/social?provider=apple&callbackURL=<return>
  const url =
    `${apiBaseUrl}/api/auth/sign-in/social` +
    `?provider=apple&callbackURL=${encodeURIComponent(RETURN_URL)}`;
  try {
    const result = await WebBrowser.openAuthSessionAsync(url, RETURN_URL, {
      preferEphemeralSession: false,
    });
    if (result.type === "success") {
      // The in-app browser shares its cookie store with our fetch in the same WKWebView container only
      // partially — the OAuth callback redirect target was our backend, which Set-Cookie'd the session.
      // Our cookie jar didn't see it (we never made that request from RN fetch), so we re-fetch /auth/me
      // through a probing request that DOES go through our jar — better-auth sets the cookie on the
      // backend redirect to wellcore://, which the in-app browser captures. To bridge, we ask the backend
      // for a one-time session bootstrap via the URL fragment session token if present.
      const parsed = Linking.parse(result.url);
      const sessionToken = (parsed.queryParams?.session_token as string | undefined) ?? null;
      if (sessionToken) {
        await cookieJar.setRawSetCookieHeader(`better-auth.session_token=${sessionToken}; Path=/`);
      }
      return { ok: true };
    }
    if (result.type === "cancel") return { ok: false, reason: "cancel" };
    if (result.type === "dismiss") return { ok: false, reason: "dismiss" };
    return { ok: false, reason: "error" };
  } catch (e) {
    return { ok: false, reason: "error", message: e instanceof Error ? e.message : String(e) };
  }
}
```

> **Backend coupling note:** The better-auth Apple callback in Faz 2 redirects to `callbackURL`. To bridge cookie state from the in-app browser back into the RN fetch jar reliably, the backend should append the issued session token as a query param `session_token=<token>` on the final `wellcore://auth/callback` redirect. If Faz 2's better-auth config does NOT do this by default, add a tiny shim route `/auth/apple/finish` that reads the better-auth session cookie from the in-app browser request and 302-redirects to `${callbackURL}?session_token=${token}` — document this in the backend addendum task if Faz 2 didn't already wire it.

**Step 2: Create `apps/mobile/app/auth/callback.tsx`** — landing screen that simply forces an auth refresh and redirects:

```tsx
import { useEffect } from "react";
import { Redirect } from "expo-router";
import { useAuth } from "../../src/auth/useAuth";

export default function AuthCallback() {
  const { refetch, status } = useAuth();
  useEffect(() => { void refetch(); }, [refetch]);
  if (status === "loading") return null;
  if (status === "authenticated") return <Redirect href="/onboarding/goals" />;
  return <Redirect href="/onboarding/welcome" />;
}
```

**Step 3: Typecheck + commit**

```bash
pnpm --filter @wellcore/mobile typecheck
git add apps/mobile/src/auth/appleSignIn.ts apps/mobile/app/auth
git commit -m "feat(mobile): apple web OAuth via expo-web-browser + deep link callback"
```

---

## Task 7: Auth-aware root routing (welcome / home stub)

**Files:**
- Modify: `apps/mobile/app/index.tsx` — turn it into an auth gate
- Create: `apps/mobile/app/home.tsx` — stub home route (Faz 4 placeholder)

**Step 1: Replace `apps/mobile/app/index.tsx`**

```tsx
import { useEffect } from "react";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../src/auth/useAuth";
import { useOnboardingStore } from "../src/onboarding/store";
import { Colors } from "../src/theme/index";

export default function Index() {
  const { status } = useAuth();
  const hydrate = useOnboardingStore((s) => s.hydrate);
  const step = useOnboardingStore((s) => s.step);

  useEffect(() => { void hydrate(); }, [hydrate]);

  if (status === "loading") {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.bg }}>
        <ActivityIndicator />
      </View>
    );
  }
  if (status === "unauthenticated") return <Redirect href="/onboarding/welcome" />;
  // Authenticated but mid-onboarding → resume; otherwise home.
  if (step !== "done" && step !== "welcome") return <Redirect href={`/onboarding/${step}` as any} />;
  return <Redirect href="/home" />;
}
```

**Step 2: Create `apps/mobile/app/home.tsx`** — minimal stub:

```tsx
import { Pressable, Text, View, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { Colors, Spacing, TextStyles } from "../src/theme/index";
import { useAuth } from "../src/auth/useAuth";

export default function Home() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  return (
    <View style={styles.root}>
      <Text style={styles.title}>{t("home.welcome", { name: user?.name ?? user?.email ?? "" })}</Text>
      <Text style={styles.body}>{t("home.fazStub")}</Text>
      <Pressable onPress={() => signOut()} style={styles.btn}>
        <Text style={styles.btnText}>{t("home.signOut")}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg, alignItems: "center", justifyContent: "center", gap: Spacing.lg, padding: Spacing.lg },
  title: { ...TextStyles.h1, color: Colors.ink, textAlign: "center" },
  body: { ...TextStyles.body, color: Colors.ink2, textAlign: "center" },
  btn: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg, borderRadius: 999, borderWidth: 1, borderColor: Colors.hairlineStrong },
  btnText: { ...TextStyles.eyebrow, color: Colors.ink2 },
});
```

**Step 3: Typecheck + commit**

```bash
pnpm --filter @wellcore/mobile typecheck
git add apps/mobile/app/index.tsx apps/mobile/app/home.tsx
git commit -m "feat(mobile): auth-aware root routing + home stub"
```

---

## Task 8: Onboarding stack layout + shared chrome (header, progress dots, primary button)

**Files:**
- Create: `apps/mobile/app/onboarding/_layout.tsx`
- Create: `apps/mobile/src/onboarding/ui/OnboardingShell.tsx`
- Create: `apps/mobile/src/onboarding/ui/ProgressDots.tsx`
- Create: `apps/mobile/src/onboarding/ui/PrimaryButton.tsx`
- Create: `apps/mobile/src/onboarding/ui/index.ts` (barrel)

**Step 1: Create `apps/mobile/app/onboarding/_layout.tsx`**

```tsx
import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return <Stack screenOptions={{ headerShown: false, gestureEnabled: false, animation: "slide_from_right" }} />;
}
```

**Step 2: Create `apps/mobile/src/onboarding/ui/ProgressDots.tsx`**

```tsx
import { View, StyleSheet } from "react-native";
import { Colors } from "../../theme/index";

export function ProgressDots({ total, index }: { total: number; index: number }) {
  return (
    <View style={styles.row} accessibilityRole="progressbar" accessibilityValue={{ min: 1, max: total, now: index + 1 }}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[styles.dot, i === index && styles.dotActive, i < index && styles.dotDone]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 6, alignItems: "center" },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.hairline },
  dotDone: { backgroundColor: Colors.ink3 },
  dotActive: { width: 18, backgroundColor: Colors.ink },
});
```

**Step 3: Create `apps/mobile/src/onboarding/ui/PrimaryButton.tsx`**

```tsx
import { Pressable, Text, StyleSheet, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import { Colors, Spacing, TextStyles } from "../../theme/index";

type Props = PressableProps & { label: string; disabled?: boolean; style?: StyleProp<ViewStyle> };

export function PrimaryButton({ label, disabled, style, ...rest }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      style={[styles.btn, disabled && styles.btnDisabled, style]}
      {...rest}
    >
      <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { backgroundColor: Colors.ink, paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg, borderRadius: 999, alignItems: "center" },
  btnDisabled: { backgroundColor: Colors.hairlineStrong },
  label: { ...TextStyles.button, color: Colors.bg },
  labelDisabled: { color: Colors.ink3 },
});
```

**Step 4: Create `apps/mobile/src/onboarding/ui/OnboardingShell.tsx`**

```tsx
import { type PropsWithChildren } from "react";
import { ScrollView, View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Colors, Spacing, TextStyles } from "../../theme/index";
import { ProgressDots } from "./ProgressDots";

type Props = PropsWithChildren<{
  step: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  showBack?: boolean;
  footer: React.ReactNode;
}>;

export function OnboardingShell({ step, totalSteps, title, subtitle, showBack = true, footer, children }: Props) {
  const router = useRouter();
  return (
    <View style={styles.root}>
      <View style={styles.header}>
        {showBack ? (
          <Pressable onPress={() => router.back()} accessibilityRole="button" hitSlop={12}>
            <Text style={styles.back}>{"‹"}</Text>
          </Pressable>
        ) : <View style={{ width: 24 }} />}
        <ProgressDots total={totalSteps} index={step - 1} />
        <View style={{ width: 24 }} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        <View style={{ height: Spacing.lg }} />
        {children}
      </ScrollView>
      <View style={styles.footer}>{footer}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingTop: Spacing.screenTop, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm },
  back: { ...TextStyles.h1, color: Colors.ink, fontSize: 32, lineHeight: 32 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  title: { ...TextStyles.h1, color: Colors.ink, marginTop: Spacing.md },
  subtitle: { ...TextStyles.body, color: Colors.ink3, marginTop: Spacing.sm },
  footer: { padding: Spacing.lg, gap: Spacing.sm, borderTopColor: Colors.hairline, borderTopWidth: StyleSheet.hairlineWidth, backgroundColor: Colors.bg },
});
```

`apps/mobile/src/onboarding/ui/index.ts`:

```typescript
export { OnboardingShell } from "./OnboardingShell";
export { ProgressDots } from "./ProgressDots";
export { PrimaryButton } from "./PrimaryButton";
```

**Step 5: Typecheck + commit**

```bash
pnpm --filter @wellcore/mobile typecheck
git add apps/mobile/app/onboarding apps/mobile/src/onboarding/ui
git commit -m "feat(mobile): onboarding stack layout + shell, progress dots, primary button"
```

---

## Task 9: i18n keys for onboarding (EN + TR)

**Files:**
- Create: `apps/mobile/src/i18n/locales/en/onboarding.json`
- Create: `apps/mobile/src/i18n/locales/tr/onboarding.json`
- Modify: `apps/mobile/src/i18n/index.ts` — register new namespace

**Step 1: Create `apps/mobile/src/i18n/locales/en/onboarding.json`**

Cover every visible string used by every onboarding screen. Top-level keys mirror screen names: `welcome`, `goals`, `chamber`, `fireSafety`, `disclaimer`, `health.{cardId}`, `consent`, `locale`, `profile`, `preview`, `done`, `hardStop`, `crisis`, `common.{back,continue,acknowledge,skip,maxGoalsReached,yes,no,decline}`. Reuse the v2 design doc copy verbatim where it specifies it (fire safety wording, PHQ-9 Item 9 question text, hard-stop rationale, crisis resources phrasing). Each `health.{cardId}` entry has: `title`, `description`, `yesLabel`, `noLabel`, plus `hardStopRationale` (cards 1-5) or `softWarning` (cards 6-7).

```json
{
  "welcome": {
    "tagline": "Hyperbaric oxygen, with care.",
    "subtitle": "Evidence-led HBOT support — built on FDA Aug 2025 guidance.",
    "signIn": "Sign in with Apple",
    "alreadyMember": "Already a member? Apple Sign-In recovers your session."
  },
  "goals": {
    "title": "What brings you to HBOT?",
    "subtitle": "Pick up to 5. We'll match protocols + check-ins to these.",
    "max": "Maximum 5 goals selected.",
    "items": {
      "recovery": "Recovery & soft tissue",
      "wellness": "General wellness & anxiety relief",
      "brain_fog": "Brain fog",
      "long_covid": "Long-COVID symptoms",
      "neuro_recovery": "Neuro-recovery (incl. mild TBI)",
      "athletic_performance": "Athletic performance",
      "radiance": "Skin radiance",
      "anti_aging": "Healthy aging",
      "vitality": "Day-to-day vitality"
    },
    "medicalDisclaimer": "Some goals describe medical conditions. We are not a medical service — coordinate with your clinician."
  },
  "chamber": {
    "title": "Which chamber will you use?",
    "subtitle": "This drives protocol matching and safety guidance.",
    "soft_1_3": "Soft 1.3 ATA",
    "hard_1_5": "Hard 1.5 ATA",
    "hard_2_0": "Hard 2.0 ATA or higher"
  },
  "fireSafety": {
    "title": "Fire safety",
    "subtitle": "Per FDA Aug 2025 guidance — please read fully.",
    "ack": "I have read and understood the fire safety guidance.",
    "continue": "Continue",
    "scrollHint": "Scroll to the end to acknowledge."
  },
  "disclaimer": {
    "title": "Wellcore is not a medical service",
    "body": "Wellcore is a wellness companion. We do not diagnose, treat, cure, or prevent any disease. Always coordinate with your clinician.",
    "ack": "I understand."
  },
  "health": {
    "pregnancy":          { "title": "Are you pregnant?", "description": "Pregnancy is a contraindication to HBOT.", "yesLabel": "Yes", "noLabel": "No", "hardStopRationale": "HBOT is contraindicated during pregnancy." },
    "pneumothorax":       { "title": "Untreated pneumothorax?", "description": "Untreated pneumothorax is an absolute contraindication.", "yesLabel": "Yes", "noLabel": "No", "hardStopRationale": "Untreated pneumothorax is an absolute contraindication to HBOT." },
    "ear_surgery":        { "title": "Recent ear surgery / unable to equalize?", "description": "Inability to equalize middle ear pressure is a hard contraindication.", "yesLabel": "Yes", "noLabel": "No", "hardStopRationale": "Equalization issues require clearance before HBOT." },
    "active_malignancy":  { "title": "Active malignancy or current chemotherapy?", "description": "Active cancer or concurrent chemotherapy requires oncology clearance.", "yesLabel": "Yes", "noLabel": "No", "hardStopRationale": "Oncology clearance required before HBOT." },
    "severe_copd":        { "title": "Severe COPD with CO2 retention?", "description": "CO2 retention is a hard contraindication.", "yesLabel": "Yes", "noLabel": "No", "hardStopRationale": "Severe COPD with CO2 retention contraindicates HBOT." },
    "claustrophobia":     { "title": "Significant claustrophobia?", "description": "We can adjust the experience for comfort.", "yesLabel": "Yes", "noLabel": "No", "softWarning": "We'll adjust pacing and offer breathing aids." },
    "recent_surgery":     { "title": "Recent surgery or wound healing?", "description": "Coordinate with your clinician — HBOT can support wound healing under supervision.", "yesLabel": "Yes", "noLabel": "No", "softWarning": "Coordinate with your clinician before continuing." },
    "phq9_item9":         { "title": "Over the last 2 weeks, how often have you had thoughts that you would be better off dead, or of hurting yourself in some way?",
                            "options": { "0": "Not at all", "1": "Several days", "2": "More than half the days", "3": "Nearly every day" } }
  },
  "consent": {
    "title": "Consent",
    "subtitle": "Per US privacy laws (CCPA, MHMDA, MODPA).",
    "terms":     "I accept the Terms of Service",
    "privacy":   "I accept the Privacy Policy",
    "ccpa_sale": "Do NOT sell or share my personal information (CCPA opt-out)",
    "mhmda":     "I consent to processing of my consumer health data (MHMDA / Washington)",
    "modpa":     "I consent to processing of my consumer health data (MODPA / Maryland)"
  },
  "locale": { "title": "Language", "subtitle": "You can change this any time in Settings." },
  "profile": { "title": "About you", "subtitle": "Optional. Helps us personalize check-ins.", "name": "Display name", "dob": "Date of birth (optional)" },
  "preview": { "title": "Pre-session check-ins", "subtitle": "Before each session, we'll ask 4 short questions (PROMIS-aligned). 30 seconds." },
  "done": { "title": "You're set.", "subtitle": "Tap below to enter Wellcore.", "cta": "Enter Wellcore" },
  "hardStop": { "title": "HBOT may not be right for you", "subtitle": "Based on your answers, we recommend pausing and coordinating with your clinician.", "exit": "Exit Wellcore" },
  "crisis": { "title": "We're here for you" },
  "common": {
    "back": "Back",
    "continue": "Continue",
    "acknowledge": "Acknowledge",
    "skip": "Skip",
    "yes": "Yes",
    "no": "No",
    "decline": "Decline"
  }
}
```

**Step 2: Create `apps/mobile/src/i18n/locales/tr/onboarding.json`** — same shape, Turkish translations. (Translator: Sencer's call; in plan we ship the keys with placeholder TR strings — `[TR] <english>` — and a TODO note to translate before public release.)

**Step 3: Modify `apps/mobile/src/i18n/index.ts`** — add the `onboarding` namespace import and register under both languages. Also extend `home` namespace if not present (`home.welcome`, `home.fazStub`, `home.signOut`).

**Step 4: Typecheck + commit**

```bash
pnpm --filter @wellcore/mobile typecheck
git add apps/mobile/src/i18n
git commit -m "feat(mobile): i18n onboarding namespace (EN ready, TR placeholders)"
```

---

## Task 10: Welcome + Apple sign-in screen

**Files:**
- Create: `apps/mobile/app/onboarding/welcome.tsx`

**Step 1: Implement** — `apps/mobile/app/onboarding/welcome.tsx`:

```tsx
import { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Colors, Spacing, TextStyles } from "../../src/theme/index";
import { HeroGradient } from "../../src/components/onboarding/HeroGradient";
import { WellcoreMark } from "../../src/components/WellcoreMark";
import { Wordmark } from "../../src/components/brand/Wordmark";
import { PrimaryButton } from "../../src/onboarding/ui/PrimaryButton";
import { signInWithApple } from "../../src/auth/appleSignIn";
import { useAuth } from "../../src/auth/useAuth";

export default function Welcome() {
  const { t } = useTranslation();
  const router = useRouter();
  const { refetch } = useAuth();
  const [busy, setBusy] = useState(false);

  const onSignIn = async () => {
    if (busy) return;
    setBusy(true);
    const r = await signInWithApple();
    setBusy(false);
    if (!r.ok && r.reason === "error") Alert.alert(t("welcome.signIn"), r.message ?? "Sign-in failed.");
    if (r.ok) {
      const me = await refetch();
      if (me.data) router.replace("/onboarding/goals");
    }
  };

  return (
    <View style={styles.root}>
      <HeroGradient style={StyleSheet.absoluteFill} />
      <View style={styles.center}>
        <WellcoreMark size={48} />
        <Wordmark size={28} />
        <Text style={styles.tagline}>{t("onboarding:welcome.tagline")}</Text>
        <Text style={styles.subtitle}>{t("onboarding:welcome.subtitle")}</Text>
      </View>
      <View style={styles.footer}>
        <PrimaryButton label={t("onboarding:welcome.signIn")} onPress={onSignIn} disabled={busy} />
        <Text style={styles.note}>{t("onboarding:welcome.alreadyMember")}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: Spacing.lg, gap: Spacing.sm },
  tagline: { ...TextStyles.h1, color: Colors.ink, textAlign: "center", marginTop: Spacing.lg },
  subtitle: { ...TextStyles.body, color: Colors.ink2, textAlign: "center", maxWidth: 320 },
  footer: { padding: Spacing.lg, gap: Spacing.sm },
  note: { ...TextStyles.caption, color: Colors.ink3, textAlign: "center" },
});
```

**Step 2: Typecheck + commit**

```bash
pnpm --filter @wellcore/mobile typecheck
git add apps/mobile/app/onboarding/welcome.tsx
git commit -m "feat(mobile): onboarding welcome screen with apple sign-in"
```

---

## Task 11: Goals + Chamber screens

**Files:**
- Create: `apps/mobile/app/onboarding/goals.tsx`
- Create: `apps/mobile/app/onboarding/chamber.tsx`

**Step 1: Implement goals.tsx** — multi-select chips of the 9 `GoalId`s, max 5, each row uses existing `EvidenceDot` component (mapping per `packages/shared` evidence-dot data). Wire to `useOnboardingStore`. Disable Continue when 0 selected. If any goal flagged as `isMedicalCondition` (from shared data) is in selection, show a small disclaimer banner above Continue with the `goals.medicalDisclaimer` i18n string.

```tsx
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { OnboardingShell } from "../../src/onboarding/ui/OnboardingShell";
import { PrimaryButton } from "../../src/onboarding/ui/PrimaryButton";
import { EvidenceDot } from "../../src/components/data/EvidenceDot";
import { useOnboardingStore } from "../../src/onboarding/store";
import type { GoalId } from "../../src/onboarding/types";
import { Colors, Spacing, TextStyles } from "../../src/theme/index";

const GOALS: { id: GoalId; isMedical?: boolean }[] = [
  { id: "recovery" }, { id: "wellness" }, { id: "brain_fog", isMedical: true },
  { id: "long_covid", isMedical: true }, { id: "neuro_recovery", isMedical: true },
  { id: "athletic_performance" }, { id: "radiance" }, { id: "anti_aging" }, { id: "vitality" },
];

export default function Goals() {
  const { t } = useTranslation();
  const router = useRouter();
  const goals = useOnboardingStore((s) => s.goals);
  const setGoals = useOnboardingStore((s) => s.setGoals);
  const setStep = useOnboardingStore((s) => s.setStep);
  const toggle = (g: GoalId) => {
    if (goals.includes(g)) setGoals(goals.filter((x) => x !== g));
    else if (goals.length < 5) setGoals([...goals, g]);
  };
  const showMedical = goals.some((g) => GOALS.find((x) => x.id === g)?.isMedical);
  return (
    <OnboardingShell
      step={1} totalSteps={12}
      title={t("onboarding:goals.title")}
      subtitle={t("onboarding:goals.subtitle")}
      footer={
        <PrimaryButton
          label={t("onboarding:common.continue")}
          disabled={goals.length === 0}
          onPress={() => { setStep("chamber"); router.push("/onboarding/chamber"); }}
        />
      }
    >
      <View style={{ gap: Spacing.sm }}>
        {GOALS.map(({ id }) => {
          const selected = goals.includes(id);
          return (
            <Pressable key={id} onPress={() => toggle(id)} style={[styles.row, selected && styles.rowSel]}>
              <EvidenceDot goalId={id} />
              <Text style={[styles.label, selected && styles.labelSel]}>{t(`onboarding:goals.items.${id}`)}</Text>
            </Pressable>
          );
        })}
      </View>
      {showMedical && <Text style={styles.note}>{t("onboarding:goals.medicalDisclaimer")}</Text>}
      {goals.length === 5 && <Text style={styles.note}>{t("onboarding:goals.max")}</Text>}
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: Spacing.md, borderRadius: 16, borderWidth: 1, borderColor: Colors.hairline },
  rowSel: { borderColor: Colors.ink, backgroundColor: Colors.bgRaised },
  label: { ...TextStyles.body, color: Colors.ink2 },
  labelSel: { color: Colors.ink },
  note: { ...TextStyles.caption, color: Colors.ink3, marginTop: Spacing.md },
});
```

**Step 2: Implement chamber.tsx** — wraps existing `ChamberTypeSelector` from `apps/mobile/src/components/onboarding/`. On select, sets `chamberType` in store. Continue → `/onboarding/fire-safety`.

**Step 3: Typecheck + commit**

```bash
pnpm --filter @wellcore/mobile typecheck
git add apps/mobile/app/onboarding/goals.tsx apps/mobile/app/onboarding/chamber.tsx
git commit -m "feat(mobile): onboarding goals + chamber screens"
```

---

## Task 12: Fire safety + general disclaimer screens

**Files:**
- Create: `apps/mobile/app/onboarding/fire-safety.tsx`
- Create: `apps/mobile/app/onboarding/disclaimer.tsx`

**Step 1: Implement fire-safety.tsx** — wraps existing `FireSafetySlide` from `apps/mobile/src/components/onboarding/`. The Acknowledge button is disabled until `(scrolledToBottom === true && checkboxAcked === true)`. Continue calls `ackFireSafety()` and routes to `/onboarding/disclaimer`. Track `scrolledToBottom` via `onScroll` checking `contentOffset.y + layoutMeasurement.height >= contentSize.height - 4`.

**Step 2: Implement disclaimer.tsx** — short body + a single ack checkbox. On ack → `ackDisclaimers()` → route to `/onboarding/health-1`.

**Step 3: Typecheck + commit**

```bash
pnpm --filter @wellcore/mobile typecheck
git add apps/mobile/app/onboarding/fire-safety.tsx apps/mobile/app/onboarding/disclaimer.tsx
git commit -m "feat(mobile): onboarding fire-safety (non-skippable) + disclaimer"
```

---

## Task 13: Health screening cards 1-7 (yes/no) with hard-stop + soft-warning routing

**Files:**
- Create: `apps/mobile/app/onboarding/health-[card].tsx` (Expo Router dynamic segment) — single component handles cards 1-7
- Create: `apps/mobile/app/onboarding/hard-stop.tsx`
- Create: `apps/mobile/src/onboarding/ui/HealthCard.tsx`

**Step 1: Implement HealthCard.tsx** — generic component:

```tsx
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { Colors, Spacing, TextStyles } from "../../theme/index";
import type { HealthCardId } from "../types";

export function HealthCard({
  cardId,
  onAnswer,
}: {
  cardId: HealthCardId;
  onAnswer: (answer: boolean) => void;
}) {
  const { t } = useTranslation();
  return (
    <View style={{ gap: Spacing.lg }}>
      <Text style={[TextStyles.h2, { color: Colors.ink }]}>{t(`onboarding:health.${cardId}.title`)}</Text>
      <Text style={[TextStyles.body, { color: Colors.ink2 }]}>{t(`onboarding:health.${cardId}.description`)}</Text>
      <View style={{ gap: Spacing.sm, marginTop: Spacing.md }}>
        <Pressable style={styles.btn} onPress={() => onAnswer(true)}><Text style={styles.label}>{t(`onboarding:health.${cardId}.yesLabel`)}</Text></Pressable>
        <Pressable style={styles.btn} onPress={() => onAnswer(false)}><Text style={styles.label}>{t(`onboarding:health.${cardId}.noLabel`)}</Text></Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  btn: { borderWidth: 1, borderColor: Colors.hairlineStrong, borderRadius: 999, paddingVertical: Spacing.md, alignItems: "center" },
  label: { ...TextStyles.button, color: Colors.ink },
});
```

**Step 2: Implement health-[card].tsx** — dynamic route receives `card` (1-7), maps to `HealthCardId`:

```tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import { OnboardingShell } from "../../src/onboarding/ui";
import { HealthCard } from "../../src/onboarding/ui/HealthCard";
import { useOnboardingStore } from "../../src/onboarding/store";
import type { HealthCardId } from "../../src/onboarding/types";

const ORDER: HealthCardId[] = ["pregnancy","pneumothorax","ear_surgery","active_malignancy","severe_copd","claustrophobia","recent_surgery"];

export default function HealthScreen() {
  const { card } = useLocalSearchParams<{ card: string }>();
  const idx = Math.max(0, parseInt(card ?? "1", 10) - 1);
  const cardId = ORDER[idx];
  const router = useRouter();
  const addAnswer = useOnboardingStore((s) => s.addHealthAnswer);
  const setStep = useOnboardingStore((s) => s.setStep);
  const onAnswer = (answer: boolean) => {
    addAnswer(cardId, answer);
    const hardStopHit = answer && idx < 5;
    if (hardStopHit) { router.replace("/onboarding/hard-stop"); return; }
    if (idx + 1 < ORDER.length) {
      setStep(`health-${idx + 2}` as any);
      router.push(`/onboarding/health-${idx + 2}`);
    } else {
      setStep("health-8");
      router.push("/onboarding/health-8");
    }
  };
  return (
    <OnboardingShell step={5 + idx} totalSteps={12} title="" footer={null}>
      <HealthCard cardId={cardId} onAnswer={onAnswer} />
    </OnboardingShell>
  );
}
```

**Step 3: Implement hard-stop.tsx** — terminal screen using `Colors.crisisBg`/`crisisText` palette from Faz 1:

```tsx
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import * as Linking from "expo-linking";
import { Colors, Spacing, TextStyles } from "../../src/theme/index";
import { useOnboardingStore } from "../../src/onboarding/store";
import { OnboardingShell } from "../../src/onboarding/ui";
import { PrimaryButton } from "../../src/onboarding/ui/PrimaryButton";

export default function HardStop() {
  const { t } = useTranslation();
  const reason = useOnboardingStore((s) => s.hardStopReason);
  return (
    <OnboardingShell
      step={12} totalSteps={12}
      title={t("onboarding:hardStop.title")}
      subtitle={t("onboarding:hardStop.subtitle")}
      showBack={false}
      footer={<PrimaryButton label={t("onboarding:hardStop.exit")} onPress={() => Linking.openURL("https://wellcore.app/declined")} />}
    >
      {reason ? <Text style={styles.rationale}>{t(`onboarding:health.${reason}.hardStopRationale`)}</Text> : null}
    </OnboardingShell>
  );
}
const styles = StyleSheet.create({
  rationale: { ...TextStyles.body, color: Colors.crisisText, backgroundColor: Colors.crisisBg, padding: Spacing.lg, borderRadius: 16, borderWidth: 1, borderColor: Colors.crisisBorder },
});
```

**Step 4: Typecheck + commit**

```bash
pnpm --filter @wellcore/mobile typecheck
git add apps/mobile/app/onboarding apps/mobile/src/onboarding/ui/HealthCard.tsx
git commit -m "feat(mobile): health screening cards 1-7 + hard-stop terminal route"
```

---

## Task 14: PHQ-9 Item 9 (card 8) + crisis routing + suicidality logging

**Files:**
- Create: `apps/mobile/app/onboarding/health-8.tsx`
- Create: `apps/mobile/app/onboarding/crisis.tsx`

**Step 1: Implement health-8.tsx** — 4-option scale (0-3) using i18n `health.phq9_item9.options.0..3`. On select:

```tsx
import { useState } from "react";
import { Pressable, View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { OnboardingShell } from "../../src/onboarding/ui";
import { PrimaryButton } from "../../src/onboarding/ui/PrimaryButton";
import { useOnboardingStore } from "../../src/onboarding/store";
import { api } from "../../src/api/client";
import { Colors, Spacing, TextStyles } from "../../src/theme/index";

export default function PHQ9() {
  const { t } = useTranslation();
  const router = useRouter();
  const [score, setScore] = useState<number | null>(null);
  const setSuicidalityScore = useOnboardingStore((s) => s.setSuicidalityScore);
  const setStep = useOnboardingStore((s) => s.setStep);

  const onContinue = async () => {
    if (score == null) return;
    setSuicidalityScore(score);
    if (score >= 1) {
      // log to backend before showing crisis screen
      await api.me.suicidality.$post({ json: { score, instrument: "phq9_item9", crisisShown: true } });
      router.replace("/onboarding/crisis");
    } else {
      setStep("consent");
      router.push("/onboarding/consent");
    }
  };

  return (
    <OnboardingShell
      step={12} totalSteps={12}
      title={t("onboarding:health.phq9_item9.title")}
      footer={<PrimaryButton label={t("onboarding:common.continue")} disabled={score == null} onPress={onContinue} />}
    >
      <View style={{ gap: Spacing.sm }}>
        {[0, 1, 2, 3].map((n) => (
          <Pressable key={n} onPress={() => setScore(n)} style={[styles.row, score === n && styles.rowSel]}>
            <Text style={[styles.label, score === n && styles.labelSel]}>{t(`onboarding:health.phq9_item9.options.${n}`)}</Text>
          </Pressable>
        ))}
      </View>
    </OnboardingShell>
  );
}
const styles = StyleSheet.create({
  row: { padding: Spacing.md, borderRadius: 16, borderWidth: 1, borderColor: Colors.hairline },
  rowSel: { borderColor: Colors.ink, backgroundColor: Colors.bgRaised },
  label: { ...TextStyles.body, color: Colors.ink2 },
  labelSel: { color: Colors.ink },
});
```

**Step 2: Implement crisis.tsx** — wraps existing `CrisisResourcesScreen` component (Faz 1) and after the user dismisses, route to `/onboarding/consent` (still allow them to continue — the screen is mandatory display, not a hard stop).

**Step 3: Typecheck + commit**

```bash
pnpm --filter @wellcore/mobile typecheck
git add apps/mobile/app/onboarding/health-8.tsx apps/mobile/app/onboarding/crisis.tsx
git commit -m "feat(mobile): PHQ-9 Item 9 screen with crisis routing + backend logging"
```

---

## Task 15: Consent + locale + profile + preview screens

**Files:**
- Create: `apps/mobile/app/onboarding/consent.tsx`
- Create: `apps/mobile/app/onboarding/locale.tsx`
- Create: `apps/mobile/app/onboarding/profile.tsx`
- Create: `apps/mobile/app/onboarding/preview.tsx`

**Step 1: Implement consent.tsx** — 5 checkboxes (terms, privacy, ccpa_sale opt-out, mhmda, modpa). Each calls `addConsent({ type, version: "v1.0.0", acceptedAt: new Date().toISOString() })`. Continue is disabled until all five are toggled (note: ccpa_sale is opt-out — the toggle still needs to be deliberate). Each checkbox row links to a remote URL (Terms, Privacy) opened via `expo-web-browser` for full text.

**Step 2: Implement locale.tsx** — segmented control: en-US (default) / tr-TR. Tap → `setLocale()` + `i18next.changeLanguage()`. Continue → `/onboarding/profile`.

**Step 3: Implement profile.tsx** — two `TextInput`s (displayName + dob — dob optional, ISO date format). Both write to store on submit. Continue → `/onboarding/preview`.

**Step 4: Implement preview.tsx** — static preview of the 4 PROMIS check-in sliders (energy, pain, sleep, focus) — non-interactive, just shown as illustration with copy. Continue → `/onboarding/done`.

**Step 5: Typecheck + commit**

```bash
pnpm --filter @wellcore/mobile typecheck
git add apps/mobile/app/onboarding/consent.tsx apps/mobile/app/onboarding/locale.tsx apps/mobile/app/onboarding/profile.tsx apps/mobile/app/onboarding/preview.tsx
git commit -m "feat(mobile): consent, locale, profile, preview onboarding screens"
```

---

## Task 16: Done screen — batch commit + route to /home

**Files:**
- Create: `apps/mobile/app/onboarding/done.tsx`
- Create: `apps/mobile/src/onboarding/commit.ts`

**Step 1: Implement commit.ts** — pure function that takes the store snapshot and runs the batch:

```typescript
import { api } from "../api/client";
import { useOnboardingStore } from "./store";

export async function commitOnboarding() {
  const s = useOnboardingStore.getState();

  // 1. Profile
  await api.profile.$put({
    json: {
      displayName: s.displayName || undefined,
      dob: s.dob ?? undefined,
      goals: s.goals,
      chamberType: s.chamberType ?? undefined,
      locale: s.locale,
    } as any,
  });

  // 2. Disclaimers (fire safety + general)
  await api.profile.disclaimers.$post({ json: {} } as any);

  // 3. Consent — one POST per acceptance
  for (const c of s.consentAcceptances) {
    await api.profile.consent.$post({
      json: { type: c.type, version: c.version },
    } as any);
  }

  // 4. Suicidality already logged from PHQ-9 screen — nothing to do here
}
```

**Step 2: Implement done.tsx** — calls `commitOnboarding()` on mount in a `useMutation`, shows a small success state, and primary button replaces stack with `/home`. On any error, surface via Alert and a Retry button. After success, call `useOnboardingStore.getState().reset()` to clear secure-store.

```tsx
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { OnboardingShell } from "../../src/onboarding/ui";
import { PrimaryButton } from "../../src/onboarding/ui/PrimaryButton";
import { commitOnboarding } from "../../src/onboarding/commit";
import { useOnboardingStore } from "../../src/onboarding/store";

export default function Done() {
  const { t } = useTranslation();
  const router = useRouter();
  const [state, setState] = useState<"committing" | "ok" | "error">("committing");

  const run = async () => {
    setState("committing");
    try {
      await commitOnboarding();
      setState("ok");
    } catch (e) {
      setState("error");
      Alert.alert("Sync failed", e instanceof Error ? e.message : String(e));
    }
  };
  useEffect(() => { void run(); }, []);

  return (
    <OnboardingShell
      step={12} totalSteps={12}
      title={t("onboarding:done.title")}
      subtitle={t("onboarding:done.subtitle")}
      showBack={false}
      footer={
        <PrimaryButton
          label={state === "error" ? "Retry" : t("onboarding:done.cta")}
          disabled={state === "committing"}
          onPress={() => {
            if (state === "ok") {
              useOnboardingStore.getState().reset();
              router.replace("/home");
            } else {
              void run();
            }
          }}
        />
      }
    >
      {null}
    </OnboardingShell>
  );
}
```

**Step 3: Typecheck + commit**

```bash
pnpm --filter @wellcore/mobile typecheck
git add apps/mobile/app/onboarding/done.tsx apps/mobile/src/onboarding/commit.ts
git commit -m "feat(mobile): onboarding done — batch commit profile/disclaimers/consent + route home"
```

---

## Task 17: Design-system route adds Onboarding preview section

**Files:**
- Modify: `apps/mobile/app/design-system.tsx` — append preview cards for each onboarding screen for visual review

**Step 1: Modify** — append a new `<Section title="Onboarding">` to the design system showcase that renders one mounted-but-isolated example of each onboarding screen (use a wrapping `View` with `pointerEvents="none"` so they don't progress the real store; or use the underlying primitive components — `HealthCard`, `OnboardingShell`, `ProgressDots`, `PrimaryButton` — directly). Include all 8 health card titles, the PHQ-9 4-option list, the consent checkbox group, and a fire-safety preview thumbnail.

**Step 2: Typecheck + visual smoke** on simulator.

**Step 3: Commit**

```bash
pnpm --filter @wellcore/mobile typecheck
git add apps/mobile/app/design-system.tsx
git commit -m "feat(mobile): design-system route — onboarding preview section"
```

---

## Task 18: Final smoke + README + push

**Files:**
- Modify: `README.md` — append "Mobile onboarding" section documenting the flow, env vars, dev steps
- Verify end-to-end on iOS simulator against real backend

**Step 1: README updates** — append to root `README.md`:

````markdown
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

Welcome → Apple sign-in → Goals (max 5) → Chamber type → Fire safety (non-skippable, FDA Aug 2025) → Disclaimer → Health screening cards 1-5 (hard contraindications) → cards 6-7 (soft warnings) → PHQ-9 Item 9 (≥ 1 → mandatory crisis resources screen + suicidality log) → Consent (5 acceptances) → Locale → Profile → Preview → Done (batch commits) → /home.

### Crisis & contraindications

- Cards 1-5 YES → `/onboarding/hard-stop` (terminal — exits to declined page).
- Cards 6-7 YES → soft warning banner, allows continue.
- PHQ-9 Item 9 ≥ 1 → mandatory `CrisisResourcesScreen` + `POST /me/suicidality` server log.

### Persistence

Onboarding store key: `wellcore.onboarding.v1` in `expo-secure-store`. Cookie jar key: `wellcore.cookies.v1`. Force-quit + relaunch resumes on the same screen with state intact.
````

**Step 2: Final integration smoke** — manual checklist on iOS simulator with real backend:

```
1. pnpm --filter @wellcore/api dev   (terminal A)
2. pnpm --filter @wellcore/mobile ios   (terminal B)
3. App launches → /onboarding/welcome
4. Tap Sign in with Apple → in-app browser opens → Apple test account → returns
5. /auth/me succeeds → /onboarding/goals
6. Pick 3 goals (incl. one medical) → disclaimer banner shown → Continue
7. Pick chamber: hard 2.0 → Continue
8. Fire safety: scroll to bottom → check ack → Continue
9. Disclaimer: ack → Continue
10. Health card 1 (pregnancy) NO → ... card 5 (severe COPD) NO
11. Card 6 (claustrophobia) YES → soft warning → Continue
12. Card 7 (recent surgery) NO → Continue
13. Card 8 (PHQ-9 Item 9) → score 1 → posts /me/suicidality → CrisisResourcesScreen → Continue
14. Consent: tap all 5 → Continue
15. Locale: en-US → Continue
16. Profile: name "Sencer", skip dob → Continue
17. Preview → Continue
18. Done → batch commits succeed (verify with curl /me/sessions returning 200, /profile returning the saved displayName) → Enter Wellcore → /home
19. Force-quit during step 11. Relaunch → resumes on /onboarding/health-6 with selections preserved.
20. Hard-stop branch: in another test user, answer YES to card 1 → /onboarding/hard-stop reached.
```

Run a separate verification of backend persistence:

```bash
curl -s -b /tmp/cookies.txt http://localhost:3000/profile | jq
curl -s http://localhost:3000/me/sessions    # 401 (no jar in shell), expected
```

Use `psql wellcore` to confirm `consent_events` has 5 rows and `suicidality_screens` has 1 row for the test user.

**Step 3: Push (do NOT open PR — user does it)**

```bash
git push -u origin faz-3
```

Print the branch URL so the user can click "Create PR" themselves.

---

## Done — handoff to Faz 4

After this branch merges, proceed to **Faz 4 — Home dashboard + protocol selection**. The user is now authenticated, has a profile with goals + chamberType + locale, has accepted consents, and lands on `/home`. Faz 4 builds the actual home dashboard (TripleRing summary, today's check-in card, protocol selector filtered by chamberType, achievement strip).

**Dependency graph:**

```
Task 1 (deps)
   ↓
Task 2 (cookie jar) ──────────────────┐
   ↓                                  │
Task 3 (query + useAuth)              │
   ↓                                  │
Task 4 (zustand store) ───────────────┤
   ↓                                  │
Task 5 (backend addendum: suicidality)│
   ↓                                  │
Task 6 (apple OAuth) ←────────────────┘
   ↓
Task 7 (root routing + home stub)
   ↓
Task 8 (onboarding stack + UI shell)
   ↓
Task 9 (i18n)
   ↓
Task 10 (welcome) → Task 11 (goals + chamber) → Task 12 (fire safety + disclaimer)
                                                        ↓
                                                Task 13 (health 1-7 + hard-stop)
                                                        ↓
                                                Task 14 (PHQ-9 + crisis)
                                                        ↓
                                                Task 15 (consent + locale + profile + preview)
                                                        ↓
                                                Task 16 (done + batch commit)
                                                        ↓
                                                Task 17 (design-system preview)
                                                        ↓
                                                Task 18 (smoke + README + push)
```
