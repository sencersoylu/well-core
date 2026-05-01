# US Market — Wellcore Go-to-Market Research

> Research date: 2026-05-02. Pivot: TR → US primary market. EN primary locale. All dollar figures USD.
> Note on rigor: Where numbers come from market-research aggregators (Precedence, Future Market Insights, etc.) they are cited as estimates, not facts. Where they come from primary sources (FDA, FTC, SEC/PR, App Store), they are cited as such.

## TL;DR

- **Market size:** US HBOT total market ~$1.0B in 2025, projected ~$1.72B by 2034 (CAGR ~6.2%); home/wellness segment is the fastest-growing slice but still niche — likely **low six figures of installed home soft chambers** in the US (vendor-level disclosed numbers do not exist; this is an estimate built from market-report color and OxyHealth/Summit/Newtowne being the dominant brands at $5k–$25k price points).
- **Best-funded comp is Restore Hyper Wellness** (210+ studios, $177M raised, General Atlantic-backed) — they sell mHBOT alongside cryo, IV, red light. Memberships ~$229–$260/mo. They are a partnership target, not just a competitor.
- **#1 opportunity:** the *home soft-chamber + biohacker* user is currently underserved by any companion app. HBOT Companion (Mobixed LLC) is the only direct iOS competitor and is feature-thin. Wellcore has clean room.
- **#1 risk:** FDA issued a Letter to Health Care Providers (Aug 2025) on HBOT fire/safety after fatalities; FTC continues to crack down on wellness claims. Wellcore must aggressively de-medicalize copy and add a strong safety/contraindications layer.
- **Pricing recommendation:** Free tier (timer, log, 9-goal tracking) + Premium **$8.99/mo or $59/yr** (~45% annual discount) + optional **$199 lifetime** for biohacker pricing psychology. Avoid stacking with Whoop/Oura ($30/$6) — anchor closer to Oura tier.
- **Acquisition:** rank order = (1) niche HBOT-podcast & influencer sponsorships (Dr. Scott Sherr, Dr. Jason Sonners), (2) chamber-manufacturer co-marketing (OxyHealth/Summit/Newtowne dealer bundle), (3) Restore partnership pilot, (4) Reddit organic (r/HBOT, r/Biohackers), (5) ASO on `home hyperbaric`.
- **Founder logistics:** Sencer can ship to US App Store on a Turkish dev account today; LLC/Delaware C-corp only when raising or hitting ~$100k ARR. No HIPAA exposure if Wellcore stays self-tracker. CCPA + Washington MHMDA + Maryland MODPA *do* apply once any CA/WA/MD user signs up.
- **Localization:** Drop TR from v1 marketing; keep TR strings in codebase but de-prioritize. Spanish (US Hispanic) is a viable v1.5 add. Native US English copy required (different idiom register from Turkish-translated EN).

---

## 1. Home HBOT chamber market

### Market size & growth

US HBOT market overall is estimated at **~$1.00B in 2025**, growing to ~$1.72B by 2034 (CAGR ~6.22%), per Precedence Research. Future Market Insights and Allied Market Research publish similar bands ($1–3B globally, US ~40% share). These are top-down estimates; no public vendor-level installed-base figure exists.

The **home / residential segment is called out as the fastest-growing sub-segment** by multiple aggregators, driven by (a) portable soft chambers, (b) post-COVID interest, (c) biohacker mainstreaming. iCRYO and OxyHealth signed a joint 2025 promotion deal at the **Health Optimization Summit (May 2025)** which is a strong signal that wellness-channel distribution is heating up.

**Wellcore working estimate:** US installed base of soft home chambers is in the low-six-figure range (50k–150k units). This is an inference from (a) global aggregator color, (b) OxyHealth being founded 2003 and being the dominant home brand for 20+ years, (c) the long-tail dealer network (FB-group used market is highly active). Treat as estimate.

### Major brands & price points

