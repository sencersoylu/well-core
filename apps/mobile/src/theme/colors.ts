export const Colors = {
  // Surface — warm paper whites
  bg: "#f6f4ef",
  bgElev: "#ffffff",
  bgSoft: "#efece5",
  bgTint: "#e9e5dc",

  // Ink — warm near-black scale
  ink: "#1a1a1a",
  ink2: "#3d3a36",
  ink3: "#6b6760",
  ink4: "#9a958c",
  ink5: "#c5c1b8",

  // Hairlines
  hairline: "rgba(26, 26, 26, 0.08)",
  hairlineStrong: "rgba(26, 26, 26, 0.14)",

  // Wellcore three-ring accents
  adherence: "#e8a06a", // warm amber — protocol adherence
  recovery: "#5b8c7b",  // sage teal — recovery / mood
  vitality: "#c66a5b",  // terracotta — vitality / streak

  // Hero gradient (Bevel-style sky)
  hero1: "#f4d6c0",
  hero2: "#e9c8d5",
  hero3: "#c8d8e4",

  // Semantic
  positive: "#5b8c7b",
  negative: "#c66a5b",
} as const;

export type ColorToken = keyof typeof Colors;

export const Gradients = {
  hero: ["#f4d6c0", "#e9c8d5", "#c8d8e4"] as const,
  paperBloom: ["#f7e7d8", "#f6f4ef"] as const,
} as const;
