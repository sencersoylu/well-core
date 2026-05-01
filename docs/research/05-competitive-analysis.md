# Wellcore Competitive Analysis — Wellness Companion Apps 2026

_Last updated: 2026-05-02. Author: research pass for Wellcore HBOT companion._

## TL;DR

- **Market gap is real but narrowing.** Only 3 HBOT-specific consumer apps exist worldwide (HBOT Companion by Mobixed, Deepaura, OneBase Health). All three are thin: scheduling + reminders + light HealthKit sync. None has a Bevel/Whoop-grade design language, an editorial daily flow, or a 12-week protocol structure. **Wellcore can be the first premium HBOT companion.**
- **Aviv Clinics has a clinic-tethered app** (App ID 1514490893) — proves clinical demand but it is gated to Aviv patients only. Not a direct competitor; it is a reference for the "structured therapeutic program" pattern.
- **Pricing benchmark for premium wellness in 2026:** ~$70–$200/year for software-only (Oura $69.99/yr, Calm $69.99/yr, Headspace $69.99/yr, Bevel $99.99/yr, Levels $199/yr, Lumen $228/yr, Whoop $199–$359/yr). Median annual is **$12.99/mo, $38.42/yr** across all categories per RevenueCat 2026. Health & Fitness is the only category where annual plans dominate (60.6%).
- **Onboarding is converging on a long, education-heavy flow.** Bevel uses 34 screens; Oura ~12–15; Headspace gets users to the first 3-min meditation in <2 minutes. Best-in-class apps invest 3–5 minutes upfront *if and only if* they end on a tangible first action.
- **Wellcore's "no paywall in onboarding" stance is a defensible 2026 differentiator** — RevenueCat data shows trial-gated paywalls in onboarding still convert at 6.9% median, but reviews of Calm and Headspace show users feel hard-sold; Bevel's soft paywall after personalization is the closer template.
- **Claim language: avoid traffic-light bands tied to clinical metrics.** The FDA's July 2025 WHOOP warning letter established that green/yellow/red ranges around blood-pressure-adjacent measurements signal medical use even with disclaimers. Wellcore should phrase pressure/oxygen as "session quality" not "treatment efficacy."

---

## HBOT-specific apps

The HBOT software market on iOS/Android is shockingly small. Three independent consumer apps and two clinic-tethered apps. None has a meaningful review base (<50 ratings each as of May 2026).

