export type EvidenceLevel = "strong" | "moderate" | "weak" | "absent";

export function evidenceLevelToDots(level: EvidenceLevel): { filled: number; total: number } {
  const map: Record<EvidenceLevel, number> = { strong: 3, moderate: 2, weak: 1, absent: 0 };
  return { filled: map[level], total: 3 };
}