| Brand | Type | Approx. retail USD | Notes |
|---|---|---|---|
| OxyHealth Vitaeris 320 | Soft 1.3 ATA | $20,000–$23,000 | Market leader, FDA-cleared 510(k) |
| Summit to Sea Grand Dive Pro | Soft 1.3 ATA | $9,000–$13,000 | Mid-tier, hot in chiropractic channel |
| Newtowne Hyperbarics | Soft 1.3 ATA | $5,500–$9,500 | Value tier, popular FB resale |
| Macy-Pan | Soft 1.3 ATA | $4,500–$8,000 | Asia-imported, contested FDA status |
| Oxygen Health Systems | Soft 1.3 ATA | $7,000–$12,000 | Growing biohacker brand |
| OxyNova / Sechrist (hard) | 2.0+ ATA medical | $50,000–$150,000+ | Clinic-tier |

Distribution: direct from manufacturer, dealer/chiropractic networks, used market via Facebook groups (very active resale), and increasingly Amazon for the cheapest Macy-Pan tier.

### Buyer demographics

Inferred (no public vendor demographic study):
- **Affluent biohacker household**, 35–60, HHI $200k+, often a Type-A founder/exec or longevity-curious physician.
- **Concerned parents** with a concussed teen athlete (youth football, soccer, hockey) or a child with developmental concerns (autism community has historically been an OxyHealth segment).
- **Long COVID self-treaters** who tried clinic sessions and decided it was cheaper to buy.
- **Functional / chiropractic clinics** (B2B — chambers in their facility offering cash-pay sessions).
- Geography: heavy in FL, TX, CA, AZ, CO, FL, NY/NJ suburbs, NC.

---

## 2. HBOT clinic landscape (US)

### Restore Hyper Wellness deep-dive (priority)

- **Scale:** 210+ studios across the US (per restore.com/memberships).
- **Funding:** $177M total. Series B $140M led by **General Atlantic** in Dec 2021 (Paul Weiss / GA confirmed). Latest reported round $27.5M (Jul 2024, per Tracxn). New CEO Matt Vonderahe (Feb 2025). Ranked #1 in their category in Entrepreneur 2025 Franchise 500. **No bankruptcy** despite 2024 chatter.
- **HBOT pricing:** Restore brands their service "**Mild Hyperbaric Oxygen Therapy**" (mHBOT). À-la-carte pricing is studio-set; Groupon shows promo from $58/60-min in Houston. Standard cash-pay rates inferred at **$75–$125/session**.
- **Membership:** ~$229 first month → $260/mo ongoing (Utah datapoint), 3-month minimum, member discounts on all therapies, 2 monthly guest passes. They have a proprietary "Restore app" already (membership + booking + guest pass distribution).
- **Geographic concentration:** TX HQ, heavy in TX/FL/CA/NC/NY; rapid franchise growth.

**Strategic implication for Wellcore:** Restore's app is transactional (book, pay, share guest pass). It is *not* a session-tracker / progress / goal companion. There is genuine integration room — Wellcore could be the "your wellness companion across all the modalities Restore sells." Pitch: "We tell members why their oxygen and red light worked." Members' 3-month commitment + monthly fee means high LTV; Restore HQ has no incentive to build this in-house.

### Other chains

- **Aviv Clinics** (The Villages, FL — Israeli import) — premium clinical program, ~3-month, **$45k–$50k** all-inclusive (cognitive + HBOT 60 sessions + nutrition + neuro). Very different segment (post-50 affluent, clinical positioning). Not a Wellcore competitor; potential white-glove referral relationship.
- **Hyperbaric Centers of America**, **R3 Medical**, **Hyperbaric Medical Solutions** (NY/FL) — regional clinical, focused on FDA-indication patients (wound care, decompression sickness).
- **Independent integrative-medicine clinics** — thousands; cash-pay $100–$300/session range.

### Cash-pay pricing summary

| Tier | Range | Examples |
|---|---|---|
| Wellness chain (mHBOT 1.3) | $58–$125/session | Restore, iCRYO |
| Independent integrative | $100–$200 | Functional medicine clinics |
| Clinical hard chamber (cash) | $200–$400 | Hyperbaric Medical Solutions |
| Premium clinical program | $500–$800/session inside $40–50k packages | Aviv |

---

## 3. Demographics & psychographics