### HBOT Companion (Mobixed LLC)
- **Tagline:** "Schedule, track, and stay informed about your therapy sessions."
- **Pricing:** Unverified; appears free with ads or freemium.
- **Features:** Calendar of sessions, recurring reminders, AI chatbot for HBOT questions, educational articles.
- **UX:** Utility-grade. Generic iOS form sheets, no hero metric, no streak/score, no protocol concept.
- **Source:** [App Store](https://apps.apple.com/us/app/hbot-companion/id6744744772), [Google Play](https://play.google.com/store/apps/details?id=com.mobixed.hbot)
- **Takeaway:** Low bar — Wellcore can outclass on visual design alone.

### Deepaura
- **Tagline:** "Comprehensive mobile application for mild Hyperbaric Oxygen Therapy."
- **Pricing:** Unverified.
- **Notable:** Uses **device barometer to auto-detect chamber pressure changes** — a strong UX idea. HealthKit integration for HR + SpO₂ during/after sessions. Offline-first (airplane mode in chamber).
- **Source:** [deepaura.app](https://deepaura.app/)
- **Takeaway:** **Steal the barometer auto-detection pattern.** This is the single best HBOT-native UX idea found in the entire teardown — it removes a friction point (manual session start) that no other modality app solves as elegantly.

### OneBase Health
- **Tagline:** "Know when and how long you should be in your HBOT chamber."
- **Pricing:** Unverified; appears tied to OneBase chamber sales (hardware-bundled).
- **Features:** Pre-built session templates (pre-sports, mental clarity, maintenance).
- **Source:** [onebasehealth.com](https://onebasehealth.com/)
- **Takeaway:** Validates the "use-case-led protocols" framing. Wellcore's Faz 0 plan already has this — confirmed direction.

### Aviv Clinics App (clinic-tethered)
- **Positioning:** Patient companion to the Aviv Medical Program (8–12 week clinic protocol).
- **Features:** Care-team chat, personal workout plans, personal diet plans, schedule, experience reporting.
- **Source:** [App Store](https://apps.apple.com/us/app/aviv-clinics/id1514490893)
- **Takeaway:** Best **structural reference** for a 12-week therapeutic program. Their "report your experience" daily check-in is exactly the journal pattern Wellcore needs. Not a competitor (gated to clinic patients).

### OxyHealth, OxyHelp, HPO Tech
No public consumer apps. Hardware-only manufacturers. (Sources: [oxyhelp.com](https://oxyhelp.com/), [hpotech.com](https://www.hpotech.com/about-us/))

**Turkish market:** No Turkish-made HBOT app found. HPO TECH (Istanbul) builds chambers but has no companion app. Wellcore would be the first Turkish HBOT software product.

---

## Premium wellness companions

### Whoop
- **Tagline / positioning:** "Unlock your potential. Performance optimization for athletes and high-performers."
- **Pricing (2026):** **One $199/yr ($25/mo); Peak $239/yr ($30/mo); Life $359/yr ($40/mo).** Hardware bundled with subscription — no separate device cost.
- **Onboarding:** Bluetooth pair → goal-selection ("Focus on Wellness" / "Athletic Training" / "General Health") → profile (height/weight/age/sex) → first-night sleep needed before any score appears. Approx 8–10 screens, 3–4 minutes.
- **Hero metric:** **Recovery score (0–100%)** with red/yellow/green bands. Strain, Sleep, HRV are secondary.
- **Paywall:** N/A — subscription is the entry point. Hardware is the hook.
- **What to copy:** The **daily journal** — 300+ tickable behaviors, monthly correlation report ("On days you did X, recovery was Y% higher"). This is the gold-standard retention loop for any therapeutic protocol.
- **What to avoid:** **The traffic-light score got Whoop a July 2025 FDA warning letter** for the BPI feature — green/yellow/red bands plus blood-pressure adjacency was deemed clinical signaling. Wellcore must phrase its session/pressure feedback as descriptive, not categorical.
- **Sources:** [Whoop pricing](https://www.whoop.com/us/en/membership/), [Whoop Journal](https://www.whoop.com/us/en/thelocker/the-whoop-journal/), [FDA Warning analysis](https://pmc.ncbi.nlm.nih.gov/articles/PMC12822547/)

### Bevel
- **Tagline:** "The connected health coach. All-in-one."
- **Pricing:** Free core app; **Bevel Pro $14.99/mo or $99.99/yr.**
- **Onboarding:** **34 screens.** Long but personalized; each step shows *why* the data is needed and previews the resulting insight. Soft paywall presented after onboarding completes.
- **Hero metric:** **Energy Bank** — composite of Recovery, Sleep, Strain, Stress. Less clinical than Whoop's Recovery; framed as a daily "balance."
- **Paywall:** Soft, post-personalization. Free trial → annual default.
- **What to copy:** (1) The "show the insight before you ask the question" pattern — every onboarding screen previews what value the answer unlocks. (2) Soft post-personalization paywall placement — sunk-cost effect drives 6–7%+ conversion. (3) Energy Bank framing — composite, descriptive, non-clinical.
- **What to avoid:** Day-1 dashboard is empty (no pre-populated demo data). Reviews flag this as demotivating. **Wellcore should ship a fake/demo "yesterday's session" on day 1.**
- **Sources:** [Bevel App Store](https://apps.apple.com/us/app/bevel-all-in-one-health-app/id6456176249), [Neura review](https://neura.health/insight/bevel-health-app-in-depth-review), [Autonomous review](https://www.autonomous.ai/ourblog/bevel-app-review)

### Oura
- **Tagline:** "The smart ring with personalized health insights."
- **Pricing (2026):** **$5.99/mo or $69.99/yr.** First month free. Hardware $349+ separate.
- **Onboarding:** Account → Bluetooth ring pair → permission grants (Bluetooth, notifications, HealthKit) → height/weight/age/sex → focus-area picker → activity baseline → sensor test. ~12–15 screens, 3–5 minutes. **No score for ~24 hours** (needs first night).
- **Hero metric:** **Readiness score (0–100)** — composite. Sleep score and Activity score are siblings.
- **Paywall:** Membership is mandatory after the included first month. No paywall theatre — it is presented as part of activation.
- **What to copy:** (1) Sensor-test step at the end of onboarding builds trust. (2) "Focus area" picker shapes the home screen content for weeks. (3) Cheap monthly ($5.99) makes annual ($69.99) feel like a no-brainer — anchor pricing.
- **What to avoid:** Forced membership after $349 hardware purchase generated significant 2024–2025 backlash on Reddit. **Wellcore has no hardware revenue, so a software-only subscription is more defensible — but the soft-stick first month should be generous.**
- **Sources:** [Oura Membership](https://ouraring.com/membership), [Mobbin onboarding flow](https://mobbin.com/explore/flows/8d024af9-df00-42ca-8b96-40d4571d1294), [Fortune CEO interview](https://fortune.com/2026/02/04/11-billion-oura-ceo-subscriptions-tom-hale-peloton-tesla-elon-musk/)

### Lumen
- **Tagline:** "Hack your metabolism. Personalized nutrition coach."
- **Pricing (2026):** **Device $199–$299; subscription ~$19/mo or ~$199/yr.** Bundles include device + 1 month free up to $799 12-month family plans.
- **Onboarding:** Goal-selection (weight loss / energy / athletic) → device pair → first morning breath → fuel-source result → meal plan generated.
- **Hero metric:** **Lumen score (1–5)** — fat-vs-carb burn from breath CO₂.
- **Paywall:** N/A in app — bundled with hardware; subscription continues post-bundle.
- **What to copy:** **The first-session moment is the activation peak.** Lumen's "first breath = first number" is what every wellness protocol needs. For Wellcore, the equivalent is "first session = first session-quality summary."
- **What to avoid:** Device-app coupling means cancelling subscription bricks ~80% of value. Wellcore should not artificially gate the schedule itself.
- **Sources:** [Lumen shop](https://www.lumen.me/shop), [Innerbody review](https://www.innerbody.com/lumen-review)

### Levels
- **Tagline:** "Metabolic health. Continuous glucose monitoring for everyone."
- **Pricing (2026):** **Software membership $125–$200/yr; CGM sensors $100–$200/mo on top.** Total realistic spend: ~$1,500–$2,500/yr.
- **Onboarding:** Quiz-driven (`/join?quiz=true`) → membership purchase → sensor shipment → app pair on apply day → 14-day score baselining.
- **Hero metric:** **Metabolic Score (1–10)** per meal + daily glucose stability index.
- **Paywall:** **Hard, upfront.** Quiz funnels straight into checkout. No free tier.
- **What to copy:** Pre-onboarding quiz as a personalization + commitment device.
- **What to avoid:** Hard upfront paywall; high price ceiling; reviews note "you need a nutritionist to interpret the data" — too clinical.
- **Sources:** [Levels pricing](https://support.levels.com/article/720-levels-pricing-and-plans), [Nutrisense Levels review](https://www.nutrisense.io/blog/cost-of-levels-cgm)

---

## Therapy adherence / habit apps

### Streaks (iOS)
- **Pricing:** $4.99 one-time. No subscription.
- **Pattern:** Up to 24 habits, daily/weekly/monthly cadences, statistics, share-with-friend. Streak count is the entire product.
- **Lesson for 12-week HBOT protocol:** A pure streak count is **fragile** — one missed day demotivates. Wellcore should track *adherence percentage over a rolling window* (e.g., "21 of 24 sessions in the last 4 weeks — on track") rather than a fragile streak number.
- **Source:** [streaksapp.com](https://streaksapp.com/)

### Done
- **Pricing:** Free, $2.99/mo Pro.
- **Pattern:** Per-habit progress rings; multi-step habits (e.g., "drink water 8x/day"). Better suited to long protocols than Streaks because partial credit exists.

### Apple Health
- **Pricing:** Free, system-bundled.
- **Pattern:** Trends, "highlights," 90-day rolling comparisons. **Wellcore must write to HealthKit** — users expect HBOT sessions to appear in the system-level timeline.

### Calm / Headspace
- **Pricing:** Calm $16.99/mo or $69.99/yr (some sources cite $79.99); lifetime $399–$499. Headspace $12.99/mo, $69.99/yr.
- **12-week pattern:** Both rely on **structured course series** ("21 Days of Calm," "Take 10"). Course-shaped content with a visible end gives users a finish line. Wellcore's 12-week protocol matches this structure.
- **Sources:** [Calm review 2026](https://www.autonomous.ai/ourblog/calm-app-review), [Headspace pricing](https://www.vendr.com/marketplace/headspace)

---

## Cold plunge / sauna apps (adjacent regulatory framing)

### Othership
- **Tagline:** "Shift your state, one breath at a time."
- **Pricing:** Studio intro $128 for 14 days unlimited; app subscription ~$13/mo (unverified exact).
- **Pattern:** **Music-driven guided sessions** indexed by intent ("energize," "wind down"). Claim language is purely experiential ("shift your state") — no health claims at all.
- **Lesson:** **This is the cleanest claim-language template Wellcore should mimic.** Othership never says "improves recovery" or "reduces inflammation" — it says "energize," "down-regulate," "feel."
- **Source:** [othership.us/app](https://www.othership.us/app)

### Plunge (Plunge.com)
- Hardware company with a thin app (timer + water-quality reminders). No notable UX patterns to copy.

---

## Synthesis

### Onboarding patterns

| App | Screens | Time | Education : Action ratio | First "moment" |
|---|---|---|---|---|
| Whoop | ~10 | 3–4 min | 50:50 | First sleep night |
| Bevel | 34 | 5–7 min | 70:30 | Demo dashboard |
| Oura | ~13 | 3–5 min | 60:40 | Sensor test + first sleep |
| Headspace | ~8 | <2 min | 30:70 | First 3-min meditation |
| Lumen | ~12 | 4–6 min | 40:60 | First breath result |
| HBOT Companion | ~5 | <1 min | 90:10 (just forms) | None |

**Common pattern:** 8–15 screens, 3–5 minutes. Best apps end on a **tangible first action or first number** (Headspace, Lumen, Oura). Worst apps end on an empty dashboard (Bevel — flagged in reviews).

### Paywall strategies

Three strategies in 2026:

1. **Onboarding paywall (hard):** Calm, Headspace, Levels. Trial-gated. 6.9% median trial conversion (RevenueCat 2026). High friction, but front-loaded revenue.
2. **Usage paywall (soft):** Bevel, Done. Paywall after personalization or after N free uses. Sunk-cost works in favor.
3. **Subscription-as-entry:** Whoop, Oura, Lumen. Hardware-tethered; software is the lock-in.

**Wellcore's "no paywall in onboarding for v1.0, deferred to v1.1" stance is well-founded.** v1.1 should adopt the **Bevel soft post-onboarding pattern** — not Calm's hard-gate, which has the worst review sentiment of the cohort. Specifically: free for 14–28 days (cover one full session-cadence cycle), then paywall on access to historical insights / weekly reports.

### Retention mechanics for 12-week protocols

| Mechanic | Source app | Apply to Wellcore? |
|---|---|---|
| Streak count | Streaks, Duolingo | **Use only for daily check-in, not session adherence.** Sessions are 3–5x/week, not daily. |
| Rolling adherence % | Apple Fitness rings | **Yes** — "21 of 24 sessions in last 28 days." |
| Daily journal w/ correlation report | Whoop | **Yes** — strongest single retention loop found. |
| Weekly summary email | Oura, Whoop | **Yes** — also drives reactivation push. |
| Course/series with visible end | Headspace, Calm | **Yes** — the 12-week protocol IS this. |
| Milestone celebrations (Day 14, Day 30) | Most | **Yes** — cheap to implement. |
| Care-team chat | Aviv Clinics | **v1.2+** — too costly for solo dev. |

### Pricing benchmarks (table)

| App | Monthly | Annual | Lifetime | Hardware required |
|---|---|---|---|---|
| Oura | $5.99 | $69.99 | — | Yes ($349+) |
| Calm | $16.99 | $69.99 | $399–499 | No |
| Headspace | $12.99 | $69.99 | — | No |
| Bevel | $14.99 | $99.99 | — | No (uses Apple Watch) |
| Lumen | ~$19 | ~$199 | — | Yes ($199–299) |
| Whoop One | $25 | $199 | — | Bundled |
| Whoop Peak | $30 | $239 | — | Bundled |
| Levels | ~$17 | $125–200 | — | + CGM ($100–200/mo) |
| Streaks | — | — | $4.99 | No |
| Done | $2.99 | unverified | — | No |
| **Median software-only annual** | **~$13/mo** | **~$70/yr** | — | — |

### Claim language audit

**What credible apps say:**
- Othership: "shift your state," "down-regulate," "feel"
- Oura: "readiness," "balance," "trends"
- Bevel: "energy bank," "recovery"
- Headspace: "calm your mind," "fall asleep faster"

**What credible apps avoid:**
- Specific disease names (anxiety, depression, hypertension, inflammation)
- Comparative clinical language ("normal," "abnormal," "in-range," "out-of-range")
- Treatment/cure framing
- Numeric thresholds tied to medical diagnostics

**FDA precedent (July 2025 WHOOP warning letter):**
- Disclaimers alone do not protect a product if the **feature itself implies clinical use**.
- Green/yellow/red traffic-light bands attached to physiological measurements are read as clinical signaling.
- "Inherent association" doctrine: if a measured quantity is inherently associated with a diagnosis (e.g., blood pressure ↔ hypertension), the wellness exemption does not apply.

**For Wellcore specifically:**
- Frame pressure/oxygen feedback as **session quality** (e.g., "session held 1.3 ATA stably for 58/60 min") — descriptive, not categorical.
- Avoid "recovery improved by 18%" — instead "you've completed 12 of 24 protocol sessions."
- For symptom check-ins, use Likert ("how do you feel today?") not diagnosis ("rate your fatigue").
- No traffic-light bands on any vital sign synced from HealthKit.

Sources: [FDA Warning Letter Breakdown](https://insider.thefdagroup.com/p/fda-warning-letter-breakdown-whoop), [Mintz analysis](https://www.mintz.com/insights-center/viewpoints/2791/2025-07-21-fda-warning-letter-reminds-industry-wellness-claims-only), [WSGR FDA-WHOOP analysis](https://www.wsgr.com/en/insights/the-fda-and-whoop-debate-challenges-the-line-between-wellness-products-and-medical-devices.html)

### Market gap for Wellcore

The HBOT-specific app market in May 2026 has:
- Three thin utility apps (HBOT Companion, Deepaura, OneBase).
- One clinic-tethered app (Aviv) that proves demand but is gated.
- Zero apps with Bevel/Whoop-grade design.
- Zero apps with a structured 12-week therapeutic program flow.
- Zero apps in Turkish, despite Turkey being a meaningful HBOT clinical market.
- Only Deepaura has the elegant **barometer auto-detection** UX (steal this).

**Wellcore's defensible wedge:**
1. **Editorial/premium design language** (Bevel-influenced) in a category that looks like 2014 utility apps.
2. **Structured 12-week protocol UX** borrowed from Aviv's clinic app pattern but made consumer-grade.
3. **Turkish market first-mover** — no Turkish HBOT app exists; Wellcore can own this niche while building English version in parallel.
4. **Non-clinical claim language** that is FDA-defensible from day one (Othership template) — competitors haven't been audited yet but will be.
5. **Soft retention via Whoop-style journal** — none of the existing HBOT apps have this.

---

## Recommendations for Wellcore

### Onboarding length and structure
- **Target: 10–12 screens, 3–4 minutes.** Mirror Oura's pacing.
- Structure: Welcome (1) → goal/use-case picker (2) → chamber type & specs (1–2) → schedule preference (1) → HealthKit + notification permissions (2) → demo "yesterday's session" preview (1) → first-session prompt (1).
- **End on a tangible action**, not a dashboard. Either "schedule your first session now" or "your first session preview" with a fake completed example.
- **Steal Bevel's "show the insight before asking the question"** pattern on each form screen.

### Hero metric design
- **Single composite metric: "Protocol Progress" (0–100%).** Simple, descriptive, FDA-safe.
- Sub-metrics on home: sessions this week, total sessions in protocol, average session quality (descriptive only).
- **Avoid** traffic-light bands. **Avoid** scoring HRV, SpO₂, or BP even if HealthKit gives them.
- Visual: Whoop-style ring metaphor, but a single ring with editorial typography (Bevel). One ring, not three.

### Initial paywall strategy (when v1.1 introduces it)
- **Free tier (forever):** Schedule, single-session reminders, basic streak.
- **Paid tier ($69.99/yr or $7.99/mo):** Daily journal + correlation reports, weekly summary email, multi-protocol library, historical insights >28 days, export.
- **Trigger point:** After day 14 of usage (one full session-cadence cycle), present the paywall on access to the weekly report — never during onboarding.
- **Generous first-month free** for v1.1 launch users; honor v1.0 early adopters with grandfathered free access for 6–12 months.

### Retention plan
1. **Daily Journal (Whoop-style):** 30–50 tickable items (sleep quality, energy, mood, side effects, supplements). Read-only correlation report after 14 days.
2. **Weekly summary push + email** every Sunday: sessions completed, journal patterns, next week's protocol.
3. **Milestone celebrations:** Day 7, Day 14, Day 30, halfway (Week 6), completion (Week 12).
4. **Rolling adherence %** as the home-screen anchor, not a fragile streak.
5. **Optional: protocol library** (recovery / sleep / cognitive / athletic) — borrow OneBase's framing but expand.

### Pricing recommendation with rationale
- **v1.0:** Free. No paywall. Goal is review collection + retention data.
- **v1.1:** **$7.99/mo or $69.99/yr** (Oura/Calm/Headspace anchor). Lifetime $199 limited release for first 500 users (Calm-style, drives word of mouth + cash).
- Avoid Whoop's $25/mo — there is no hardware to amortize.
- Avoid Levels' $200+/yr — too clinical positioning, would invite FDA scrutiny.
- Turkish market: localized pricing **₺2,499/yr (~$70) or ₺249/mo (~$8)** — match purchasing power, do not undercut.
- Annual default in UI; monthly option exists but is de-emphasized (ARPU win — annual subscribers are 2.4x more profitable per RevenueCat 2026).

---

## References (URLs)

**HBOT-specific:**
- HBOT Companion App Store: https://apps.apple.com/us/app/hbot-companion/id6744744772
- HBOT Companion Google Play: https://play.google.com/store/apps/details?id=com.mobixed.hbot
- Deepaura: https://deepaura.app/
- OneBase Health: https://onebasehealth.com/
- Aviv Clinics App: https://apps.apple.com/us/app/aviv-clinics/id1514490893
- HPO TECH (Turkey): https://www.hpotech.com/about-us/
- OxyHelp: https://oxyhelp.com/

**Premium wellness companions:**
- Whoop Membership: https://www.whoop.com/us/en/membership/
- Whoop Recovery: https://www.whoop.com/us/en/thelocker/how-does-whoop-recovery-work-101/
- Whoop Journal: https://www.whoop.com/us/en/thelocker/the-whoop-journal/
- Bevel App Store: https://apps.apple.com/us/app/bevel-all-in-one-health-app/id6456176249
- Bevel review (Autonomous): https://www.autonomous.ai/ourblog/bevel-app-review
- Bevel review (Neura): https://neura.health/insight/bevel-health-app-in-depth-review
- Oura Membership: https://ouraring.com/membership
- Oura onboarding flow (Mobbin): https://mobbin.com/explore/flows/8d024af9-df00-42ca-8b96-40d4571d1294
- Oura Fortune interview: https://fortune.com/2026/02/04/11-billion-oura-ceo-subscriptions-tom-hale-peloton-tesla-elon-musk/
- Lumen pricing: https://www.lumen.me/shop
- Lumen review: https://www.innerbody.com/lumen-review
- Levels pricing: https://support.levels.com/article/720-levels-pricing-and-plans
- Levels review: https://www.nutrisense.io/blog/cost-of-levels-cgm

**Habit / therapy adherence:**
- Streaks: https://streaksapp.com/
- Calm review 2026: https://www.autonomous.ai/ourblog/calm-app-review
- Headspace pricing: https://www.vendr.com/marketplace/headspace
- Headspace onboarding analysis: https://behindlogin.com/news/headspace-onboarding-a-ux-journey-that-welcomes-and-delights/

**Cold plunge / sauna:**
- Othership: https://www.othership.us/
- Othership App: https://www.othership.us/app

**Regulatory / claim language:**
- FDA Warning Letter Breakdown (WHOOP): https://insider.thefdagroup.com/p/fda-warning-letter-breakdown-whoop
- WHOOP FDA case (PMC): https://pmc.ncbi.nlm.nih.gov/articles/PMC12822547/
- Mintz wellness claims analysis: https://www.mintz.com/insights-center/viewpoints/2791/2025-07-21-fda-warning-letter-reminds-industry-wellness-claims-only
- WSGR FDA-WHOOP analysis: https://www.wsgr.com/en/insights/the-fda-and-whoop-debate-challenges-the-line-between-wellness-products-and-medical-devices.html
- FDA 2026 General Wellness Policy: https://natlawreview.com/article/fdas-2026-general-wellness-policy-and-what-it-means-manufacturers-wearable-devices

**Market data:**
- RevenueCat State of Subscription Apps 2026: https://www.revenuecat.com/state-of-subscription-apps/
- Adapty State of In-App Subscriptions 2026: https://adapty.io/state-of-in-app-subscriptions/
- Health & Fitness App Benchmarks 2026: https://www.businessofapps.com/data/health-fitness-app-benchmarks/
