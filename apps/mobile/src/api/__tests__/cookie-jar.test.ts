import { describe, expect, test, beforeEach } from "vitest";
import { createCookieJar } from "../cookie-jar";
import { __reset } from "../../test/mocks/expo-secure-store";

beforeEach(() => __reset());

describe("cookie jar", () => {
  test("attachCookies reads stored cookie and sets the cookie header", async () => {
    const jar = createCookieJar();
    await jar.setRawSetCookieHeader("better-auth.session_token=abc123; Path=/; HttpOnly");
    const headers = await jar.attachCookies(new Headers());
    expect(headers.get("cookie")).toBe("better-auth.session_token=abc123");
  });

  test("captureSetCookies merges multiple cookies and persists", async () => {
    const jar = createCookieJar();
    await jar.captureSetCookies(["a=1; Path=/", "b=2; Path=/"]);
    const headers = await jar.attachCookies(new Headers());
    expect(headers.get("cookie")).toMatch(/a=1/);
    expect(headers.get("cookie")).toMatch(/b=2/);
  });

  test("clear() wipes the persisted cookie jar", async () => {
    const jar = createCookieJar();
    await jar.setRawSetCookieHeader("x=1");
    await jar.clear();
    const headers = await jar.attachCookies(new Headers());
    expect(headers.get("cookie")).toBeNull();
  });

  test("Max-Age=0 / Expires in past removes the cookie", async () => {
    const jar = createCookieJar();
    await jar.setRawSetCookieHeader("x=1");
    await jar.setRawSetCookieHeader("x=; Max-Age=0");
    const headers = await jar.attachCookies(new Headers());
    expect(headers.get("cookie")).toBeNull();
  });
});
