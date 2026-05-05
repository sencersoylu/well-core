import { db } from "./client.js";
import { protocols } from "./schema/index.js";

const data = [
  {
    slug: "soft-1-3-foundations",
    name: { "en-US": "Soft 1.3 ATA — Foundations" },
    description: { "en-US": "60 min total · 50 min at pressure. Wellness companion routine for soft chambers." },
    pressureAta: "1.30",
    treatmentMin: 50,
    totalMin: 60,
    goalIds: ["wellness", "vitality", "radiance", "anti_aging"],
    targetSessionCount: 40,
  },
  {
    slug: "soft-1-3-brain-fog",
    name: { "en-US": "Soft 1.3 ATA — Brain Fog" },
    description: { "en-US": "60 min total · 50 min at pressure. For long-COVID-adjacent cognitive recovery (mild evidence)." },
    pressureAta: "1.30",
    treatmentMin: 50,
    totalMin: 60,
    goalIds: ["brain_fog", "long_covid"],
    targetSessionCount: 40,
  },
  {
    slug: "hard-1-5-recovery",
    name: { "en-US": "Hard 1.5 ATA — Recovery" },
    description: { "en-US": "90 min total · 75 min at pressure. Tissue recovery + neuro-recovery (PPCS Level-1 EBM)." },
    pressureAta: "1.50",
    treatmentMin: 75,
    totalMin: 90,
    goalIds: ["recovery", "neuro_recovery", "athletic_performance"],
    targetSessionCount: 40,
  },
  {
    slug: "hard-2-0-clinical",
    name: { "en-US": "Hard 2.0 ATA — Clinical" },
    description: { "en-US": "90 min total · 80 min at pressure. Flagship 2.0 ATA protocol — strong evidence base." },
    pressureAta: "2.00",
    treatmentMin: 80,
    totalMin: 90,
    goalIds: ["recovery", "long_covid", "wellness"],
    targetSessionCount: 40,
  },
  {
    slug: "hard-2-0-long-covid",
    name: { "en-US": "Hard 2.0 ATA — Long COVID" },
    description: { "en-US": "90 min total · 80 min at pressure. Per Zilberman-Itskovich 2022 sham-RCT." },
    pressureAta: "2.00",
    treatmentMin: 80,
    totalMin: 90,
    goalIds: ["long_covid", "brain_fog"],
    targetSessionCount: 40,
  },
  {
    slug: "hard-2-4-extended",
    name: { "en-US": "Hard 2.4 ATA — Extended" },
    description: { "en-US": "120 min total · 100 min at pressure. Clinical-grade extended protocol; 60-session targets." },
    pressureAta: "2.40",
    treatmentMin: 100,
    totalMin: 120,
    goalIds: ["recovery", "neuro_recovery"],
    targetSessionCount: 60,
  },
];

async function main() {
  for (const row of data) {
    await db.insert(protocols).values(row).onConflictDoNothing({ target: protocols.slug });
  }
  console.log(`seeded ${data.length} protocols`);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
