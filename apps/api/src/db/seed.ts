import { sql } from "drizzle-orm";
import { db } from "./client.js";

async function main() {
  console.log("Seeding protocols (placeholder; expanded in Task 9)…");
  await db.execute(sql`SELECT 1`);
  console.log("ok");
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
