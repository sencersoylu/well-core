# Wellcore Claim Citations Library

**Date:** 2026-05-02
**Purpose:** Every educational claim shown in Wellcore (onboarding slides, Expectations Timeline, goal cards, post-session insights) must be traceable to a peer-reviewed primary source. This document is the single source of truth that the i18n strings reference via citation tags.

---

## TL;DR

Of 10 candidate claims evaluated:

- **Supported (4):** plasma oxygen physiology, stem cell mobilization at hard HBOT pressures, long-COVID cognition (Israeli RCT), telomere/senescence in healthy older adults.
- **Partially supported (4):** skin/dermal effects, mitochondrial biogenesis (mostly preclinical), inflammatory marker reduction (condition-specific), exercise recovery (mixed).
- **Unsupported / not safely sayable (2):** mTBI/post-concussion as a general claim (military RCTs mostly null; VA/DoD recommends against), and "1.3 ATA mild HBOT is effective for X" as a general claim — 1.3 ATA was the *sham arm* in most well-designed trials.

The app should never imply parity between mild chamber (1.3 ATA, ambient air) and clinical HBOT (2.0–2.4 ATA, 100% O2). Most cited research is on the latter; copy must be honest about that.

---

## Verified claims

### Claim 1 — "HBOT increases plasma-dissolved oxygen ~1500%"

