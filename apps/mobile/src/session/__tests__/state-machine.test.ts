import { describe, expect, test } from "vitest";
import { reduce, initial, type SessionAction, type SessionState } from "../state-machine";

const T0 = 1_000_000_000_000;
const baseTargets = { pressurizationSec: 60, treatmentSec: 600, decompressionSec: 60 };

const startAction = (now = T0): SessionAction => ({
  type: "START",
  now,
  serverSessionId: "s1",
  protocolId: "p1",
  pressureAta: 2.0,
  targets: baseTargets,
});

describe("session state machine", () => {
  test("initial state is idle with null fields", () => {
    expect(initial.phase).toBe("idle");
    expect(initial.serverSessionId).toBeNull();
  });

  test("START transitions idle → pressurization, captures wall-clock anchors", () => {
    const s = reduce(initial, startAction());
    expect(s.phase).toBe("pressurization");
    expect(s.totalStartedAt).toBe(T0);
    expect(s.phaseStartedAt).toBe(T0);
    expect(s.pausedDurationMs).toBe(0);
    expect(s.serverSessionId).toBe("s1");
  });

  test("TICK during pressurization advances elapsed via wall-clock", () => {
    const s1 = reduce(initial, startAction());
    const s2 = reduce(s1, { type: "TICK", now: T0 + 30_000 });
    expect(s2.wallClockLastTick).toBe(T0 + 30_000);
    // elapsed in current phase is derived in selectors, not stored — but lastTick advances
  });

  test("ADVANCE_PHASE pressurization → treatment when target reached", () => {
    const s1 = reduce(initial, startAction());
    const s2 = reduce(s1, { type: "ADVANCE_PHASE", now: T0 + 60_000 });
    expect(s2.phase).toBe("treatment");
    expect(s2.phaseStartedAt).toBe(T0 + 60_000);
  });

  test("PAUSE captures pauseStartedAt, RESUME accumulates pausedDurationMs", () => {
    const s1 = reduce(initial, startAction());
    const s2 = reduce(s1, { type: "PAUSE", now: T0 + 30_000 });
    expect(s2.pauseStartedAt).toBe(T0 + 30_000);
    const s3 = reduce(s2, { type: "RESUME", now: T0 + 50_000 });
    expect(s3.pauseStartedAt).toBeNull();
    expect(s3.pausedDurationMs).toBe(20_000);
  });

  test("PAUSE while already paused is a no-op", () => {
    const s1 = reduce(initial, startAction());
    const s2 = reduce(s1, { type: "PAUSE", now: T0 + 10_000 });
    const s3 = reduce(s2, { type: "PAUSE", now: T0 + 20_000 });
    expect(s3.pauseStartedAt).toBe(T0 + 10_000);
  });

  test("FOREGROUND_RESYNC after long background recomputes wallClockLastTick", () => {
    const s1 = reduce(initial, startAction());
    const s2 = reduce(s1, { type: "TICK", now: T0 + 10_000 });
    const s3 = reduce(s2, { type: "FOREGROUND_RESYNC", now: T0 + 70_000 });
    expect(s3.wallClockLastTick).toBe(T0 + 70_000);
    // phase remains, but consumers compute new elapsed from phaseStartedAt → 70s
  });

  test("ABORT moves to aborted regardless of phase", () => {
    const s1 = reduce(initial, startAction());
    const s2 = reduce(s1, { type: "ADVANCE_PHASE", now: T0 + 60_000 });
    const s3 = reduce(s2, { type: "ABORT", now: T0 + 90_000 });
    expect(s3.phase).toBe("aborted");
    expect(s3.endedAt).toBe(T0 + 90_000);
  });

  test("COMPLETE only valid from decompression", () => {
    const s1 = reduce(initial, startAction());
    const sBadComplete = reduce(s1, { type: "COMPLETE", now: T0 + 1 });
    expect(sBadComplete.phase).toBe("pressurization"); // ignored
    const sToTreatment = reduce(s1, { type: "ADVANCE_PHASE", now: T0 + 60_000 });
    const sToDecomp = reduce(sToTreatment, { type: "ADVANCE_PHASE", now: T0 + 660_000 });
    const sDone = reduce(sToDecomp, { type: "COMPLETE", now: T0 + 720_000 });
    expect(sDone.phase).toBe("completed");
  });

  test("RESET returns to initial", () => {
    const s1 = reduce(initial, startAction());
    expect(reduce(s1, { type: "RESET" })).toEqual(initial);
  });
});
