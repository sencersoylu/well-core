import { describe, expect, test, vi } from "vitest";

vi.mock("../../api/client", () => ({
  api: {
    sessions: {
      $post: vi.fn(),
      ":id": { $patch: vi.fn() },
    },
    me: {
      sessions: { $get: vi.fn() },
      checkins: { $get: vi.fn() },
      achievements: { $get: vi.fn() },
    },
    checkins: { $post: vi.fn() },
    citations: { $get: vi.fn() },
    privacy: { dsar: { $post: vi.fn() } },
  },
}));

import { useSessions } from "../useSessions";
import { useCreateSession } from "../useCreateSession";
import { useUpdateSession } from "../useUpdateSession";
import { useCheckins } from "../useCheckins";
import { useCreateCheckin } from "../useCreateCheckin";
import { useAchievements } from "../useAchievements";
import { useCitations } from "../useCitations";
import { useDsar } from "../useDsar";

describe("query hooks structural", () => {
  test("all 8 hooks exported as functions", () => {
    for (const fn of [useSessions, useCreateSession, useUpdateSession, useCheckins, useCreateCheckin, useAchievements, useCitations, useDsar]) {
      expect(typeof fn).toBe("function");
    }
  });
});
