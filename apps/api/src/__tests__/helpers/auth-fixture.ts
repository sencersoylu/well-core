import { auth } from "../../auth.js";
import { db } from "../../db/client.js";
import { authUser } from "../../db/schema/index.js";

/**
 * Sign a cookie value using HMAC-SHA256 to match Hono's serializeSigned()
 * (used internally by better-auth via setSignedCookie). Output: `value.<base64-sig>`.
 */
async function signCookieValue(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value),
  );
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
  return `${value}.${sigB64}`;
}

export async function createTestUser(): Promise<{ userId: string; cookie: string; email: string }> {
  // 1. Create the auth_user row
  const id = crypto.randomUUID();
  const email = `test-${id}@wellcore.test`;
  await db.insert(authUser).values({
    id,
    email,
    emailVerified: true,
  });

  // 2. Use better-auth's internalAdapter to create a session whose token format
  //    matches what better-auth expects in findSession().
  const ctx = await auth.$context;
  const session = await ctx.internalAdapter.createSession(id, undefined);
  if (!session) throw new Error("createTestUser: failed to create session");

  // 3. Sign the cookie value the same way better-auth does (via Hono setSignedCookie).
  const secret = ctx.secret;
  const signed = await signCookieValue(session.token, secret);
  // Cookie values may contain `=` from base64 padding — that's fine in a Cookie header
  // because we use URL-encoding on the value side to keep it parser-safe.
  const cookieValue = encodeURIComponent(signed);
  return {
    userId: id,
    email,
    cookie: `better-auth.session_token=${cookieValue}`,
  };
}
