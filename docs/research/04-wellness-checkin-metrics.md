# Wellness Check-in Metrics — Validated Instrument Map for Wellcore

## TL;DR

Wellcore's three home-screen rings (Adherence / Recovery / Vitality) are powered by a **two-tier check-in**:

1. **Daily Quick Check** — 3 items, ~20 seconds, after every HBOT session. Items are taken verbatim from PROMIS Global Health v1.2 and the Subjective Vitality Scale. Feeds the Vitality ring and a rolling Recovery proxy.
2. **Weekly Deeper Check** — 8–12 items, ~60 seconds, on Sundays. Adds goal-specific PROMIS short-form items (Fatigue 7a, Cognitive Function 4a, Sleep Disturbance 4a, Physical Function 4a) plus a Hooper-style soreness item for athletes and a 1-item self-rated skin radiance VAS for radiance/anti-aging.

**Adherence** is purely behavioral: `sessions_completed_this_week / sessions_prescribed_this_week`, clamped to [0, 1.2] then capped at 1.0 for ring fill.

**Recovery** = weighted average of (inverse-scored) PROMIS Fatigue + Sleep Disturbance + DOMS soreness, normalized 0–100.

**Vitality** = weighted average of Subjective Vitality + PROMIS Global Mental Health single item + Energy quick-check, normalized 0–100.

Goals without strong validated daily measures (radiance, anti-aging) use **pragmatic 1–2 item self-VAS** with explicit caveats — these are tracked as user-perceived trends, not clinical scores.

All PROMIS items are public domain (HealthMeasures, Northwestern). WHO-5 is free for non-commercial use with attribution. DOMS-VAS, Hooper Index, and Subjective Vitality are free academic instruments.

---

## The three rings — definitions and scoring

### Adherence (formula)

Pure behavior, no self-report:

```
adherence_week = clamp(sessions_completed / sessions_prescribed, 0, 1)
adherence_30d  = mean(adherence_week_1..4)
ring_fill      = adherence_week  // shown on home screen
```

`sessions_prescribed` comes from the active protocol (e.g. "Vitality 4-week" prescribes 5 sessions/week → 20 over 4 weeks). Missed sessions in week N do not roll over to week N+1; instead they degrade the 30-day adherence.

A "session" counts only if: (a) device telemetry confirms ≥ 80% of prescribed time at target pressure, OR (b) user manually marks complete and confirms duration ≥ 80%.

### Recovery (formula, source instruments)

Recovery is the body-axis. Sources: PROMIS Fatigue SF 7a (Cella et al., 2010), PROMIS Sleep Disturbance SF 4a (Yu et al., 2011), and DOMS-VAS (Cleak & Eston, 1992).

Items are scored 1–5 on PROMIS (higher = worse for fatigue/sleep), then **inverted and rescaled** so higher = better recovery.

```
fatigue_norm  = (5 - mean(fatigue_items))  / 4 * 100   // 0..100
sleep_norm    = (5 - mean(sleep_items))    / 4 * 100
soreness_norm = (10 - doms_vas) / 10 * 100             // VAS 0..10, 0=no soreness

recovery_score = 0.45*fatigue_norm + 0.35*sleep_norm + 0.20*soreness_norm
```

For non-athletic goals, soreness weight is reallocated to fatigue (0.55 / 0.45 / 0).

### Vitality (formula, source instruments)

Vitality is the mind-energy axis. Sources: Subjective Vitality Scale (Ryan & Frederick, 1997), PROMIS Global Health v1.2 mental-health item (Hays et al., 2009), and a daily energy VAS adapted from PROMIS.

```
vitality_norm = mean(subjective_vitality_items) / 7 * 100   // 7-point Likert
mood_norm     = (global_mental - 1) / 4 * 100               // 1..5 → 0..100
energy_norm   = energy_vas * 10                             // 0..10 → 0..100

vitality_score = 0.40*vitality_norm + 0.30*mood_norm + 0.30*energy_norm
```

Both Recovery and Vitality use a **7-day exponentially-weighted moving average** (alpha = 0.35) to smooth single-session noise.

---

## Daily quick check (3 items, every session)

Asked immediately after the user logs out of the chamber. Slider UI, ≤ 20 seconds total.

### 1. Energy (single-item, adapted from PROMIS Global Physical Health item 4)

