import { describe, expect, test } from "vitest";
import { app } from "../../app.js";
import { createTestUser } from "../../__tests__/helpers/auth-fixture.js";

describe("suicidality screen", () => {
  test("POST /me/suicidality without auth → 401", async () => {
    const res = await app.request("/me/suicidality", {
      method: "POST",
      body: "{}",
      headers: { "content-type": "application/json" },
    });
    expect(res.status).toBe(401);
  });
  test("POST /me/suicidality with score 2 logs and returns 201", async () => {
    const { cookie } = await createTestUser();
    const res = await app.request("/me/suicidality", {
      method: "POST",
      headers: { cookie, "content-type": "application/json" },
      body: JSON.stringify({ score: 2, instrument: "phq9_item9", crisisShown: true }),
    });
    expect(res.status).toBe(201);
    const body = await res.json() as { score: number; crisisResourcesShown: boolean };
    expect(body.score).toBe(2);
    expect(body.crisisResourcesShown).toBe(true);
  });
  test("score out of range → 400", async () => {
    const { cookie } = await createTestUser();
    const res = await app.request("/me/suicidality", {
      method: "POST",
      headers: { cookie, "content-type": "application/json" },
      body: JSON.stringify({ score: 9, instrument: "phq9_item9", crisisShown: true }),
    });
    expect(res.status).toBe(400);
  });
});
