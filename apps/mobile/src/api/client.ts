import { hc } from "hono/client";
import type { AppType } from "@wellcore/api";
import Constants from "expo-constants";

const baseUrl = process.env.EXPO_PUBLIC_API_URL
  ?? Constants.expoConfig?.hostUri?.replace(/:\d+$/, ":3000")
  ?? "http://localhost:3000";

export const api = hc<AppType>(baseUrl);