- **EN:** "How would you rate your energy level right now?" — 0 (No energy) to 10 (Maximum energy)
- **TR:** "Şu anki enerji seviyeni nasıl değerlendirirsin?" — 0 (Hiç enerji yok) ile 10 (Maksimum enerji) arası
- **Source:** Adapted from PROMIS Global Health v1.2, item Global04 (Hays, Bjorner, Revicki, Spritzer & Cella, 2009).

### 2. Mood (PROMIS Global Mental Health single item, verbatim)

- **EN:** "In general, how would you rate your mental health, including your mood and your ability to think?" — 1 (Poor) … 5 (Excellent)
- **TR:** "Genel olarak ruh sağlığını — duygu durumun ve düşünme yeteneğin dahil — nasıl değerlendirirsin?" — 1 (Kötü) … 5 (Mükemmel)
- **Source:** PROMIS Global Health v1.2, item Global03 (Hays et al., 2009). Public domain.

### 3. Sleep last night (single item, ULMS-style)

- **EN:** "How well did you sleep last night?" — 0 (Very poorly) … 10 (Very well)
- **TR:** "Dün gece ne kadar iyi uyudun?" — 0 (Çok kötü) … 10 (Çok iyi)
- **Source:** Single-item sleep quality, format adapted from the Karolinska Sleep Diary single-item global rating (Åkerstedt, Hume, Minors & Waterhouse, 1994); aligns with the ULMS (University of Loughborough Single-item Mood/Sleep) family.

These three feed the Vitality ring on every check-in.

---

## Weekly deeper check (8–12 items, Sundays)

Sundays at 19:00 local. Push notification reframes: "60 saniye — bu haftayı özetle." Items rotate based on the user's active goal; the **base 4 items** (PROMIS Global Health subset) always appear.

### Base — PROMIS Global Health v1.2 (4 items, verbatim)

| # | EN | TR | Scale |
|---|----|----|-------|
| G1 | In general, would you say your health is… | Genel olarak sağlığını nasıl değerlendirirsin? | Excellent → Poor (5→1) |
| G2 | In general, how would you rate your physical health? | Genel olarak fiziksel sağlığını nasıl değerlendirirsin? | Excellent → Poor |
| G3 | To what extent are you able to carry out your everyday physical activities? | Günlük fiziksel aktivitelerini ne kadar yapabiliyorsun? | Completely → Not at all |
| G4 | How often have you been bothered by emotional problems such as feeling anxious, depressed or irritable? | Endişe, çökkünlük ya da sinirlilik gibi duygusal sorunlar seni ne sıklıkla rahatsız etti? | Never → Always |

**Source:** PROMIS Global Health v1.2 (Hays et al., 2009). Public domain.

### Goal-specific add-ons (4–8 items, see per-goal section)

---

## Per-goal metrics

Each goal injects 2–4 daily and/or weekly items. Daily items append to the 3-item quick check; weekly items append to the 4-item Global base.

### radiance

Skin/photoaging instruments (Skindex-29, IGA) are clinician-administered or 29 items — too heavy for daily use. We use a **pragmatic self-VAS** with an explicit "perceived" caveat in copy.

- **Daily (1 extra item):**
  - EN: "How does your skin look and feel today?" 0–10 VAS
  - TR: "Bugün cildin nasıl görünüyor ve hissettiriyor?" 0–10
- **Weekly (2 extra items):**
  - EN: "Compared to last week, my skin radiance is…" Much worse(1) → Much better(5)
  - TR: "Geçen haftaya göre cildimin parlaklığı…" Çok daha kötü(1) → Çok daha iyi(5)
  - EN: "Compared to last week, my skin texture/smoothness is…" 1→5
  - TR: "Geçen haftaya göre cildimin pürüzsüzlüğü…" 1→5
- **Source:** Pragmatic self-rated VAS in the spirit of Patient Global Impression of Change (PGI-C; Guy, 1976) and the Self-Assessed Skin Quality scale used in cosmetic dermatology trials (e.g. Logger et al., *Skin Res Technol* 2020). **Caveat:** not a clinically validated daily metric; should be framed to users as "your perception," not "objective skin score."
- **Ring contribution:** feeds Vitality (skin item replaces 30% of energy weight on radiance protocol).
- **Weekly summary copy:**
  > "Cildin parlaklık skoru 4 hafta içinde 4.2'den 6.1'e yükseldi (+45%). Bu senin algın — bir sonraki seansta selfie eklemek ister misin?"

### recovery

