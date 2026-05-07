import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { apiBaseUrl, cookieJar } from "../api/client";

WebBrowser.maybeCompleteAuthSession();

const RETURN_URL = Linking.createURL("auth/callback");

export type AppleSignInResult =
  | { ok: true }
  | { ok: false; reason: "cancel" | "dismiss" | "error"; message?: string };

export async function signInWithApple(): Promise<AppleSignInResult> {
  const url =
    `${apiBaseUrl}/api/auth/sign-in/social` +
    `?provider=apple&callbackURL=${encodeURIComponent(RETURN_URL)}`;
  try {
    const result = await WebBrowser.openAuthSessionAsync(url, RETURN_URL, {
      preferEphemeralSession: false,
    });
    if (result.type === "success") {
      const parsed = Linking.parse(result.url);
      const sessionToken = (parsed.queryParams?.session_token as string | undefined) ?? null;
      if (sessionToken) {
        await cookieJar.setRawSetCookieHeader(`better-auth.session_token=${sessionToken}; Path=/`);
      }
      return { ok: true };
    }
    if (result.type === "cancel") return { ok: false, reason: "cancel" };
    if (result.type === "dismiss") return { ok: false, reason: "dismiss" };
    return { ok: false, reason: "error" };
  } catch (e) {
    return { ok: false, reason: "error", message: e instanceof Error ? e.message : String(e) };
  }
}