### Biohackers
Audience is the Joe Rogan / Andrew Huberman / Peter Attia / Tim Ferriss / Dr. Mark Hyman listenership. Already running stacks of: Levels (CGM), Function Health (annual blood panel), Lifeforce, Whoop, Oura, Eight Sleep, AG1, NAD+ infusions, methylene blue (Troscriptions). HBOT is moving from "fringe" to "stack-worthy" — Dr. Scott Sherr (Troscriptions COO, host of *Smarter Not Harder*) is the loudest HBOT-specific advocate in this audience. Dr. Jason Sonners (HBOT USA) is the #2 voice. **Mel Gibson on Joe Rogan** and **Justin Wren on JRE** both publicly endorsed HBOT for brain recovery — these clips circulate constantly on X/IG.

### Long COVID community
- CDC 2024: **~17M US adults** report Long COVID symptoms.
- Active online: r/covidlonghaulers (~70k+), r/longcovid, Survivor Corps (Diana Berrent's FB group, ~150k members), Patient-Led Research Collaborative.
- HBOT has **growing prospective-registry evidence** (medRxiv 2024 — 232 patients, 65% clinically relevant QoL improvement; published peer-reviewed RCT in *Scientific Reports* 2024). Adoption barriers: insurance doesn't cover, awareness gap. **High-intent segment** for both home chambers and an app like Wellcore.

### Athletes
- Pro: LeBron James, Cristiano Ronaldo, Joe Namath (TBI advocacy), Justin Wren (UFC), various NFL.
- Amateur: CrossFit, ultrarunners (UTMB, Western States cohort), MMA gyms.
- Endorsement TAM: well-developed; HBOT is normalizing.

### Affluent aging
- Income $200k+, age 40–65. Already buying Function Health ($499/yr), Lifeforce ($349 first month then $129/mo), BluePrint kits, Tally Health.
- Anti-aging clinic clientele in NYC, Miami, LA, Austin.
- Will pay for premium tiers if positioned as longevity infrastructure.

### Sports parents / TBI-concerned
- Youth football (~1M players annually) and soccer concussion concern is mainstream after the 2023+ flag-football pivot debates.
- Parents research HBOT for post-concussion syndrome despite weak FDA position. Wellcore should be **deliberately conservative** here — this is FTC/FDA scrutiny territory.

---

## 4. Distribution & marketing channels

### Podcast landscape (HBOT-adjacent)

| Show | Audience size estimate | HBOT relevance |
|---|---|---|
| Joe Rogan Experience | 200M+ monthly downloads (Spotify exclusive, est.) | Repeated HBOT mentions, Mel Gibson + Justin Wren clips |
| Huberman Lab | ~100M monthly | Brain-health framing; HBOT discussed but not flagship |
| Smarter Not Harder (Sherr/Achacoso) | Niche but **HBOT-specific** | Dedicated episodes; ideal sponsorship target |
| Peter Attia Drive | High biohacker-affluent overlap | Longevity framing |
| Realfoodology | Moderate; covered Sherr on HBOT/methylene blue | Wellness mom audience |
| Dr. Mark Hyman (Doctor's Farmacy) | Large functional-medicine | Adjacent |
| Tim Ferriss | Large; longevity-curious | Adjacent |
| Rich Roll | Endurance audience | Adjacent |

CPM in biohacker podcast space: **$25–$60 CPM** for read sponsorships (industry estimate; Podcast One / Libsyn rates). Niche shows like *Smarter Not Harder* will trade flat-rate sponsorship $1–3k/episode for product-aligned advertisers.

### Influencer landscape
- **Dr. Scott Sherr** — most HBOT-credible influencer in the biohacker space.
- **Dr. Jason Sonners** (HBOT USA, IG @drjasonsonners) — chiropractor-physiologist-HBOT educator.
- **Dr. Mark Hyman** — functional medicine titan; HBOT-friendly.
- **Ben Greenfield** — biohacker podcast/blog; consistent HBOT coverage.
- **Dave Asprey** — Bulletproof; built mainstream bridge to HBOT.
- **Gary Brecka (10X Health)** — Joe Rogan's pre-fight protocol; HBOT advocate.
- **Andrew Huberman** — does NOT specifically endorse HBOT often; mention adjacent.

### Communities
- Reddit: **r/HBOT (~10k)**, r/Biohackers (~600k), r/longhaulers (~70k), r/Nootropics (~470k).
- Facebook: Hyperbaric Oxygen Therapy Support Group (~30k+), Dive-tank used market groups.
- Discord: smaller; the biohacker community is migrating off Discord toward private Circle/Skool stacks (Sherr's HOMeHOPe, Asprey's Upgrade Collective).

### Conferences
- **Health Optimization Summit** (US debut 2025, recurring) — top biohacker B2C/B2B convergence; iCRYO×OxyHealth booth proves HBOT belongs.
- **A4M (American Academy of Anti-Aging Medicine)** — Las Vegas, ~5k integrative MDs.
- **IHMC** — clinical hyperbaric, smaller.
- **Biohacker Summit** (Helsinki/US satellite).
- **UHMS Annual** — Undersea & Hyperbaric Medical Society, clinical-medical, less Wellcore-fit.

---

## 5. Insurance, HSA, FSA

### Medicare / private
Medicare covers HBOT for the **14 FDA-cleared indications** only (decompression, gas embolism, CO poisoning, gas gangrene, crush injury, acute traumatic ischemia, severe anemia, intracranial abscess, necrotizing infections, osteomyelitis, radiation-induced injury, compromised skin grafts, thermal burns, idiopathic sudden sensorineural hearing loss). Private insurance largely follows. **Wellness/biohacker use is 100% out-of-pocket.**

### HSA/FSA — opportunity for Wellcore feature
This is a real opportunity. Per IRS Section 213(d), wellness products/services can qualify for HSA/FSA reimbursement if backed by a **Letter of Medical Necessity (LMN)** from a licensed clinician. **Truemed** is the platform standard — they partner with Thorne, AG1, Eight Sleep, Daily Harvest, and dozens of wellness brands; ~30% effective discount for users.

**Recommendation:** integrate Truemed at checkout for Premium subscription. Marketing copy: "Eligible for HSA/FSA with LMN (powered by Truemed)." This is a powerful conversion lever for the affluent-aging and biohacker segments who are HSA-maxxers.

### LMN workflow
Wellcore could go further: build a **chamber-rental LMN concierge**. User answers a brief intake, Truemed-network clinician issues an LMN, user submits to their HSA/FSA admin and offsets the $5–25k chamber purchase or session bundles. This is a defensible feature moat and a clean revenue share with Truemed. Deferred for v1.1 — but design the data model now.

---

## 6. US regulatory deep-dive

### FDA enforcement 2023–2026
- **August 25, 2025:** FDA issued a **Letter to Health Care Providers** following multiple HBOT chamber **fires, injuries, and fatalities** (notably the 2025 Michigan pediatric fatality at "Oxford Center"). Letter emphasizes fire prevention, grounding, fabric/clothing rules, staff training. (FDA.gov + UHMS announcement + RT Magazine + Powers Health 2025-08-27.)
- The 2025 letter is the **single most important regulatory development for the home/wellness HBOT category** — expect heightened state-level scrutiny on home chamber sellers and clinics over 2026.
- No major class-action wave yet, but lawyers are circling. *AMA / UHMS / FDA jointly cautioned that mild HBOT can be unsafe when operated outside FDA-cleared parameters* (UHMS 2025).

### FTC actions on wellness claims
- No FTC action HBOT-specific in 2024–2026 search hits.
- **General climate:** FTC continues aggressive substantiation enforcement on wellness claims (Health Products Compliance Guidance, MoFo + ArentFox 2026 reviews). The Mintz piece (Jul 2025) confirms FDA can cite intended-use evidence even when copy stays "wellness only."
- **Implication:** Wellcore must avoid anything that looks like a disease claim. Long COVID, PTSD, TBI, autism — talk only in *user goal* / *user-reported* language. No "HBOT treats X."

### State-specific
- **Florida:** home of Aviv; relatively HBOT-friendly regulatory environment.
- **California:** strictest privacy regime (CCPA/CPRA + Healthline $1.55M settlement Jul 2025); also home of Restore-area density. Wellness claims regulated similarly to FTC standard.
- **Texas:** Restore HQ; lighter consumer-protection regime.
- **New York:** active AG on consumer-facing wellness claims; tighter copy review needed.
- **Washington:** **My Health My Data Act (MHMDA)** in effect — very expansive definition of "consumer health data," requires opt-in consent. **Maryland MODPA** (Oct 2025) similar.

### Class-action landscape
Pattern to avoid: any auto-renewal trap (consult CARS rule from FTC). Subscription cancellation must be **as easy as signup** — implement fully in-app, no phone-call wall. Arbitration + class-action waiver in ToS is standard. Do not promise specific outcomes.

---

## 7. Competitive landscape (US lens)

### HBOT-specific apps
- **HBOT Companion** (Mobixed LLC) — iOS + Android. Features: schedule, reminders, AI chatbot for HBOT info. Thin UX, low review volume, no recent press traction. Wellcore can ship better v1 immediately.
- **Hyperbaric.app** — clinic-finder/directory + blog (web-first, SEO play). Not a session tracker. Useful as a reference but different value prop.
- **Deepaura, OneBase** (per prior research) — mostly meditation/breathwork-adjacent, not HBOT-native. Marginal US presence.

### Biohacker apps (pricing benchmarks)

| Product | Price | Model |
|---|---|---|
| Whoop 4.0 | $30/mo (or $239/yr) | Hardware + sub bundled |
| Oura Ring | Ring $299–$549 + $5.99/mo membership | Hardware + sub |
| Eight Sleep Pod | $2k–$5k mattress + $19/mo Autopilot | Hardware + sub |
| Levels CGM | ~$199/mo (CGM + app) | Hardware-as-a-service |
| Function Health | $499/yr | Lab subscription |
| Lifeforce | $349 first month → $129/mo | Lab + concierge |
| BluePrint (Bryan Johnson) | One-off kits $300–$1500 | Stack box |
| AG1 (Athletic Greens) | $79–$99/mo | Subscription consumable |
| Lumen | $249 device + $19/mo | Hardware + sub |

**Wellcore is software-only.** Its anchor is closer to **Oura ($5.99/mo)** than to Whoop ($30/mo). Premium SaaS without hardware caps at ~$10/mo for this audience without tangible feature parity.

### Wellness companions
- Whoop / Oura / Eight Sleep are *the* mental anchors users compare against. Wellcore should not try to outprice them on the high end; should differentiate on HBOT-specific protocols + 9 wellness goals + check-ins.

---

## 8. Pricing recommendation

### Benchmark table
- Hardware-bundled wellness sub: $5.99–$30/mo
- Software-only wellness companion (no hardware): $5–$15/mo typical
- Annual discount norm: 30–45%
- Lifetime offer norm: 15–25× monthly (so $9.99/mo → $179–$249 lifetime)

### Recommended tier structure (v1)

| Tier | Price | Includes |
|---|---|---|
| **Free** | $0 | Session timer, chamber profile, basic log, manual notes, 1 active wellness goal |
| **Premium** | **$8.99/mo** or **$59/yr** (45% off) | All 9 goals, structured check-ins, protocol templates, contraindications screener, ATA/duration tracking, trend charts, export PDF, HSA/FSA via Truemed |
| **Premium Lifetime** | **$199** one-time (limited launch) | Everything Premium + early-adopter badge + lifetime updates |

Family plan: defer to v1.5. The biohacker audience is largely individual purchase intent.

### Why $8.99/$59
- Beats Oura ($5.99) on perceived feature density without crossing Whoop ($30).
- Yearly ($59) lands at a **psychologically sticky sub-$5/mo effective rate**.
- $199 lifetime aligns with biohacker price psychology (Bryan Johnson's BluePrint kits, single-payment courses).
- Premium price moves easily to $9.99/$79/$249 in v1.5 once retention is proved.

---

## 9. Acquisition strategy

### Top channels ranked by efficiency

1. **HBOT-specific influencer + podcast sponsorship** (Dr. Scott Sherr / *Smarter Not Harder* / Dr. Jason Sonners). High intent, niche, ~$1–3k/episode flat. Best CAC at launch.
2. **Chamber manufacturer co-marketing** (OxyHealth, Summit to Sea, Newtowne, Oxygen Health Systems). Land 1–2 dealer partners; QR-code in box → free 90-day Premium. High LTV, near-zero CAC.
3. **Restore Hyper Wellness pilot partnership.** Pitch "Wellcore for Restore members" — single studio test, even revenue-share. 210 studios is a long-term moat.
4. **Reddit organic + community** (r/HBOT, r/Biohackers, r/longhaulers). Founder-led posts only; do not spam. Build "Wellcore HBOT protocol pack" downloadable.
5. **ASO on US App Store** — primary keywords below.
6. **Long COVID community partnerships** — Survivor Corps, Patient-Led Research Collaborative. Sensitive, must avoid disease claims; offer free Premium for verified members.
7. **Conferences** — sponsor a small booth at Health Optimization Summit 2026 (US edition). Best B2C × B2B converge.

### ASO keyword strategy (US App Store)

Primary (high intent, low competition): `home hyperbaric`, `HBOT tracker`, `oxygen therapy log`, `hyperbaric session timer`, `mHBOT`.

Secondary (broader): `hyperbaric oxygen`, `biohacking`, `longevity tracker`, `wellness companion`, `recovery tracker`.

Long-tail content: `hyperbaric chamber protocol`, `1.3 ATA`, `soft chamber log`.

Estimate (Sensor Tower band, no exact data): primary terms have **<100 daily US searches** combined — small but extremely qualified.

### Sample influencer / podcast launch list

- Dr. Scott Sherr (Smarter Not Harder, Troscriptions) — top priority.
- Dr. Jason Sonners (HBOT USA) — direct DM via IG.
- Ben Greenfield Life — podcast read.
- Realfoodology (Courtney Swan) — HBOT-friendly, mom-biohacker overlap.
- Health Optimization Summit / Tim Gray — conference sponsorship + podcast.
- Niche YouTube creators: Hyperbaric Oxygen Therapy USA, OxygenArk, Morelli Medical reviews.

---

## 10. Founder logistics

### App Store US developer account
Sencer can ship to the **US storefront from a Turkish Apple Developer account today** — Apple does not gate storefront access by developer nationality. App Store Connect handles VAT/sales-tax collection and remittance globally. No US LLC required to publish.

### Tax / entity structure
- **v1 (now):** ship under sole-proprietor / Turkish entity. Apple withholds and remits US sales tax where applicable.
- **v1.1 (when raising or ARR > ~$100k or US payroll):** form a **Delaware C-corp** (Stripe Atlas, ~$500). Required for US VC. Consider Wyoming LLC if bootstrapping and need a US bank account but no equity raise.
- Stripe (web flow): Stripe handles tax via Stripe Tax. Treat as table stakes if Wellcore ever sells outside the App Store.

### Privacy: HIPAA, CCPA, state laws
- **HIPAA: NOT applicable.** Wellcore is not a covered entity (not a healthcare provider, not a health plan, not a clearinghouse) and is not a Business Associate as long as it doesn't contract with one. User-entered self-data is not PHI under HIPAA.
- **CCPA / CPRA (CA):** Applies once Wellcore has CA users *and* hits revenue threshold ($26.6M, 100k+ CA consumers, or 50%+ from selling/sharing data). Wellcore at v1 is below threshold but **should still adopt CCPA-style privacy notice** (it's the de-facto US standard).
- **Washington MHMDA + Maryland MODPA + Connecticut DPDPA + Virginia VCDPA + Colorado CPA:** All apply consumer-health-data rules to wellness apps. **Operational requirement: opt-in consent, deletion, no selling, clear privacy notice.**
- **California Healthline settlement ($1.55M, Jul 2025)** is the cautionary tale — the AG hit them on *purpose limitation* for sharing health-adjacent data with ad networks. **Do not embed Meta Pixel / Google Analytics 4 without consent.** Use server-side, privacy-respecting analytics (PostHog self-hosted, Plausible).
- Founder privacy policy template: Termly or iubenda CCPA + MHMDA + GDPR generator, ~$10–20/mo.

### ToS / arbitration / liability
- Standard US clickwrap with **arbitration + class-action waiver + Delaware choice of law** (industry standard once a Delaware C-corp exists; until then, can use Turkey as choice of law but US users will bristle).
- **Liability disclaimer:** wellness/educational only, not medical advice, consult physician, contraindications acknowledgment.
- **No medical claims** — state explicitly: "Wellcore does not treat, diagnose, cure, or prevent any disease."
- Liability insurance: not strictly needed at v1, but a **$1M general + tech E&O policy ($800–$1500/yr)** is prudent once revenue passes $50k/yr.

---

## 11. Localization

### EN as primary
Core app and marketing ship in **US English** — note this is meaningfully different from UK English / Turkish-translated EN. Use US idiom (e.g., "schedule," not "diary"; "soccer" in concussion contexts; "$" not "USD"). Consider a copy editor pass by a native US writer.

### TR fate
**Recommendation: keep Turkish strings in the i18n table but drop TR from active marketing.** Cost to maintain Turkish translations is near-zero if already done; resurrects optionality for diaspora/secondary market. Do **not** show TR on App Store screenshots or landing page.

### Spanish opportunity
US Hispanic wellness market is large (~62M Hispanic Americans, ~$2.5T spending power). But the home-HBOT segment skews white-affluent today. **Defer Spanish to v1.5** unless a partner (e.g., Hispanic-focused influencer) emerges first.

### US English copy notes
- Avoid clinical/European register ("therapy session" → "session" or "dive"; "patient" → "user" or "member").
- HBOT users self-call sessions "**dives**" (carryover from diving medicine). Wellcore should embrace this.
- Use "hyperbaric" not "HBOT" in App Store title (search volume + clarity).

---

## 12. SWOT

### Strengths
- Founder shipping velocity (solo, full-stack, RN+Hono).
- Clean room — no dominant HBOT companion app.
- 9-goal framework is more sophisticated than HBOT Companion's chatbot UX.
- Already-researched clinical/contraindications layer (07-ptsd-tbi-anxiety).

### Weaknesses
- Solo founder, Turkey-based — slower US ground feedback.
- No HBOT clinical co-founder / advisor — credibility gap vs. apps backed by an MD.
- No hardware lock-in — pure software is replaceable.
- US payments / privacy ops to set up.

### Opportunities
- Restore Hyper Wellness partnership (210 studios, no companion app).
- Chamber-manufacturer co-marketing bundle.
- HSA/FSA via Truemed integration.
- Long COVID segment underserved by tech.
- Biohacker mainstreaming of HBOT (2025 iCRYO×OxyHealth, FOMO from JRE/Mel Gibson clips).
- 17M Long COVID adults — even 0.1% conversion is 17k users.

### Threats
- FDA enforcement post-2025 letter could chill home-chamber category.
- FTC wellness-claims enforcement intensifying.
- Restore could build companion in-house (low probability — not their core).
- Soft-chamber efficacy debate (UHMS skepticism) could go mainstream and hurt adoption.
- A well-funded entrant (e.g., Whoop adds HBOT mode, or a Truemed-funded vertical app).
- State privacy regimes (especially WA MHMDA) require careful engineering.

---

## References (URLs)

### Market size & chambers
- Precedence Research, HBOT Market: https://www.precedenceresearch.com/hyperbaric-oxygen-therapy-market
- Future Market Insights, HBOT Devices: https://www.futuremarketinsights.com/reports/hyperbaric-oxygen-therapy-devices-market
- Data Bridge Market Research, Global HBOT: https://www.databridgemarketresearch.com/reports/global-hyperbaric-oxygen-therapy-hbot-market
- OxyHealth Vitaeris 320 (mfr): https://www.oxyhealth.com/products/vitaeris-320
- Heal Body Wellness, Vitaeris 320 retailer pricing: https://www.healbodywellness.com/products/oxyhealth-vitaeris-320%C2%AE-hyperbaric-chamber

### Restore & clinics
- Restore Hyper Wellness memberships: https://www.restore.com/memberships
- Restore mHBOT page: https://www.restore.com/services/mild-hyperbaric-oxygen-therapy
- General Atlantic invests $140M in Restore: https://www.generalatlantic.com/media-article/restore-hyper-wellness-secures-140-million-investment-led-by-general-atlantic-to-accelerate-growth-and-innovation/
- Paul Weiss deal note: https://www.paulweiss.com/practices/transactional/private-equity/news/general-atlantic-invests-in-restore-hyper-wellness?id=41952
- Tracxn Restore profile/funding: https://tracxn.com/d/companies/restore-hyper-wellness/__mQHQXMGInqGU0F8QarZIgrUDodsSWJQ1dLrIakB9BSk
- Aviv Clinics: https://aviv-clinics.com/
- Aviv pricing context: https://impactwealth.org/aviv-clinic-a-regenerative-respite-for-self-improvement/

### Regulatory
- FDA Letter to Healthcare Providers (Aug 2025): https://www.fda.gov/medical-devices/letters-health-care-providers/follow-instructions-safe-use-hyperbaric-oxygen-therapy-devices-letter-health-care-providers
- UHMS announcement: https://www.uhms.org/resources/news-announcements/1594-fda-safety-communication-follow-instructions-for-safe-use-of-hyperbaric-oxygen-therapy-devices.html
- RT Magazine — fire risks: https://respiratory-therapy.com/products-treatment/monitoring-treatment/therapy-devices/fda-warns-of-fire-risks-tied-to-hyperbaric-oxygen-therapy/
- FTC Health Claims topic page: https://www.ftc.gov/news-events/topics/truth-advertising/health-claims
- MoFo, FTC Health Products Compliance: https://lifesciences.mofo.com/topics/ftc-issues-updated-health-products-claims-guidance
- ArentFox Schiff, 2026 advertising compliance: https://www.afslaw.com/perspectives/the-fine-print/advertising-law-compliance-2026-five-developments-every-advertiser

### Privacy & HSA/FSA
- IRS, medical expenses FAQ (wellness): https://www.irs.gov/individuals/frequently-asked-questions-about-medical-expenses-related-to-nutrition-wellness-and-general-health
- Truemed LMN basics: https://help.truemed.com/letters-of-medical-necessity-lm-ns/lmn-basics/what-is-an-lmn
- Truemed partner program: https://www.truemed.com/partners
- CCPA AG page: https://oag.ca.gov/privacy/ccpa
- Healthline $1.55M CCPA settlement (CDF): https://www.cdflaborlaw.com/blog/california-ag-reaches-landmark-1.55-million-ccpa-settlement-with-healthline-over-alleged-privacy-violations
- Hintze, Maryland MODPA + CCPA enforcement: https://hintzelaw.com/blog/2025/7/9/californias-healthlinecom-enforcement-action-shows-ccpas-teeth-and-sensitive-data-reach
- Clark Hill, beyond HIPAA state laws: https://www.clarkhill.com/news-events/news/beyond-hipaa-how-state-laws-are-reshaping-health-data-compliance/

### Long COVID & influencers
- medRxiv Long COVID HBOT registry (2024, 232 patients): https://www.medrxiv.org/content/10.1101/2024.09.02.24312948v1
- Scientific Reports RCT long-term follow-up: https://www.nature.com/articles/s41598-024-53091-3
- Scientific Reports Long COVID registry 2025: https://www.nature.com/articles/s41598-025-11539-0
- Dr. Scott Sherr profile: https://troscriptions.com/pages/team/dr-scott-sherr
- Smarter Not Harder podcast: https://troscriptions.com/blogs/podcast
- Smarter Not Harder Apple Podcasts: https://podcasts.apple.com/sb/podcast/smarter-not-harder/id1663974629
- Joe Rogan / Justin Wren HBOT clip (HBOT News): https://hbotnews.org/joe-rogan-justin-wren-can-hyperbaric-therapy-reverse-brain-damage/

### Competitive apps
- HBOT Companion iOS: https://apps.apple.com/us/app/hbot-companion/id6744744772
- HBOT Companion Android: https://play.google.com/store/apps/details?id=com.mobixed.hbot
- Hyperbaric.app directory: https://hyperbaric.app/
- Function Health vs Lifeforce vs InsideTracker (Fin vs Fin): https://finvsfin.com/function-health-vs-superpower-vs-insidetracker-vs-lifeforce/
- Lifeforce review (Garage Gym Reviews): https://www.garagegymreviews.com/life-force-review

---

*End of research. Estimates flagged inline. Treat manufacturer/aggregator numbers with appropriate skepticism; treat FDA, FTC, AG settlement, and SEC/PR figures as primary.*