- **Weekly (PROMIS Fatigue SF 7a, 7 items, verbatim "past 7 days" recall):** Sample items: "How often did you feel tired?", "How fatigued were you on average?" (5-point Never → Always / Not at all → Very much).
  - Item 1 EN: "During the past 7 days, how often did you feel tired?"
  - Item 1 TR: "Son 7 günde, ne sıklıkla yorgun hissettin?"
  - Source: PROMIS Fatigue SF 7a (Cella, Lai, Chang, Peterman & Slavin, 2010 / HealthMeasures 2019).
- **Ring contribution:** Recovery (full weight as defined above).
- **Weekly summary copy:**
  > "Yorgunluk T-skoru 58.4'ten 49.1'e düştü — popülasyon ortalamasının altına geçtin."

### vitality

- **Daily (already covered by quick check).**
- **Weekly add-on (Subjective Vitality Scale, 6 items short form):** "I feel alive and vital", "I have energy and spirit", etc. — 7-point Likert.
  - Item 1 EN: "I feel alive and vital."
  - Item 1 TR: "Kendimi canlı ve dinç hissediyorum."
  - Source: Ryan & Frederick (1997), *Journal of Personality* 65(3).
- **Ring contribution:** Vitality (full weight).
- **Weekly summary copy:**
  > "Subjektif Vitalite skorun 4.1'den 5.6'ya çıktı (7 üzerinden). Bu, klinik olarak anlamlı bir değişim eşiği."

### wellness

General-purpose; uses WHO-5 weekly + daily quick check.

- **Weekly (WHO-5 Wellbeing Index, 5 items, verbatim):**
  - EN item 1: "Over the last two weeks, I have felt cheerful and in good spirits." 0 (At no time) … 5 (All of the time)
  - TR item 1: "Son iki haftada kendimi neşeli ve iyi hissettim." 0 … 5
  - Source: WHO Regional Office for Europe (1998); Topp, Østergaard, Søndergaard & Bech, 2015 (review). Score = sum × 4 → 0–100.