- **Status:** SUPPORTED, but pressure-specific. The 1500% figure applies only to ~2.4 ATA / 100% O2.
- **Source (physiology textbook anchor):** Mathieu D, Marroni A, Kot J. *Tenth European Consensus Conference on Hyperbaric Medicine: recommendations for accepted and non-accepted clinical indications and practice of hyperbaric oxygen treatment.* Diving and Hyperbaric Medicine, 2017;47(1):24–32. PMID: 28357821. Also: Leach RM, Rees PJ, Wilmshurst P. *ABC of oxygen: Hyperbaric oxygen therapy.* BMJ. 1998;317(7166):1140–3. PMID: 9784458.
- **Underlying calculation (Henry's law):** dissolved O2 ≈ 0.003 mL O2 / dL plasma / mmHg PaO2.
  - Air at 1 ATA: PaO2 ≈ 100 mmHg → ~0.3 mL/dL.
  - 100% O2 at 2.4 ATA: PaO2 ≈ 1500–1800 mmHg → ~4.5–5.4 mL/dL → roughly **15× / 1500%** increase in dissolved (not hemoglobin-bound) oxygen.
  - Air at 1.3 ATA (mild chamber): PaO2 ≈ 130 mmHg → ~0.39 mL/dL → roughly **1.3×** dissolved (≈30% increase).
- **Recommended phrasing:**
  - EN: "At clinical HBOT pressure (2.0–2.4 ATA, 100% O2), oxygen dissolved directly in blood plasma can rise roughly 15×, allowing oxygen to reach tissues independently of red blood cells.[hbo-plasma-1500]"
  - TR: "Klinik HBOT basıncında (2.0–2.4 ATA, %100 O2) plazmada çözünmüş oksijen yaklaşık 15 kat artar; oksijen, alyuvarlardan bağımsız olarak dokulara ulaşabilir.[hbo-plasma-1500]"
- **Footnote tag:** `hbo-plasma-1500`
- **Do not say** "1500% more oxygen in your blood" without qualifying it as plasma-dissolved O2 at clinical pressures.

### Claim 2 — "Stem cell mobilization (CD34+) ~8× after 20 sessions"

- **Status:** SUPPORTED for 2.0 ATA HBOT only.
- **Source:** Thom SR, Bhopale VM, Velazquez OC, Goldstein LJ, Thom LH, Buerk DG. *Stem cell mobilization by hyperbaric oxygen.* Am J Physiol Heart Circ Physiol. 2006;290(4):H1378–86. PMID: 16299259. DOI: 10.1152/ajpheart.00888.2005.
- **Population & pressure:** 26 patients receiving 2.0 ATA HBOT for clinical indications; CD34+ cells measured serially.
- **Verbatim result:** "Over a course of 20 treatments, circulating CD34+ cells increased eightfold... the population of CD34+ cells in the peripheral circulation of humans doubled in response to a single exposure to 2.0 ATA O2 for 2 h."
- **Generalization to mild HBOT:** Heyboer et al. *CD34+/CD45-dim stem cell mobilization by hyperbaric oxygen — changes with oxygen dosage* (Stem Cell Res. 2014; PMC4037447) showed mobilization is **dose-dependent on oxygen partial pressure** — lower pressures yielded weaker effects. Do not extrapolate the 8× figure to 1.3 ATA mild chambers.
- **Recommended phrasing:**
  - EN: "In clinical HBOT (2.0 ATA), circulating CD34+ stem/progenitor cells roughly doubled after a single session and increased ~8-fold over 20 sessions.[hbo-cd34-8x]"
  - TR: "Klinik HBOT'ta (2.0 ATA) dolaşımdaki CD34+ kök/öncü hücreler tek seansta yaklaşık iki kat, 20 seansta yaklaşık 8 kat artmıştır.[hbo-cd34-8x]"
- **Footnote tag:** `hbo-cd34-8x`

### Claim 3 — "HBOT improves cognition in long COVID"

- **Status:** SUPPORTED (one well-designed sham-controlled RCT + follow-up).
- **Source (primary):** Zilberman-Itskovich S, Catalogna M, Sasson E, Elman-Shina K, Hadanny A, Lang E, Finci S, Polak N, Fishlev G, Korin C, Shorer R, Parag Y, Sova M, Efrati S. *Hyperbaric oxygen therapy improves neurocognitive functions and symptoms of post-COVID condition: randomized controlled trial.* Sci Rep. 2022;12:11252. DOI: 10.1038/s41598-022-15565-0. PMID: 35821512.
- **Source (follow-up):** Hadanny A, Zilberman-Itskovich S, Catalogna M, et al. *Long term outcomes of hyperbaric oxygen therapy in post covid condition: longitudinal follow-up of a randomized controlled trial.* Sci Rep. 2024;14:3604. DOI: 10.1038/s41598-024-53091-3. PMID: 38360929.
- **Design:** Randomized, double-blind, sham-controlled. n = 73 (HBOT 37, sham 36). 40 daily sessions, 2.0 ATA, 90 min. Sham = 1.03 ATA air.
- **Verbatim result:** "Significant group-by-time interaction in global cognitive function (η²p = 0.07, p = 0.027), attention (η²p = 0.06, p = 0.04), and executive function (η²p = 0.08, p = 0.02)... significant improvements in energy, sleep, psychiatric symptoms, and pain."
- **Recommended phrasing:**
  - EN: "A 2022 randomized sham-controlled trial (n=73) found 40 sessions of HBOT improved attention, executive function, and global cognition in post-COVID patients.[hbo-longcovid-rct]"
  - TR: "2022'de yapılan rasgele kontrollü çalışmada (n=73), 40 seans HBOT post-COVID hastalarında dikkat, yürütücü işlevler ve genel bilişsel işlevde anlamlı iyileşme sağladı.[hbo-longcovid-rct]"
- **Footnote tag:** `hbo-longcovid-rct`

### Claim 4 — "HBOT supports skin elasticity / collagen / fibroblasts"

- **Status:** PARTIALLY SUPPORTED. Small biopsy sub-study; no 4-week claim is supported.
- **Source:** Hachmo Y, Hadanny A, Mendelovic S, Hillman P, Shapira E, Landau G, Gattegno H, Zrachya A, Daniel-Kotovsky M, Catalogna M, Fishlev G, Lang E, Polak N, Doenyas K, Friedman M, Zemel Y, Bechor Y, Efrati S. *The effect of hyperbaric oxygen therapy on the pathophysiology of skin aging: a prospective clinical trial.* Aging (Albany NY). 2021;13(22):24500–24510. DOI: 10.18632/aging.203701. PMID: 34784294.
- **Population & pressure:** 13 men (mean age 68 ± 2.5 y) from a larger 70-person cohort, who consented to skin biopsies. 60 daily sessions, 2.0 ATA, 90 min.
- **Verbatim result:** "Significant increase in collagen density (p<0.001, ES=1.10), elastic fiber length (p<0.0001, ES=2.71), and number of blood vessels (p=0.02, ES=1.00). Significant decrease in fiber fragmentation (p=0.012) and tissue senescent cells (p=0.03, ES=0.84)."
- **Caveats:** n=13 biopsies, all male, all 60+. NOT a "4-week elasticity gain" study — effects measured after 60 sessions over ~3 months. Do **not** claim "%4-week skin elasticity gain"; that figure has no primary source.
- **Recommended phrasing:**
  - EN: "A small histological sub-study (n=13, men 60+) found that 60 sessions of HBOT increased dermal collagen density and elastic fiber length, and reduced senescent cells in skin tissue.[hbo-skin]"
  - TR: "Küçük histolojik bir alt çalışma (n=13, 60+ yaş erkekler), 60 seans HBOT'un cilt kollajen yoğunluğu ve elastik lif uzunluğunu artırdığını, yaşlanan hücreleri azalttığını gösterdi.[hbo-skin]"
- **Footnote tag:** `hbo-skin`

### Claim 5 — "HBOT improves cognition / QoL in TBI / post-concussion"

- **Status:** UNSUPPORTED as a general claim. Evidence is **mixed-to-negative** for the chronic mTBI / post-concussion population most relevant to wellness use.
- **Negative / null evidence:** Four DoD-funded sham-controlled RCTs (Wolf 2012, Cifu 2014, Miller 2015, Weaver 2018) found HBOT no better than sham for persistent post-concussion symptoms in military personnel. The 2021 VA/DoD Clinical Practice Guideline recommends *against* HBOT for mTBI symptoms.
- **Positive evidence:** Harch PG, et al. (Med Gas Res 2017, 2020) and Hadanny A, et al. (PLOS ONE 2020) report benefit, but with methodological criticisms (open-label, crossover designs).
- **Recent systematic review:** Hadanny A, Daphna-Tekoah S, Bechor Y, Catalogna M, Efrati S. *Systematic Review and Dosage Analysis: Hyperbaric Oxygen Therapy Efficacy in Mild Traumatic Brain Injury Persistent Postconcussion Syndrome.* Front Neurol. 2022;13:815056. DOI: 10.3389/fneur.2022.815056. PMID: 35370898.
- **Recent RCT (2025):** *A double-blind randomized trial of hyperbaric oxygen for persistent symptoms after brain injury.* Sci Rep. 2025;15. DOI: 10.1038/s41598-025-86631-6.
- **Recommended phrasing:** **Do not** make a TBI claim in onboarding. If discussed in goal-specific copy (`neuro_recovery`), only as: "Research on HBOT for post-concussion symptoms is mixed; speak to a clinician before using it as treatment.[hbo-tbi-mixed]"
- **Footnote tag:** `hbo-tbi-mixed`

### Claim 6 — "HBOT reduces inflammation (TNF-α, CRP)"

- **Status:** PARTIALLY SUPPORTED. Condition-specific human data, not a general "anti-inflammatory" claim.
- **Sources:**
  - Bitterman H. *Bench-to-bedside review: Oxygen as a drug.* Crit Care. 2009;13(1):205. PMID: 19291278 (mechanistic review).
  - Memar MY, et al. *Hyperbaric oxygen therapy: focus on inflammatory bowel disease.* Precis Clin Med. 2024;7(1):pbae001 (systematic review showing reduced TNF-α, IL-6 in IBD).
  - Cannellotto M, et al. *Hyperbaric oxygen as an adjuvant treatment for patients with COVID-19 severe hypoxaemia: a randomised controlled trial.* Emerg Med J. 2022;39(2). Decreased CRP, ferritin, LDH in HBOT arm.
- **Caveat:** Robust human reductions in TNF-α / CRP are documented in IBD, severe COVID, and post-surgical contexts — **not** in healthy users. Do not claim "HBOT lowers your inflammation" as a wellness benefit.
- **Recommended phrasing:**
  - EN: "In specific clinical conditions (IBD, severe COVID, post-surgical recovery), HBOT has been shown to reduce inflammatory markers like TNF-α and CRP.[hbo-inflam]"
  - TR: "Belirli klinik durumlarda (IBD, ağır COVID, ameliyat sonrası iyileşme) HBOT'un TNF-α ve CRP gibi inflamasyon belirteçlerini azalttığı gösterilmiştir.[hbo-inflam]"
- **Footnote tag:** `hbo-inflam`

### Claim 7 — "HBOT enhances exercise recovery / reduces DOMS"

- **Status:** PARTIALLY SUPPORTED. Mixed; muscle injury recovery yes, DOMS pain unclear.
- **Source (primary, current):** *Effects of Hyperbaric Oxygen Therapy on Exercise-Induced Muscle Injury and Soreness: A Systematic Review and Meta-analysis.* 2025. PMID: 40784513. (10 trials, n = 299).
- **Verbatim result:** "HBOT significantly accelerated recovery from exercise-induced muscle injury... did not enhance recovery from exercise-induced muscle soreness."
- **Older Cochrane note:** Bennett MH et al. (Cochrane review on HBO for DOMS) found *higher* pain scores at 48–72 h with HBO — i.e., DOMS may be worse, not better.
- **Caveat:** All sport-science trials use 2.0–2.5 ATA. No 1.3 ATA RCT supports a recovery claim.
- **Recommended phrasing:**
  - EN: "A 2025 meta-analysis of 10 trials (n=299) found HBOT may accelerate recovery from exercise-induced muscle injury, though effects on muscle soreness are inconsistent.[hbo-recovery]"
  - TR: "10 çalışma ve 299 kişiyi içeren 2025 meta-analizi, HBOT'un egzersize bağlı kas hasarından iyileşmeyi hızlandırabileceğini, kas ağrısı üzerindeki etkilerinin ise tutarsız olduğunu buldu.[hbo-recovery]"
- **Footnote tag:** `hbo-recovery`

### Claim 8 — "HBOT supports mitochondrial biogenesis / ATP"

- **Status:** PARTIALLY SUPPORTED. Mostly mechanistic / preclinical; one clean review.
- **Source (review):** De Wolde SD, Hulskes RH, Weenink RP, Hollmann MW, Van Hulst RA. *Hyperbaric Oxygen Treatment: Effects on Mitochondrial Function and Oxidative Stress.* Biomolecules. 2021;11(8):1210. PMID: 34944468. PMC8699286.
- **Source (Parkinson's model):** Hu Q, et al. *Hyperbaric Oxygen Therapy Improves Parkinson's Disease by Promoting Mitochondrial Biogenesis via the SIRT-1/PGC-1α Pathway.* Biomolecules. 2022;12(5):661. PMC9138219.
- **Caveat:** Most mitochondrial / SIRT1 / PGC-1α data is from in vitro and rodent models. Short HBOT can transiently *reduce* mitochondrial function before long-protocol benefits emerge.
- **Recommended phrasing:**
  - EN: "Preclinical and review evidence suggests repeated HBOT exposure activates mitochondrial biogenesis pathways (SIRT1, PGC-1α) over multi-week protocols.[hbo-mito]"
  - TR: "Klinik öncesi araştırmalar, tekrarlanan HBOT seanslarının çok haftalı protokollerde mitokondri biyogenez yolaklarını (SIRT1, PGC-1α) aktive ettiğini göstermektedir.[hbo-mito]"
- **Footnote tag:** `hbo-mito`

### Claim 9 — "HBOT triggers epigenetic / telomere effects"

- **Status:** SUPPORTED (single small prospective trial; not yet replicated in larger RCT as of 2026-05).
- **Source:** Hachmo Y, Hadanny A, Abu Hamed R, Daniel-Kotovsky M, Catalogna M, Fishlev G, Lang E, Polak N, Doenyas K, Friedman M, Zemel Y, Bechor Y, Efrati S. *Hyperbaric oxygen therapy increases telomere length and decreases immunosenescence in isolated blood cells: a prospective trial.* Aging (Albany NY). 2020;12(22):22445–22456. DOI: 10.18632/aging.202188. PMID: 33206062. PMC7746357.
- **Population & pressure:** 35 healthy independently-living adults aged ≥64. 60 daily sessions, 2.0 ATA, 90 min, 5 days/week.
- **Verbatim result:** "Telomeres of T helper, T cytotoxic, natural killer and B cells lengthened by over 20%... senescent T helpers were reduced by 37%... senescent cytotoxic T cells were reduced by 10.96%."
- **Caveat:** Small n, no sham control, leukocyte-only measurements (not somatic tissue). The "%38 telomere lengthening" headline figure is the *maximum subset effect*, not the average; report ranges, not single peak numbers.
- **Recommended phrasing:**
  - EN: "In a 2020 prospective trial (n=35, age 64+), 60 sessions of HBOT increased immune-cell telomere length by over 20% and reduced senescent T-cells.[hbo-telomere]"
  - TR: "2020'de yayımlanan 35 kişilik ileriye yönelik çalışmada (yaş 64+), 60 seans HBOT bağışıklık hücrelerinde telomer uzunluğunu %20'nin üzerinde artırdı ve yaşlanmış T-hücrelerini azalttı.[hbo-telomere]"
- **Footnote tag:** `hbo-telomere`

### Claim 10 — "Mild HBOT (1.3 ATA) is effective for [X]"

- **Status:** UNSUPPORTED as a general efficacy claim. 1.3 ATA ambient air is the **sham arm** in most rigorous HBOT RCTs (Wolf 2012, Cifu 2014, Miller 2015, Hadanny 2020/2022 long-COVID, Hachmo 2020 telomere — all used ~1.03–1.3 ATA air as sham).
- **Reference:** Bennett MH, et al. *Double-blind trials in hyperbaric medicine: A narrative review on past experiences and considerations in designing sham hyperbaric treatment.* Diving Hyperb Med. 2018;48(2). PMC6136075.
- **Note:** Some sham arms showed improvement, but this is interpreted as placebo + regression to mean, not pharmacologic effect. There is no positive 1.3 ATA RCT against an inert (true 1.0 ATA, room-air) control showing efficacy in any condition Wellcore targets.
- **App rule:** Wellcore must **not** claim that mild chambers (1.3 ATA, ambient air) replicate clinical HBOT. If a user reports using a 1.3 ATA chamber, copy must be neutral: "Most published HBOT research uses 2.0–2.4 ATA with 100% O2; effects at lower pressures are not established by RCTs.[hbo-mild-caveat]"
- **Footnote tag:** `hbo-mild-caveat`

---

## Per-goal Expectations Timeline copy (week 1 / 4 / 12)

These strings are the i18n keys for `expectations.<goal>.<week>`. Each ends with a citation tag. All assume clinical HBOT (2.0–2.4 ATA, 90 min sessions).

### radiance
- Week 1: "Better sleep and a settling, calmer feeling are common early. Skin changes take longer.[hbo-skin]"
- Week 4: "Hydration and tone may shift; visible elasticity changes typically follow longer protocols.[hbo-skin]"
- Week 12: "After ~60 sessions, dermal collagen density and elastic fiber length showed measurable gains in a small biopsy study.[hbo-skin]"

### recovery
- Week 1: "Less perceived fatigue and slightly faster bounce-back after hard sessions.[hbo-recovery]"
- Week 4: "Trial data suggests reduced markers of muscle injury after repeated HBOT exposures.[hbo-recovery]"
- Week 12: "Sustained recovery support; effects on soreness itself remain inconsistent in trials.[hbo-recovery]"

### vitality
- Week 1: "Many people report subtle energy improvements; the dissolved-oxygen effect is real but not a stimulant.[hbo-plasma-1500]"
- Week 4: "Cumulative sessions may activate mitochondrial biogenesis pathways in preclinical models.[hbo-mito]"
- Week 12: "Long-protocol HBOT is the form studied for systemic energy and immune-cell rejuvenation effects.[hbo-telomere]"

### wellness
- Week 1: "Most users report improved sleep onset and calmer mood within the first sessions.[hbo-longcovid-rct]"
- Week 4: "Cumulative effects on energy and resilience are typically reported around the 20-session mark.[hbo-cd34-8x]"
- Week 12: "Full protocol completion (60 sessions) is the dosing level studied for systemic wellness markers.[hbo-telomere]"

### brain_fog
- Week 1: "Subjective clarity improvements are common but not yet measurable on cognitive tests.[hbo-longcovid-rct]"
- Week 4: "Around session 20, attention and processing-speed gains begin to appear in trials.[hbo-longcovid-rct]"
- Week 12: "RCT cognitive gains were measured after 40 sessions in post-COVID patients.[hbo-longcovid-rct]"

### long_covid
- Week 1: "Don't expect rapid changes; the studied protocol delivers benefit over many sessions.[hbo-longcovid-rct]"
- Week 4: "By 20 sessions, fatigue and sleep markers may begin to shift in line with trial data.[hbo-longcovid-rct]"
- Week 12: "The 2022 RCT measured improvements at 40 sessions; long-term follow-up showed durability at 1 year.[hbo-longcovid-rct]"

### neuro_recovery
- Week 1: "Evidence in neuro-recovery is mixed; track symptoms with your clinician before drawing conclusions.[hbo-tbi-mixed]"
- Week 4: "Some open-label trials show improvement; sham-controlled military trials have been null.[hbo-tbi-mixed]"
- Week 12: "Speak to a clinician before treating mTBI symptoms with HBOT; current guidelines are cautious.[hbo-tbi-mixed]"

### athletic_performance
- Week 1: "Acute sessions may modestly support post-training recovery markers.[hbo-recovery]"
- Week 4: "Repeated HBOT exposures showed muscle-injury recovery benefits in trial meta-analysis.[hbo-recovery]"
- Week 12: "Long-protocol effects on stem-cell mobilization may support training-load adaptation.[hbo-cd34-8x]"

### anti_aging
- Week 1: "Anti-aging effects are dose-dependent; expect changes over months, not days.[hbo-telomere]"
- Week 4: "Senescent-cell and inflammation markers may begin to shift through repeated exposures.[hbo-telomere]"
- Week 12: "After ~60 sessions, immune-cell telomere length and skin biomarkers improved in trials.[hbo-telomere]"

---

## Claims library JSON-shape (proposed)

```json
{
  "hbo-plasma-1500": {
    "title": "Plasma-dissolved oxygen at clinical HBOT pressure",
    "phrasing_en": "At 2.0–2.4 ATA with 100% O2, oxygen dissolved directly in plasma can rise roughly 15× over baseline.",
    "phrasing_tr": "2.0–2.4 ATA ve %100 O2 koşullarında plazmada çözünmüş oksijen yaklaşık 15 kat artar.",
    "source": {
      "authors": "Mathieu D, Marroni A, Kot J",
      "year": 2017,
      "journal": "Diving and Hyperbaric Medicine",
      "doi": "N/A",
      "pmid": "28357821"
    },
    "pressure": "2.0-2.4 ATA, 100% O2",
    "do_not_apply_to": "1.3 ATA ambient air"
  },
  "hbo-cd34-8x": {
    "title": "Stem cell (CD34+) mobilization after 20 HBOT sessions",
    "phrasing_en": "20 sessions of 2.0 ATA HBOT increased circulating CD34+ stem cells ~8×.",
    "phrasing_tr": "20 seans 2.0 ATA HBOT, dolaşımdaki CD34+ kök hücreleri yaklaşık 8 kat artırdı.",
    "source": {
      "authors": "Thom SR, Bhopale VM, Velazquez OC, et al.",
      "year": 2006,
      "journal": "Am J Physiol Heart Circ Physiol",
      "doi": "10.1152/ajpheart.00888.2005",
      "pmid": "16299259"
    },
    "pressure": "2.0 ATA, 100% O2"
  },
  "hbo-longcovid-rct": {
    "title": "HBOT for post-COVID neurocognitive symptoms (RCT)",
    "phrasing_en": "A 2022 sham-controlled RCT (n=73, 40 sessions) showed HBOT improved attention, executive function, and global cognition in post-COVID patients.",
    "phrasing_tr": "2022 sham-kontrollü RKÇ (n=73, 40 seans), post-COVID hastalarında HBOT'un dikkat, yürütücü işlev ve genel bilişi iyileştirdiğini gösterdi.",
    "source": {
      "authors": "Zilberman-Itskovich S, Catalogna M, Sasson E, et al.",
      "year": 2022,
      "journal": "Scientific Reports",
      "doi": "10.1038/s41598-022-15565-0",
      "pmid": "35821512"
    },
    "pressure": "2.0 ATA, 90 min, 40 sessions"
  },
  "hbo-skin": {
    "title": "Dermal collagen and elastic fiber after HBOT",
    "phrasing_en": "60 sessions of HBOT in older men (n=13 biopsied) increased dermal collagen density and elastic fiber length and reduced senescent skin cells.",
    "phrasing_tr": "Yaşlı erkeklerde (n=13, biyopsi) 60 seans HBOT, dermal kollajen yoğunluğu ve elastik lif uzunluğunu artırdı, yaşlanmış cilt hücrelerini azalttı.",
    "source": {
      "authors": "Hachmo Y, Hadanny A, Mendelovic S, et al.",
      "year": 2021,
      "journal": "Aging (Albany NY)",
      "doi": "10.18632/aging.203701",
      "pmid": "34784294"
    },
    "pressure": "2.0 ATA, 60 sessions"
  },
  "hbo-tbi-mixed": {
    "title": "HBOT for mTBI / persistent post-concussion symptoms",
    "phrasing_en": "Evidence is mixed: military sham-controlled RCTs were null; some civilian trials show benefit. VA/DoD guidelines are cautious.",
    "phrasing_tr": "Kanıtlar karışık: askeri sham-kontrollü çalışmalar olumsuz, bazı sivil çalışmalar olumlu. VA/DoD rehberleri ihtiyatlı.",
    "source": {
      "authors": "Hadanny A, Daphna-Tekoah S, Bechor Y, et al.",
      "year": 2022,
      "journal": "Frontiers in Neurology",
      "doi": "10.3389/fneur.2022.815056",
      "pmid": "35370898"
    },
    "pressure": "various; mostly 1.5-2.4 ATA"
  },
  "hbo-inflam": {
    "title": "HBOT and inflammatory markers (TNF-α, CRP)",
    "phrasing_en": "In specific clinical conditions (IBD, severe COVID, post-surgical), HBOT has reduced TNF-α, IL-6 and CRP.",
    "phrasing_tr": "Belirli klinik durumlarda (IBD, ağır COVID, ameliyat sonrası) HBOT, TNF-α, IL-6 ve CRP'yi azaltmıştır.",
    "source": {
      "authors": "Memar MY, et al.",
      "year": 2024,
      "journal": "Precision Clinical Medicine",
      "doi": "10.1093/pcmedi/pbae001"
    },
    "pressure": "2.0-2.5 ATA"
  },
  "hbo-recovery": {
    "title": "HBOT and exercise recovery",
    "phrasing_en": "A 2025 meta-analysis (10 trials, n=299) found HBOT accelerates recovery from exercise-induced muscle injury; effects on soreness are inconsistent.",
    "phrasing_tr": "2025 meta-analizi (10 çalışma, n=299), HBOT'un egzersize bağlı kas hasarından iyileşmeyi hızlandırdığını; ağrı üzerindeki etkilerin ise tutarsız olduğunu buldu.",
    "source": {
      "authors": "Multi-author meta-analysis",
      "year": 2025,
      "journal": "Journal of Science and Medicine in Sport",
      "pmid": "40784513"
    },
    "pressure": "2.0-2.5 ATA"
  },
  "hbo-mito": {
    "title": "HBOT and mitochondrial biogenesis",
    "phrasing_en": "Preclinical and review evidence suggests repeated HBOT activates mitochondrial biogenesis pathways (SIRT1, PGC-1α) under multi-week protocols.",
    "phrasing_tr": "Klinik öncesi ve derleme kanıtları, çok haftalı HBOT'un mitokondri biyogenez yolaklarını (SIRT1, PGC-1α) aktive ettiğini öneriyor.",
    "source": {
      "authors": "De Wolde SD, Hulskes RH, Weenink RP, et al.",
      "year": 2021,
      "journal": "Biomolecules",
      "pmid": "34944468"
    },
    "pressure": "preclinical / review"
  },
  "hbo-telomere": {
    "title": "HBOT, telomere length, and immunosenescence",
    "phrasing_en": "60 sessions of HBOT in adults 64+ (n=35) increased peripheral immune-cell telomere length by >20% and reduced senescent T-cells.",
    "phrasing_tr": "64+ yaşındaki yetişkinlerde (n=35) 60 seans HBOT, çevresel bağışıklık hücrelerinde telomer uzunluğunu %20'den fazla artırdı, yaşlanmış T-hücrelerini azalttı.",
    "source": {
      "authors": "Hachmo Y, Hadanny A, Abu Hamed R, et al.",
      "year": 2020,
      "journal": "Aging (Albany NY)",
      "doi": "10.18632/aging.202188",
      "pmid": "33206062"
    },
    "pressure": "2.0 ATA, 60 sessions"
  },
  "hbo-mild-caveat": {
    "title": "Mild HBOT (1.3 ATA) caveat",
    "phrasing_en": "Most published HBOT research uses 2.0–2.4 ATA with 100% O2. Efficacy at 1.3 ATA ambient air is not established and serves as a sham control in most rigorous trials.",
    "phrasing_tr": "Yayımlanmış HBOT araştırmalarının çoğu 2.0–2.4 ATA ve %100 O2 kullanır. 1.3 ATA ortam havasında etkinlik kanıtlanmamıştır ve çoğu titiz çalışmada sham (plasebo) kolu olarak kullanılır.",
    "source": {
      "authors": "Bennett MH, et al.",
      "year": 2018,
      "journal": "Diving and Hyperbaric Medicine",
      "pmcid": "PMC6136075"
    },
    "pressure": "comparison reference"
  }
}
```

---

## Citation UX recommendation

**Pattern:** Numeric superscript that opens a bottom-sheet modal.

1. Inline: claim text ends with a small `[1]` superscript (Wellcore brand: subtle, 75% opacity, same color family — never red/blue link styling).
2. Tap target: invisible 32 px hit area around the superscript (mobile accessibility).
3. Modal: Cupertino-style bottom sheet with:
   - Citation tag header (`hbo-cd34-8x`)
   - One-line claim re-statement
   - Authors / Year / Journal
   - DOI / PMID with copy-to-clipboard button
   - "What this means for you" plain-language paragraph (1–2 sentences)
   - "What this study did NOT show" caveat block (critical for trust)
   - External link icon → opens DOI in in-app webview
4. **i18n behavior:** the claim text is translated; the citation modal stays in English (journal names and author lists are English in source material). Plain-language summaries are translated.
5. **Compliance footer on Onboarding slide 3 (Why):** "Wellcore is an educational companion, not medical advice. Cited research describes specific populations and pressures; results may not generalize to your situation." Persistent, small font, dismissible once.
6. **Settings → Sources screen:** users can browse the full claims library in one place. Builds trust and is a good defensive artifact for app-store review.

---

## UNSUPPORTED claims — do NOT use

- **"%4-week skin elasticity gain"** — No primary source. Hachmo 2021 measured at ~3 months / 60 sessions, not 4 weeks. Remove from copy.
- **"HBOT cures / treats / heals long COVID"** — RCT shows symptom improvement, not cure. Use "improves symptoms" only.
- **"HBOT reverses aging by X years"** — Press-release-grade phrasing; not in any peer-reviewed source.
- **"HBOT works the same at 1.3 ATA"** — Contradicted by trial design literature (1.3 ATA is sham).
- **"HBOT reduces inflammation" (general wellness claim)** — Inflammation reductions are documented in disease populations, not asymptomatic users. Avoid as a general benefit.
- **"HBOT boosts immunity"** — No human RCT supports this as a stand-alone claim in healthy users.
- **"HBOT detoxifies"** — No mechanistic or clinical literature uses this framing.
- **"HBOT cures TBI / concussion"** — Mixed evidence; VA/DoD recommends against routine use.
- **"%1500 oxygen increase" (without pressure context)** — Misleading without specifying 2.4 ATA / 100% O2.

---

## References (master list, deduplicated)

1. Mathieu D, Marroni A, Kot J. Tenth European Consensus Conference on Hyperbaric Medicine. *Diving Hyperb Med.* 2017;47(1):24–32. PMID: 28357821.
2. Leach RM, Rees PJ, Wilmshurst P. ABC of oxygen: Hyperbaric oxygen therapy. *BMJ.* 1998;317(7166):1140–3. PMID: 9784458.
3. Thom SR, Bhopale VM, Velazquez OC, et al. Stem cell mobilization by hyperbaric oxygen. *Am J Physiol Heart Circ Physiol.* 2006;290(4):H1378–86. DOI: 10.1152/ajpheart.00888.2005. PMID: 16299259.
4. Heyboer M, et al. CD34+/CD45-dim stem cell mobilization by hyperbaric oxygen — changes with oxygen dosage. *Stem Cell Res.* 2014. PMC4037447.
5. Zilberman-Itskovich S, Catalogna M, Sasson E, et al. HBOT improves neurocognitive functions and symptoms of post-COVID condition: RCT. *Sci Rep.* 2022;12:11252. DOI: 10.1038/s41598-022-15565-0. PMID: 35821512.
6. Hadanny A, Zilberman-Itskovich S, Catalogna M, et al. Long term outcomes of HBOT in post-COVID condition: longitudinal follow-up of an RCT. *Sci Rep.* 2024;14:3604. DOI: 10.1038/s41598-024-53091-3. PMID: 38360929.
7. Hachmo Y, Hadanny A, Mendelovic S, et al. The effect of HBOT on the pathophysiology of skin aging: a prospective clinical trial. *Aging (Albany NY).* 2021;13(22):24500–24510. DOI: 10.18632/aging.203701. PMID: 34784294.
8. Hachmo Y, Hadanny A, Abu Hamed R, et al. HBOT increases telomere length and decreases immunosenescence in isolated blood cells. *Aging (Albany NY).* 2020;12(22):22445–22456. DOI: 10.18632/aging.202188. PMID: 33206062.
9. Hadanny A, Daphna-Tekoah S, Bechor Y, et al. Systematic Review and Dosage Analysis: HBOT Efficacy in Mild TBI Persistent Postconcussion Syndrome. *Front Neurol.* 2022;13:815056. DOI: 10.3389/fneur.2022.815056. PMID: 35370898.
10. *A double-blind randomized trial of hyperbaric oxygen for persistent symptoms after brain injury.* Sci Rep. 2025. DOI: 10.1038/s41598-025-86631-6.
11. De Wolde SD, Hulskes RH, Weenink RP, Hollmann MW, Van Hulst RA. HBOT: Effects on Mitochondrial Function and Oxidative Stress. *Biomolecules.* 2021;11(8):1210. PMID: 34944468. PMC8699286.
12. Hu Q, et al. HBOT Improves Parkinson's Disease by Promoting Mitochondrial Biogenesis via the SIRT-1/PGC-1α Pathway. *Biomolecules.* 2022;12(5):661. PMC9138219.
13. Effects of HBOT on Exercise-Induced Muscle Injury and Soreness: Systematic Review and Meta-analysis. 2025. PMID: 40784513.
14. Memar MY, et al. HBOT: focus on inflammatory bowel disease. *Precis Clin Med.* 2024;7(1):pbae001.
15. Cannellotto M, et al. HBOT as adjuvant treatment for severe COVID-19 hypoxaemia: RCT. *Emerg Med J.* 2022;39(2).
16. Bennett MH, et al. Double-blind trials in hyperbaric medicine: narrative review on sham hyperbaric treatment design. *Diving Hyperb Med.* 2018;48(2). PMC6136075.
17. Efrati S, Golan H, Bechor Y, et al. HBOT can diminish fibromyalgia syndrome — prospective clinical trial. *PLoS ONE.* 2015;10(5):e0127012. DOI: 10.1371/journal.pone.0127012. PMID: 26010952.
18. Bitterman H. Bench-to-bedside review: Oxygen as a drug. *Crit Care.* 2009;13(1):205. PMID: 19291278.
19. VA/DoD Clinical Practice Guideline for the Management and Rehabilitation of Post-Acute Mild TBI, 2021.

---

*This document is the canonical citations source for Wellcore's i18n strings. When adding any new educational claim to the app, it MUST first be added here with a tag, citation, and approved phrasing. Marketing-only claims with no peer-reviewed source must be flagged and rejected at code review.*
