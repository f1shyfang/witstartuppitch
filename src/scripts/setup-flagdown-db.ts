import { readFileSync } from "node:fs";
import { join } from "node:path";
import postgres from "postgres";

import { env } from "~/env";

async function main() {
  const sqlPath = join(process.cwd(), "drizzle/flagdown-tables.sql");
  const ddl = readFileSync(sqlPath, "utf8");

  const db = postgres(env.DATABASE_URL, { prepare: false, max: 1 });
  await db.unsafe(ddl);
  await db.end();

  console.log("FlagDown tables ready");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
