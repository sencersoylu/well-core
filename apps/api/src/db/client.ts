import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { ServerEnvSchema } from "@wellcore/shared/env";
import * as schema from "./schema/index.js";

const env = ServerEnvSchema.parse(process.env);

const queryClient = postgres(env.DATABASE_URL, { max: 10 });

export const db = drizzle(queryClient, { schema, logger: env.NODE_ENV === "development" });
export type DB = typeof db;
