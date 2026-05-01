# Wellcore — Design Doc v2 (US Pivot, Research-Absorbed)

**Status:** Approved (supersedes v1)
**Date:** 2026-05-02
**Owner:** Sencer Soylu
**Supersedes:** `2026-05-01-wellcore-from-scratch-design.md` (kept for history)

---

## 1. What changed since v1

v1 was written before any literature or market research. v2 absorbs 8 research
files (~26k words, peer-reviewed sourcing) covering clinical protocols,
contraindications, mild-vs-clinical positioning, validated check-in metrics,
competitive analysis, claim citations, PTSD/TBI/anxiety, and US market
intelligence. The core brand, tech stack, and monorepo layout are unchanged.

**Material changes:**

| Area | v1 | v2 |
|---|---|---|
| Primary market | Turkey | **United States** |
| Primary locale | TR | **EN (US English)** — TR retained in codebase, hidden from UI |
| Onboarding length | 10 screens | **12 screens** (+ Chamber Type, + Fire Safety) |
| Health Screening | 5 cards | **8 cards** (5 hard contraindications + 2 soft + 1 PHQ-9 suicidality) |
| Goal taxonomy | 9 goals open | **9 goals**, PTSD explicitly excluded, TBI folded into `neuro_recovery`, anxiety folded into `wellness` |
| Citations | Hand-written copy | **Sourced citations library** with `<CitedText>` component + modal |
| Pricing | TBD | **$8.99/mo · $59/yr · $199 lifetime**, paywall deferred to v1.1 |
| HSA/FSA | not considered | **Truemed integration** as v1.1 differentiator |
| Privacy | "minimum" | **CCPA / MHMDA / MODPA opt-in consent** day-1 mandatory |
| Partnership | not considered | **Restore Hyper Wellness** (210 studios, no companion app) = #1 target |
| Regulatory | Türkiye MoH + FDA | **FDA + FTC + state privacy laws** primary; FDA Aug 2025 fire-safety letter changes safety screen |
| Wellness check-in | hand-designed | **Validated PROMIS / WHO-5 / Subjective Vitality / Hooper / DOMS-VAS items** |

## 2. Market positioning

**Primary segment:** US biohacker / longevity-curious / long-COVID-recovery /
affluent-aging users with home soft chambers (1.3 ATA), AOV around $5–15k for
the chamber. Discovery channels: Joe Rogan, Huberman, Tim Ferriss, Peter Attia,
Smarter Not Harder (Dr. Scott Sherr), Dr. Jason Sonners, Reddit r/HBOT and
r/longhaul.

**Secondary segment:** Restore Hyper Wellness members (clinic cash-pay
audience, mostly walking sessions, no chamber ownership). Wellcore should
position as their official companion app — Restore has no app today and
$177M raised to scale 210+ studios.

**Tertiary segment:** US clinical HBOT patients (1.5–2.0 ATA hard chambers)
seeking adherence support during a multi-week protocol. Lower volume but
highest-engagement, highest-LTV.

**Out of audience for v1:** Pediatric patients, professional athletic teams
(B2B), international markets except passive App Store availability.

**Tagline:** *"Pressure into clarity. One breath at a time."*

## 3. Brand (unchanged from v1)

| | Value |
|---|---|
| Name | Wellcore |
| Domain | wellcore.app |
| Bundle ID | `com.sencersoylu.wellcore` |
| Logo | **Atrium** — two concentric ink rings (outer = chamber, inner = self) |
| Wordmark | Newsreader Italic, lowercase, `-0.02em` |
| Theme | Light only, warm paper aesthetic |
| Surface | `#f6f4ef` bg · `#ffffff` elev · `#efece5` soft |
| Ink | `#1a1a1a` / `#3d3a36` / `#6b6760` / `#9a958c` |
| 3-ring accents | Adherence amber `#e8a06a` · Recovery sage `#5b8c7b` · Vitality terracotta `#c66a5b` |
| Hero gradient | Peach `#f4d6c0` → Blush `#e9c8d5` → Sky `#c8d8e4` |
| Display font | Newsreader (italic-leaning) |
| Body font | Inter |

## 4. Tech stack (largely unchanged)

### Mobile (`apps/mobile`)
- React Native + **Expo SDK 55** (New Architecture, Reanimated 4)
- Expo Router (file-based)
- TanStack Query + Zustand + AsyncStorage persist
- expo-secure-store · expo-file-system (new File API) · expo-web-browser ·
  expo-haptics · expo-notifications · react-native-svg · expo-linear-gradient
