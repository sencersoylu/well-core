# Faz 4 Handoff — Pick Up From Task 5

**Branch:** `faz-4` (4 commits ahead of main, pushed)
**Last commit:** `f998caa` — session state machine reducer

## Status: 4/20 tasks complete

| # | Task | Status | Commit |
|---|------|--------|--------|
| 1 | Deps + `(app)` auth gate + i18n placeholders | ✅ | `21ab937` |
| 2 | Protocols query hooks (`useProtocols`, `useProtocol`, `useUserProtocols`, `useStartProtocol`) | ✅ | `9a1613a` |
| 3 | Sessions/checkins/achievements/citations/DSAR hooks | ✅ | `23b91f6` |
| 4 | Session state machine reducer + 10 unit tests | ✅ | `f998caa` |
| 5 | `useSessionStore` (Zustand+secure-store) + `useSession()` hook | ⏳ next |
| 6 | Web fallbacks (`keep-awake.web.ts`, `haptics.web.ts`) | ⏳ |
| 7 | `useHomeStats` aggregator + tests | ⏳ |
| 8 | `/(app)/home` TripleRing dashboard | ⏳ |
| 9 | Protocols list + detail | ⏳ |
| 10 | Pre-checkin (PROMIS sliders) | ⏳ |
| 11 | Active session screen (PhaseLabel/Timer/Reminders/AbortSheet) | ⏳ |
| 12 | Post-checkin | ⏳ |
| 13 | History list + detail | ⏳ |
| 14 | Achievements | ⏳ |
| 15 | Settings (profile, locale, DSAR sheet, sign-out) | ⏳ |
| 16 | Citations browser | ⏳ |
| 17 | Avatar upload (deferrable) | ⏳ |
| 18 | Splash redirect + design-system preview | ⏳ |
| 19 | i18n string sweep + en/tr coverage test | ⏳ |
| 20 | README + simulator smoke + push branch | ⏳ |

## Plan reference
`docs/plans/2026-05-07-wellcore-faz-4-core-screens.md` (1112 lines, 20 tasks)

## Key decisions baked in (don't re-debate)

- **State machine canonical** — `apps/mobile/src/session/state-machine.ts`. 10/10 tests pass. Don't modify reducer logic; only consume via selectors (`elapsedInPhaseSec`, `totalElapsedSec`, `shouldAutoAdvance`).
- **Hono RPC `json` body type fix-ups** — routes without `zValidator` middleware return `as any` in mutation hook bodies. Backend zValidator migration is out of scope for Faz 4; tracked as tech debt.
- **i18n is single-file** — `apps/mobile/src/i18n/locales/{en,tr}.json` with top-level keys. `app: {}` and `session: {}` placeholders added in Task 1; populate as screens land.
- **`useAuth()` shape** — returns `{ user, status, refetch, signOut }`. `status` is `"loading"|"authenticated"|"unauthenticated"`. No `isLoading`. No `onboardedAt`.
- **`(app)` group auth gate** — at `apps/mobile/app/(app)/_layout.tsx`. Redirects unauthenticated users to `/onboarding/welcome`.
- **Tests use structural-only checks** for hooks — `renderHook` + `@testing-library/react-native` fails under vitest+jsdom because of RN core Flow syntax. Use `vi.mock("../../api/client")` + structural existence checks. State-machine tests are pure-function + work fine.

## Repository pointers

- velora-app reference (read-only): `/Users/sencersoylu/Projects/velora-app/velora-app/` — mine for timer logic if needed in Task 5
- Postgres dev: port **5434** (NOT 5432, Homebrew PG14 conflict)
- Backend dev URL: `http://localhost:3000`
- Mobile dev: `pnpm dev` (Expo on port 8090)
- API tests: 40 passing
- Mobile tests: 27 passing (after Task 4)

## Gotchas inherited from Faz 3

- **Apple JWT clientSecret** — backend `auth.ts` currently passes raw private key as clientSecret. Production deploy needs real JWT generation. Not blocking Faz 4 dev.
- **Test fixture cookie** — `createTestUser()` in `apps/api/src/__tests__/helpers/auth-fixture.ts` uses HMAC-signed cookie via `auth.$context.internalAdapter.createSession`. If you write integration tests in Faz 4, copy this pattern.
- **uuid → text userId** — domain tables reference `auth_user.id` (text). No casts needed.
- **better-auth 1.6.9 + drizzle-orm 0.36.4** work despite peer warnings.

## Suggested first action in new session

1. Read this handoff
2. Read `docs/plans/2026-05-07-wellcore-faz-4-core-screens.md` Task 5 (lines 528-678)
3. Begin Task 5 implementation: `useSessionStore` + `useSession()` hook with AppState listener and debounced backend PATCH
4. Continue task-by-task per same subagent-driven pattern; merge PR when done

## Done criteria

- All 20 tasks committed to `faz-4`
- `pnpm --filter @wellcore/mobile test` ≥ 35 passing (state machine + reducer + home stats + structural hooks)
- `pnpm --filter @wellcore/mobile typecheck` clean
- README appended with Faz 4 section
- Branch pushed; user opens PR
