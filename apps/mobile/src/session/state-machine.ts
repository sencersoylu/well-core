export type Phase = "idle" | "pressurization" | "treatment" | "decompression" | "completed" | "aborted";

export interface PhaseTargets {
  pressurizationSec: number;
  treatmentSec: number;
  decompressionSec: number;
}

export interface SessionState {
  phase: Phase;
  serverSessionId: string | null;
  protocolId: string | null;
  pressureAta: number | null;
  targets: PhaseTargets | null;
  totalStartedAt: number | null;
  phaseStartedAt: number | null;
  pausedDurationMs: number;
  pauseStartedAt: number | null;
  wallClockLastTick: number | null;
  endedAt: number | null;
}

export const initial: SessionState = {
  phase: "idle",
  serverSessionId: null,
  protocolId: null,
  pressureAta: null,
  targets: null,
  totalStartedAt: null,
  phaseStartedAt: null,
  pausedDurationMs: 0,
  pauseStartedAt: null,
  wallClockLastTick: null,
  endedAt: null,
};

export type SessionAction =
  | { type: "START"; now: number; serverSessionId: string; protocolId: string | null; pressureAta: number; targets: PhaseTargets }
  | { type: "TICK"; now: number }
  | { type: "FOREGROUND_RESYNC"; now: number }
  | { type: "ADVANCE_PHASE"; now: number }
  | { type: "PAUSE"; now: number }
  | { type: "RESUME"; now: number }
  | { type: "ABORT"; now: number }
  | { type: "COMPLETE"; now: number }
  | { type: "RESET" };

const PHASE_ORDER: Phase[] = ["pressurization", "treatment", "decompression", "completed"];

function nextPhase(p: Phase): Phase {
  const i = PHASE_ORDER.indexOf(p);
  if (i < 0 || i === PHASE_ORDER.length - 1) return p;
  return PHASE_ORDER[i + 1]!;
}

export function reduce(s: SessionState, a: SessionAction): SessionState {
  switch (a.type) {
    case "START":
      if (s.phase !== "idle") return s;
      return {
        ...initial,
        phase: "pressurization",
        serverSessionId: a.serverSessionId,
        protocolId: a.protocolId,
        pressureAta: a.pressureAta,
        targets: a.targets,
        totalStartedAt: a.now,
        phaseStartedAt: a.now,
        wallClockLastTick: a.now,
      };
    case "TICK":
    case "FOREGROUND_RESYNC":
      if (s.phase === "idle" || s.phase === "completed" || s.phase === "aborted") return s;
      return { ...s, wallClockLastTick: a.now };
    case "ADVANCE_PHASE": {
      if (s.phase === "idle" || s.phase === "completed" || s.phase === "aborted") return s;
      const np = nextPhase(s.phase);
      if (np === "completed") return { ...s, phase: "completed", endedAt: a.now };
      return { ...s, phase: np, phaseStartedAt: a.now, wallClockLastTick: a.now };
    }
    case "PAUSE":
      if (s.phase === "idle" || s.phase === "completed" || s.phase === "aborted") return s;
      if (s.pauseStartedAt !== null) return s;
      return { ...s, pauseStartedAt: a.now };
    case "RESUME":
      if (s.pauseStartedAt === null) return s;
      return {
        ...s,
        pausedDurationMs: s.pausedDurationMs + (a.now - s.pauseStartedAt),
        pauseStartedAt: null,
        wallClockLastTick: a.now,
      };
    case "ABORT":
      if (s.phase === "idle" || s.phase === "completed" || s.phase === "aborted") return s;
      return { ...s, phase: "aborted", endedAt: a.now };
    case "COMPLETE":
      if (s.phase !== "decompression") return s;
      return { ...s, phase: "completed", endedAt: a.now };
    case "RESET":
      return initial;
  }
}

export function elapsedInPhaseSec(s: SessionState, now: number): number {
  if (!s.phaseStartedAt) return 0;
  const reference = s.pauseStartedAt ?? now;
  return Math.max(0, Math.floor((reference - s.phaseStartedAt) / 1000));
}

export function totalElapsedSec(s: SessionState, now: number): number {
  if (!s.totalStartedAt) return 0;
  const reference = s.endedAt ?? s.pauseStartedAt ?? now;
  const raw = reference - s.totalStartedAt - s.pausedDurationMs;
  return Math.max(0, Math.floor(raw / 1000));
}

export function shouldAutoAdvance(s: SessionState, now: number): boolean {
  if (!s.targets) return false;
  const e = elapsedInPhaseSec(s, now);
  if (s.phase === "pressurization") return e >= s.targets.pressurizationSec;
  if (s.phase === "treatment") return e >= s.targets.treatmentSec;
  if (s.phase === "decompression") return e >= s.targets.decompressionSec;
  return false;
}