- **i18n:** `i18next` + `react-i18next`. **Locales: `en` (primary, US English),
  `tr` (kept in codebase, hidden from production UI behind dev toggle).**
  Spanish flagged for v1.5+.

### Backend (`apps/api`)
- **Hono** + `hc` typed RPC client (Metro resolver patch on mobile)
- **Drizzle ORM** (strict mode, `drizzle-kit generate` only)
- PostgreSQL 16
- **better-auth** with `@better-auth/expo` plugin — email/password + Apple Sign In via web OAuth flow
- **MinIO** S3-compatible — presigned PUT URLs for uploads
- Zod for validation (schemas in `packages/shared`)

### Infrastructure
- **Dokploy** on VPS — Traefik HTTPS, GitHub auto-deploy + manual fallback
- Postgres + MinIO containers managed in Dokploy

### Monorepo
- pnpm workspaces + Turborepo
- `apps/mobile` · `apps/api` · `packages/shared` (zod, types, citations.json, AppType export)

## 5. Goal taxonomy (final, with evidence strength)

| Goal | Category | Evidence | Notes |
|---|---|---|---|
| `radiance` | beauty_wellness | ● ○ ○ Weak | Hachmo 2021 sub-study n=13 at 60 sessions. Copy must say "after extended protocols". |
| `recovery` | recovery_healing | ● ● ● Strong | Skin/fibromyalgia at 2.0 ATA; flagship case |
| `vitality` | energy_performance | ● ○ ○ Weak | No validated daily measure; composite proxy with caveat |
| `wellness` | beauty_wellness | ● ● ○ Moderate | Telomere/biomarker; **anxiety folded here** |
| `brain_fog` | recovery_healing | ● ● ○ Moderate | Long COVID literature subset |
| `long_covid` | recovery_healing | ● ● ● Strong | Zilberman-Itskovich 2022 sham-controlled RCT |
| `neuro_recovery` | recovery_healing | ● ● ○ Moderate | Hadanny/Efrati PPCS Level-1 EBM at 1.5 ATA + Lindell 2025 RCT. **TBI sub-mention here, not standalone.** VA/DoD position is skeptical — copy must be careful. |
| `athletic_performance` | energy_performance | ● ● ○ Mixed | 2025 meta-analysis mixed; small RCTs positive on DOMS |
| `anti_aging` | beauty_wellness | ● ○ ○ Weak | Single research group; surrogate biomarkers |

**Excluded:** PTSD as standalone goal (DSM-5 territory; positive trials
require 60-session 2.0 ATA clinical-grade protocols incompatible with home
1.3 ATA audience; post-WHOOP-FDA-letter wellness disclaimers offer no shield).

**UI implication:** Each goal card displays an **evidence dot indicator**
(●●● / ●●○ / ●○○) to set honest expectations. Tapping reveals citation
modal with sourced studies. This is non-negotiable for FDA/FTC defensibility.

## 6. Data model (Drizzle target)

| Table | Purpose | New in v2 |
|---|---|---|
| `user` (better-auth) | Auth identity | |
| `session_auth` (better-auth) | Auth sessions, refresh tokens | |
| `account` (better-auth) | OAuth provider links (Apple) | |
| `profile` | name, avatar_url, avatar_emoji, timezone, locale | |
| `user_settings` | reminders, prefs, push token | |
| `protocols` | Static seed: per-goal preset protocols | |
| `user_protocols` | Active protocol per user | **+ `chamber_type` enum: `soft_1_3` / `hard_1_5` / `hard_2_0_plus`**, **+ `fire_safety_acknowledged_at`** |
| `sessions` | Therapy session records | |
| `wellness_checkins` | Per-session metrics | **Structured columns matching PROMIS items + free-text reflection**, NOT free-form jsonb |
| `user_achievements` | Unlocked achievements | |
| `consent_events` | Privacy consent audit log | **NEW** — required by CCPA/MHMDA/MODPA |
| `suicidality_screens` | PHQ-9 Item 9 results + timestamp | **NEW** — 90-day re-screen logic |
| `subscription` | Tier state + Apple/Stripe receipt | **NEW** — tier model from v0, paywall deferred to v1.1 |

## 7. Domain logic to port from velora-app

Unchanged from v1 — port faithfully:

- **Session state machine:** 4 phases (idle → pressurization → treatment → decompression), per-phase + total elapsed, ear reminder (pressurization), mask reminder (treatment), pause/resume with pause-duration accounting, **wall-clock recalculation on background resume** (critical correctness logic).
- **Goal → Protocol → UserProtocol** flow with `isMedicalCondition` disclaimer.
- **8 achievements** including time-of-day-aware `early_bird` / `night_owl`.
- **Offline queue** with NetInfo + max-3 retry semantics.

