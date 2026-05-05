import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { ServerEnvSchema } from "@wellcore/shared";
import { db } from "./db/client.js";
import * as schema from "./db/schema/index.js";

const env = ServerEnvSchema.parse(process.env);

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.authUser,
      session: schema.authSession,
      account: schema.authAccount,
      verification: schema.authVerification,
    },
  }),
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [env.PUBLIC_BASE_URL, "wellcore://"],
  socialProviders: {
    apple: {
      clientId: env.APPLE_CLIENT_ID,
      clientSecret: "",
      teamId: env.APPLE_TEAM_ID,
      keyId: env.APPLE_KEY_ID,
      privateKey: env.APPLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    },
  },
  advanced: {
    cookies: {
      sessionToken: {
        attributes: {
          httpOnly: true,
          secure: env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
        },
      },
    },
  },
});

export type AuthSession = typeof auth.$Infer.Session;
