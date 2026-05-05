import { describe, expect, test } from "vitest";
import * as schema from "../schema/index.js";

describe("protocol schemas", () => {
  test("protocols, userProtocols, hbotSessions exported", () => {
    expect(schema.protocols).toBeDefined();
    expect(schema.userProtocols).toBeDefined();
    expect(schema.hbotSessions).toBeDefined();
  });
});