## 8. Screen inventory (24 screens, up from 21)

### Auth (3)
- `auth/login` · `auth/register` · `auth/forgot-password`
- Apple Sign In via better-auth web OAuth flow

### First-launch consent (1, NEW)
- `consent/privacy` — CCPA/MHMDA/MODPA opt-in. Granular toggles: analytics, sensitive health data processing, optional research opt-in. Recorded to `consent_events`.

### Onboarding (12 screens, up from 10)
1. **Welcome** — atmospheric gradient bloom, breathing ring, wordmark + tagline
2. **Education 1/3 — What** (chamber + light rays)
3. **Education 2/3 — How** (blood vessel + O₂ molecules, sourced "%~5x plasma O₂ at 2.0 ATA" with citation modal — NOT "1500%" without context)
4. **Education 3/3 — Why** (4-week + 12-week timeline grid, use cases)
5. **Chamber Type** — *NEW* — Soft 1.3 ATA / Hard 1.5–2.0 ATA / Hard 2.0+ ATA. Drives evidence-dot calibration and Expectations Timeline copy.
6. **Goal Select** — 9 goals with **evidence dots**. Tapping a dot reveals study citations.
7. **Personalize** — age, activity (4 chips), sleep slider, target window
8. **Health Screening** — *expanded to 8 cards* (5 absolute + 2 relative + 1 PHQ-9 Item 9 suicidality). Any hard "yes" → red-flag state with "Talk to a clinician first" CTA. Suicidality "yes" → crisis resources screen (US 988 + TR 182) and onboarding pause.
9. **Expectations Timeline** — *sourced copy* from `06-claim-citations.md`. Goal-specific week 1 / 4 / 12 sentences. Each carries a citation tag rendered via `<CitedText>`. **For 1.3 ATA users**, a "Mild HBOT calibration" banner appears on weak-evidence goals (radiance, anti_aging, long_covid, brain_fog, wellness) reminding them that source studies used 2.0 ATA hard chambers.
10. **Fire Safety Education** — *NEW* (FDA Aug 2025 HCP letter). Static, no skip — 100% cotton, no synthetic clothing, no cosmetics/lotions/hair products, no electronics, grounding/static dissipation, ventilation. Acknowledgment recorded in `user_protocols.fire_safety_acknowledged_at`.
11. **Prep Checklist** — 5 items (ear equalization readiness, hydration, no nicotine, plan 60 min, environment check)
12. **Ready** — protocol summary card, "Welcome, {name}", begin button

"Short" 4-step onboarding remains a dev tweak only, not shipped in v1.

### Main tabs (5)
- **Home** — TripleRing hero (Adherence / Recovery / Vitality), active protocol card, "Begin session" CTA, daily tip
- **Progress** — weekly adherence chart + 14-day mood trend + achievements
- **Start** — quick-launch FAB target
- **History/Journal** — 35-day calendar dot grid + mood trend graph + session list
- **Profile** — account, settings, notifications, **subscription tier**, sign out

### Session flow (3 modal stack)
- `session/pre-check` — pre-session form (mood + symptoms + fire-safety re-confirm if first session today)
- `session/active` — 3-phase timer + live pressure curve + ear/mask reminders + pause/end
- `session/complete` — celebration, mood selection, **structured PROMIS check-in items** (per goal), reflection note, achievement unlock toast

**Total: 3 + 1 + 12 + 5 + 3 = 24 screens.**

## 9. Compliance & privacy

### Out of scope
- **HIPAA** — Wellcore is not a covered entity; no PHI from clinical providers. (May change if Restore partnership opens covered-entity status — re-evaluate then.)

### In scope, day 1
- **CCPA** (California) — opt-in consent, privacy policy, "do not sell my data" link, data subject access workflow.
- **MHMDA** (Washington, March 2024) — strict consumer health data definition; mood/sleep/sessions all qualify.
- **MODPA** (Colorado, July 2024) — similar opt-in posture.
- **GDPR-style courtesy posture** — even though EU is not target, biohacker audience expects modern privacy controls.

### Mechanism
- First-launch `consent/privacy` screen with granular toggles.
- All consent events logged to `consent_events` table with timestamp, IP-derived region, user-agent, and exact consent version (versioned policy text).
- Data subject access request (DSAR) flow ships in v1 — even if it's a manual email-and-export, it must exist.
- Privacy policy hosted at `wellcore.app/privacy` (versioned in git, separate marketing-site repo).

