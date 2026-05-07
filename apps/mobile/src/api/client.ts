import { hc } from "hono/client";
import type { AppType } from "@wellcore/api";
import Constants from "expo-constants";
import { createCookieJar, type CookieJar } from "./cookie-jar";

const baseUrl =
  process.env.EXPO_PUBLIC_API_URL ??
  Constants.expoConfig?.hostUri?.replace(/:\d+$/, ":3000") ??
  "http://localhost:3000";

export const cookieJar: CookieJar = createCookieJar();

const authedFetch = async (input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> => {
  const headers = new Headers(init.headers ?? {});
  await cookieJar.attachCookies(headers);
  const res = await fetch(input, { ...init, headers, credentials: "omit" });
  const setCookie = res.headers.get("set-cookie");
  if (setCookie) await cookieJar.setRawSetCookieHeader(setCookie);
  return res;
};

export const api = hc<AppType>(baseUrl, { fetch: authedFetch });
export const apiBaseUrl = baseUrl;