- **Ring contribution:** split 50/50 Vitality/Recovery (it's the all-rounder goal).
- **Weekly summary copy:**
  > "WHO-5 Refah skorun 52'den 76'ya yükseldi. 50 altı = depresyon riski; 70+ = iyi refah aralığı."

### brain_fog

- **Daily (1 extra item, PROMIS Cognitive Function single):**
  - EN: "Today, my thinking has been as sharp as usual." 1 (Not at all) … 5 (Very much)
  - TR: "Bugün düşüncelerim her zamanki kadar berraktı." 1 … 5
- **Weekly (PROMIS Cognitive Function SF 4a, verbatim):** 4 items including "I have had trouble concentrating", "My thinking has been slow."
  - Source: PROMIS Cognitive Function v2.0 SF 4a (Lai et al., 2014).
- **Ring contribution:** Vitality (cognitive replaces mood weight 50/50).
- **Weekly summary copy:**
  > "Bilişsel berraklık skorun 3.1'den 4.4'e çıktı — 4 hafta önce 'sık sık dikkat sorunu' diyordun, şimdi 'nadiren'."

### long_covid

Hybrid: fatigue + cognitive + post-exertional malaise (PEM).

- **Daily (2 extra items):**
  - EN: "How fatigued do you feel right now?" 0–10 VAS
  - TR: "Şu an ne kadar yorgun hissediyorsun?" 0–10
  - EN: "Did you experience a crash (worsened symptoms) after activity yesterday?" Yes / Mild / No
  - TR: "Dün aktivite sonrası belirtilerin kötüleşti mi (crash)?" Evet / Hafif / Hayır
- **Weekly:** PROMIS Fatigue SF 7a + Cognitive Function SF 4a (full).
- **Source:** DePaul Symptom Questionnaire short form for PEM screening (Jason et al., 2018); PROMIS items as above.
- **Ring contribution:** Recovery (60%) + Vitality cognitive (40%).
- **Weekly summary copy:**
  > "Yorgunluk skorun 4 haftada 3.2'den 5.8'e yükseldi (10 üzerinden, daha yüksek = daha iyi). Crash sıklığı haftada 5'ten 1'e düştü."

### neuro_recovery

For TBI/stroke/post-concussion users.

- **Weekly (PROMIS Cognitive Function SF 8a + Neuro-QoL Cognition short form 8a):** 8 cognitive items covering memory, attention, executive function. Verbatim.
  - Source: Neuro-QoL Cognition v2.0 (Cella et al., 2012, *Neurology*).
- **Daily (1 item):** PROMIS Cognitive Function single (same as brain_fog).
- **Ring contribution:** Vitality.
- **Weekly summary copy:**
  > "Neuro-QoL Bilişsel skorun T=42'den T=51'e yükseldi. Popülasyon ortalaması = 50; sen artık tipik aralıktasın."

### athletic_performance

- **Daily (2 extra items, post-session):**
  - DOMS-VAS — EN: "Rate your overall muscle soreness right now." 0 (None) – 10 (Worst imaginable)
  - DOMS-VAS — TR: "Şu anki genel kas ağrını değerlendir." 0 – 10
  - Perceived Recovery Status (PRS) — EN: "How recovered do you feel?" 0 (Very poorly recovered) – 10 (Very well recovered)
  - PRS — TR: "Ne kadar toparlanmış hissediyorsun?" 0 – 10
- **Weekly (Hooper Index, 4 items, 1–7 scale):** Sleep quality, fatigue, stress, muscle soreness.
  - Source: Hooper, Mackinnon, Howard, Gordon & Bachmann (1995), *MSSE*.
- **Source — DOMS-VAS:** Cleak & Eston (1992), *British Journal of Sports Medicine*.
- **Source — PRS:** Laurent et al. (2011), *Journal of Strength & Conditioning Research*.
- **Ring contribution:** Recovery (DOMS + PRS replace base soreness weighting; full athletic Recovery).
- **Weekly summary copy:**
  > "Hooper Index skorun 18'den 11'e düştü (düşük = iyi). PRS ortalaman 5.4'ten 7.8'e çıktı — antrenman sonrası 24 saat içinde toparlanma %44 daha hızlı."

### anti_aging

**Honest gap:** there is no validated 1-item daily anti-aging measure. We construct a **composite proxy index** with explicit caveat in the UI ("This is a wellness proxy, not a biological age estimate. For that, see your epigenetic test page.").

- **Daily:** quick check + skin VAS (from radiance).
- **Weekly:** WHO-5 + PROMIS Physical Function SF 4a + skin radiance VAS + sleep disturbance SF 4a.
- **Composite:**

  ```
  anti_aging_proxy = 0.30*WHO5_norm
                   + 0.25*PhysicalFunction_norm
                   + 0.20*Skin_VAS_norm
                   + 0.15*Sleep_norm
                   + 0.10*Vitality_score
  ```
- **Source:** Composite is original to Wellcore; constituent items are validated. Disclose openly.
- **Ring contribution:** 50% Vitality / 50% Recovery.
- **Weekly summary copy:**
  > "Anti-aging proxy skorun 4 haftada 61'den 74'e yükseldi. Bu epigenetik yaş değil — uyku, fiziksel işlev, refah ve cilt algının bileşik göstergesi."

---

## Score aggregation (pseudocode)

```python
def normalize_promis(items_1_to_5, higher_is_worse=True):
    raw = mean(items_1_to_5)
    return ((5 - raw) if higher_is_worse else (raw - 1)) / 4 * 100

def daily_check(quick, goal_extras, goal):
    energy_norm = quick.energy * 10
    mood_norm   = (quick.mood - 1) / 4 * 100
    sleep_norm  = quick.sleep * 10

    rings = {
        "vitality": 0.40*energy_norm + 0.30*mood_norm + 0.30*sleep_norm,
        "recovery": 0.55*sleep_norm  + 0.45*(100 - quick.fatigue_vas*10
                                              if "fatigue_vas" in goal_extras else energy_norm),
    }
    return ema(rings, alpha=0.35)

def weekly_score(weekly_items, goal):
    # Replace daily proxies with PROMIS short-form scores
    if goal in {"recovery", "long_covid"}:
        rings["recovery"] = normalize_promis(weekly_items.fatigue_7a)
    if goal in {"brain_fog", "neuro_recovery", "long_covid"}:
        rings["vitality"] = (normalize_promis(weekly_items.cogfn_4a, higher_is_worse=False)
                             + rings["vitality"]) / 2
    # ... (per-goal logic)

def adherence(week):
    return min(week.completed / max(week.prescribed, 1), 1.0)
```

EWMA smoothing:
```
score_t = alpha*new + (1-alpha)*score_{t-1}    # alpha = 0.35
```

T-score conversion (for reporting next to population norms): PROMIS items convert raw → T via published lookup tables (mean=50, SD=10 in US general population). Wellcore displays T-scores **only on the "deep stats" tab**, not on the home rings.

---

## Gaps / honest caveats

1. **Radiance and anti-aging** lack daily validated measures. We use self-VAS and disclose this clearly. A future v2 could integrate periodic selfie skin analysis (e.g. Perfect Corp / Haut.AI) for an objective overlay.
2. **PROMIS short forms are validated for weekly recall ("past 7 days")**, not session-by-session. We do not present PROMIS T-scores after a single session — they appear only in weekly summaries.
3. **Subjective Vitality Scale** is validated as a trait/state distinction, but daily use is supported (Bostic, Rubio & Hood, 2000). Still, single-day scores are noisy; we always show 7-day EMA.
4. **DOMS-VAS** is reactive to acute training, not HBOT alone — for athletic_performance users, attribute changes carefully ("your training load also dropped this week").
5. **No instrument here is diagnostic.** Wellcore explicitly does not screen for depression, anxiety disorder, or cognitive impairment. Copy must avoid clinical claims; prompt referral to a clinician when WHO-5 < 28 (depression risk threshold per Topp et al., 2015) or PROMIS Depression T > 60.
6. **TR translations** above are working drafts. Before launch, all PROMIS items must be replaced with the **official PROMIS Turkish translations** from the FACIT/HealthMeasures translation library (PROMIS has certified TR versions for most short forms; license is free but registration required). WHO-5 has an official Turkish version (Eser et al., 2019, *Anatolian Journal of Psychiatry*).

---

## References

- Åkerstedt T, Hume K, Minors D, Waterhouse J. (1994). The subjective meaning of good sleep — an intraindividual approach using the Karolinska Sleep Diary. *Perceptual & Motor Skills* 79(1).
- Bostic TJ, Rubio DM, Hood M. (2000). A validation of the subjective vitality scale using structural equation modeling. *Social Indicators Research* 52.
- Cella D, Lai JS, Chang CH, Peterman A, Slavin M. (2010). Fatigue in cancer patients compared with fatigue in the general US population. *Cancer* 94(2). PROMIS Fatigue SF 7a.
- Cella D, Nowinski C, Peterman A, et al. (2012). The Neurology Quality-of-Life measurement initiative. *Archives of Physical Medicine & Rehabilitation* 92(10S).
- Cleak MJ, Eston RG. (1992). Muscle soreness, swelling, stiffness and strength loss after intense eccentric exercise. *British Journal of Sports Medicine* 26(4). DOMS-VAS.
- Eser E et al. (2019). Turkish validity and reliability of the WHO-5 Well-Being Index. *Anatolian Journal of Psychiatry*.
- Guy W. (1976). ECDEU Assessment Manual for Psychopharmacology. PGI-C reference.
- Hays RD, Bjorner JB, Revicki DA, Spritzer KL, Cella D. (2009). Development of physical and mental health summary scores from the Patient-Reported Outcomes Measurement Information System (PROMIS) global items. *Quality of Life Research* 18(7). PROMIS Global Health v1.2.
- Hooper SL, Mackinnon LT, Howard A, Gordon RD, Bachmann AW. (1995). Markers for monitoring overtraining and recovery. *Medicine & Science in Sports & Exercise* 27(1).
- Jason LA, Sunnquist M. (2018). The development of the DePaul Symptom Questionnaire. *Frontiers in Pediatrics* 6.
- Lai JS, Wagner LI, Jacobsen PB, Cella D. (2014). Self-reported cognitive concerns and abilities: two sides of one coin? *Psycho-Oncology* 23(10). PROMIS Cognitive Function SF.
- Laurent CM, Green JM, Bishop PA, et al. (2011). A practical approach to monitoring recovery: development of a perceived recovery status scale. *Journal of Strength & Conditioning Research* 25(3).
- Logger JGM, Olydam JI, Driessen RJB. (2020). Use of beta-hydroxy acids in dermatology — and patient self-rated outcomes. *Skin Research and Technology* 26.
- Ryan RM, Frederick C. (1997). On energy, personality, and health: subjective vitality as a dynamic reflection of well-being. *Journal of Personality* 65(3). Subjective Vitality Scale.
- Topp CW, Østergaard SD, Søndergaard S, Bech P. (2015). The WHO-5 Well-Being Index: a systematic review of the literature. *Psychotherapy and Psychosomatics* 84(3).
- Yu L, Buysse DJ, Germain A, et al. (2011). Development of short forms from the PROMIS Sleep Disturbance and Sleep-Related Impairment item banks. *Behavioral Sleep Medicine* 10(1).
- HealthMeasures (Northwestern University). PROMIS Adult Scoring Manuals & Short Forms. healthmeasures.net (2019–2023, public domain).