### Minors
- Self-attestation 18+ at signup. Under-18 self-screening blocked.

### Disclaimer copy
- Splash / about / pre-session / goal-detail footer copy lifted directly from `03-mild-vs-clinical-positioning.md`. Wellness companion language only — never therapeutic.

## 10. Monetization & pricing

**v1.0 — paywall deferred:**
- Free tier exposes the entire app for the first ~30 days or first 8 sessions, whichever comes first. Telemetry guides paywall threshold.
- Subscription model exists in DB (`subscription` table) and codebase from day 1, simply gated behind a server flag.

**v1.1 — paywall live:**
- **Free tier (post-soft-paywall):** basic timer + manual session log + last-7-day history + 1 active protocol.
- **Premium ($8.99/mo · $59/yr · $199 lifetime):**
  - TripleRing dashboard
  - Full structured wellness check-ins (PROMIS, WHO-5, Subjective Vitality)
  - Citation modal (sourced education)
  - Multi-protocol switching
  - Advanced reminders + Apple Health export
  - Adherence reports + weekly summaries
- Soft paywall placement: post-personalization, post-first-week — never in onboarding.
- Apple/Google in-app purchase (Apple takes 15% on small developer program after year 1; Google equivalent).
- **Truemed HSA/FSA integration** (v1.1) — Wellcore subscription paid with HSA/FSA card via Letter of Medical Necessity flow. Truemed handles the LMN. This is the differentiator vs. all biohacker app competitors.

**Pricing rationale:** Anchors at Oura ($5.99 + ring), Calm ($69.99/yr), Headspace ($69.99/yr), Whoop ($30/mo with hardware). $8.99/mo positions Wellcore as premium-but-not-luxury; $59/yr (~45% discount) drives annual conversion; $199 lifetime captures the biohacker pattern (Bryan Johnson BluePrint, Lifeforce one-time tiers).

## 11. Distribution & partnerships

**Primary acquisition channels (ranked):**

1. **Restore Hyper Wellness partnership** — official companion app. Path: cold outreach + warm intro via Restore's General Atlantic backer network or via Dr. Sherr who has Restore relationships. Even a "soft launch" pilot in 5 studios would be transformative. Restore has 210 studios, ~250k members, and **no app**.
2. **Podcast sponsorships** — Smarter Not Harder (Dr. Scott Sherr, HBOT-friendly), Huberman Lab guest spots if Sherr or Sonners can introduce, Joe Rogan via biohacker community, Peter Attia.
3. **Influencer partnerships** — Dr. Scott Sherr, Dr. Jason Sonners (HBOT USA), Dr. Mark Hyman, Dr. Andrew Huberman tier B/C creators in HBOT space.
4. **Reddit / community organic** — r/HBOT, r/longhaul, r/Biohackers, Survivor Corps, Disabled Patient Organization for long COVID.
5. **Chamber manufacturer co-marketing** — OxyHealth, Summit to Sea, Newtowne — bundle Wellcore subscription with chamber sale.
6. **App Store Optimization** — keywords: `hyperbaric`, `HBOT`, `oxygen therapy`, `home hyperbaric`, `recovery tracking`, `long covid recovery`, `hyperbaric protocol`. Localized to en-US storefront.

**Marketing site:** `wellcore.app` (Next.js or Astro, separate repo) with US English copy, waitlist email capture, partnership inquiry form, citations library mirror, evidence-strength explorer.

## 12. Phase roadmap (revised)

