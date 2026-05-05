import { describe, expect, test } from "vitest";
import { app } from "../app.js";
import { createTestUser } from "./helpers/auth-fixture.js";

describe("authed happy paths", () => {
  test("GET /auth/me returns user", async () => {
    const { cookie, userId } = await createTestUser();
    const res = await app.request("/auth/me", { headers: { cookie } });
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.user.id).toBe(userId);
  });

  test("PUT /profile then GET /profile round-trips", async () => {
    const { cookie } = await createTestUser();
    const put = await app.request("/profile", {
      method: "PUT",
      headers: { cookie, "content-type": "application/json" },
      body: JSON.stringify({ displayName: "Sencer", chamberType: "soft_1_3", goals: ["recovery", "wellness"] }),
    });
    expect(put.status).toBe(200);
    const get = await app.request("/profile", { headers: { cookie } });
    const body = await get.json() as any;
    expect(body.displayName).toBe("Sencer");
    expect(body.goals).toEqual(["recovery", "wellness"]);
  });

  test("POST /sessions then PATCH /sessions/:id", async () => {
    const { cookie } = await createTestUser();
    const create = await app.request("/sessions", {
      method: "POST",
      headers: { cookie, "content-type": "application/json" },
      body: JSON.stringify({ pressureAta: 1.3 }),
    });
    expect(create.status).toBe(201);
    const session = await create.json() as any;
    const patch = await app.request(`/sessions/${session.id}`, {
      method: "PATCH",
      headers: { cookie, "content-type": "application/json" },
      body: JSON.stringify({ status: "completed", totalDurationSec: 3600, treatmentDurationSec: 3000 }),
    });
    expect(patch.status).toBe(200);
    const updated = await patch.json() as any;
    expect(updated.status).toBe("completed");
  });

  test("POST /checkins inserts structured PROMIS row", async () => {
    const { cookie } = await createTestUser();
    const res = await app.request("/checkins", {
      method: "POST",
      headers: { cookie, "content-type": "application/json" },
      body: JSON.stringify({
        checkinType: "pre",
        promisGlobalPhysical: 4, promisGlobalMental: 4,
        painLevel: 2, energyLevel: 7, sleepQuality: 6, focusLevel: 7,
      }),
    });
    expect(res.status).toBe(201);
  });

  test("POST /uploads/presign returns url + publicUrl", async () => {
    const { cookie } = await createTestUser();
    const res = await app.request("/uploads/presign", {
      method: "POST",
      headers: { cookie, "content-type": "application/json" },
      body: JSON.stringify({ bucket: "avatars", contentType: "image/png", byteLength: 12345, ext: "png" }),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.url).toMatch(/^https?:\/\//);
    expect(body.publicUrl).toMatch(/^https?:\/\//);
  });

  test("AppType export contains chained routes", () => {
    type T = typeof app;
    const _t: T = app;
    expect(_t).toBeDefined();
  });
});
