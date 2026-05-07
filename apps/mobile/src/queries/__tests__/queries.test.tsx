import { describe, expect, test, vi } from "vitest";

vi.mock("../../api/client", () => ({
  api: {
    protocols: {
      $get: vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [{ id: "p1", slug: "hard-2-0-clinical", pressureAta: "2.00", treatmentMin: 80, totalMin: 90, goalIds: ["recovery"], targetSessionCount: 40, name: { "en-US": "Hard 2.0 ATA" }, description: null }],
      }),
      ":slug": {
        $get: vi.fn(),
      },
    },
    me: {
      protocols: {
        $get: vi.fn(),
        $post: vi.fn(),
      },
    },
  },
}));

import { useProtocols } from "../useProtocols";
import { useProtocol } from "../useProtocol";
import { useUserProtocols } from "../useUserProtocols";
import { useStartProtocol } from "../useStartProtocol";
import { qk } from "../keys";

describe("query keys", () => {
  test("protocols key", () => {
    expect(qk.protocols()).toEqual(["protocols"]);
  });

  test("protocol slug key", () => {
    expect(qk.protocol("hard-2-0-clinical")).toEqual(["protocols", "hard-2-0-clinical"]);
  });

  test("userProtocols key", () => {
    expect(qk.userProtocols()).toEqual(["me", "protocols"]);
  });
});

describe("useProtocols", () => {
  test("is a function", () => {
    expect(typeof useProtocols).toBe("function");
  });
});

describe("useProtocol", () => {
  test("is a function", () => {
    expect(typeof useProtocol).toBe("function");
  });
});

describe("useUserProtocols", () => {
  test("is a function", () => {
    expect(typeof useUserProtocols).toBe("function");
  });
});

describe("useStartProtocol", () => {
  test("is a function", () => {
    expect(typeof useStartProtocol).toBe("function");
  });
});