| Phase | Scope | Est. | Notes |
|---|---|---|---|
| **0 — Foundation** | Monorepo scaffold, shared zod package, Hono + Drizzle + Postgres + Docker, Expo SDK 55 + Expo Router + theme + fonts. **Adjustment: i18n locale swap to `en` primary, `tr` hidden.** | 1 wk | Plan: `2026-05-01-wellcore-faz-0-foundation.md` (existing, minor i18n revision needed) |
| **1 — Design system** | Theme tokens, brand primitives (WellcoreMark, Wordmark, Ring, TripleRing, HeroGradient), icon set, asset generation. **+ `<CitedText>` + `<EvidenceDot>` + `<ChamberTypeSelector>` + `<FireSafetySlide>` + `<CrisisResourcesScreen>` + showcase route.** | 1 wk | New plan needed |
| **2 — Backend core** | Drizzle schemas + migrations, better-auth (Apple web OAuth), sessions/profile/settings/achievements/protocols/checkins endpoints, MinIO presigned URLs, Dokploy deploy. **+ `consent_events` + `suicidality_screens` + `subscription` tables. + structured `wellness_checkins` columns. + citations static data in `packages/shared/citations.json`. + privacy DSAR endpoint stub.** | 2 wk | Slightly larger than v1 |
| **3 — Auth + onboarding** | 3 auth screens, **12-step onboarding** (Chamber Type, Fire Safety added; Health Screening expanded to 8 cards), secure tokens, locale picker (en + dev-only tr), **first-launch consent screen**. | 1.5 wk | +0.5 wk vs v1 |
| **4 — Core mobile screens** | Home (TripleRing), Active Session (timer + reminders + wall-clock recalc), Complete (mood + structured PROMIS check-in + reflection), History (calendar + trend), Progress (charts + achievements), Profile (with subscription state UI). | 2 wk | Same |
| **5 — Polish & ship v1.0** | Offline queue, Reanimated layout animations, ring fills, hero blooms, haptics, accessibility, EAS build, store-listing, US App Store submission, TestFlight + internal testing, **CCPA/MHMDA DSAR docs**. | 1.5 wk | +0.5 wk for compliance docs |
| **6 — Monetization (v1.1)** | Subscription tier enforcement, Apple/Google IAP, soft paywall placement, **Truemed HSA/FSA integration**, weekly summary emails, Apple Health export. | 2 wk | New phase, post v1.0 |
| **Total to v1.0 ship** | | **~9 wk** | (Was ~7-8 wk in v1) |

## 13. Out of scope (v1.0)

- Subscription / paywall enforcement (deferred to v1.1)
- Truemed HSA/FSA (deferred to v1.1)
- Device pairing / BLE chamber integration
- Barometer auto-detection of pressure (deferred to v1.2 — Deepaura pattern, iOS-only via CoreMotion)
- Apple HealthKit deep integration beyond export
- Partner sharing / social features
- Watch app
- Pediatric onboarding flow
- Spanish locale
- Pro / B2B tier for clinics or athletic teams
- TR locale in production UI (kept in code only)

## 14. Open risks

| Risk | Mitigation |
|---|---|
| FDA/FTC enforcement on wellness claims | Citation library + sourced copy + evidence dots + disclaimer copy from research/03; never therapeutic language |
| FDA Aug 2025 fire-safety letter precedent | Mandatory non-skippable Fire Safety screen; pre-session re-confirm; checklist before each session |
| 1.3 ATA evidence gap weaponized by detractors | Chamber Type selector + calibration banners + transparent evidence dots; honest framing on home-chamber audience |
| Restore partnership doesn't materialize | Channels 2-6 in §11 are independent and viable; partnership is upside, not dependency |
| WHOOP-style wellness disclaimer failure | Avoid traffic-light bands; use descriptive "session quality" language; never imply diagnostic capability |
| Suicidality false-negative on screen | PHQ-9 Item 9 is industry-standard but not a clinical diagnostic; copy must direct to crisis resources, not assert safety |
| State privacy law evolution (TX, NJ joining MHMDA-style) | Versioned consent text + audit log future-proofs against incremental law additions |
| better-auth Apple Sign In bugs | Use web OAuth flow only; pin to recent stable; verified in Faz 0 |
| Hono RPC + Metro bundler edge cases | Custom resolver in Faz 0; verify before Faz 4 |
| Dokploy webhook reliability | Manual deploy fallback documented in `ops/dokploy.md` |
| Solo-founder bandwidth | Phase plans aggressively prune scope; v1.0 explicitly defers monetization |

## 15. Next step

Two parallel tracks — execute in this order:

1. **Update Faz 0 plan i18n step** — small revision: swap `tr` primary → `en` primary; keep `tr` locale file for codebase but exclude from default language detection. This is a 5-minute edit to `2026-05-01-wellcore-faz-0-foundation.md` Task 10.

2. **Author Faz 1 plan** — `docs/plans/2026-XX-XX-wellcore-faz-1-design-system.md`. Cover: theme tokens (already specced), brand primitives, **new components surfaced by v2 research** (`CitedText`, `EvidenceDot`, `ChamberTypeSelector`, `FireSafetySlide`, `CrisisResourcesScreen`), citations.json schema, evidence-dot rendering, asset generation pipeline. Then ship Faz 0, then Faz 1 in worktrees.

After both, Faz 2 plan with the expanded backend surface (consent, suicidality, subscription, structured checkins, citations static endpoint).
