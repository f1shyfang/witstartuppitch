import postgres from "postgres";

import { NB_BEACHES } from "~/flagdown/constants/beaches";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  const sql = postgres(databaseUrl, { prepare: false, max: 1 });

  for (const beach of NB_BEACHES) {
    await sql`
      INSERT INTO witstartuppitch_beach (
        id, name, lat, lng, "patrolType", "councilLga", "slsClub", "flagStatus", "threatLevel", "createdAt"
      ) VALUES (
        ${beach.id},
        ${beach.name},
        ${beach.lat},
        ${beach.lng},
        ${beach.patrolType},
        ${beach.councilLga},
        ${beach.slsClub},
        'green',
        0,
        now()
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        lat = EXCLUDED.lat,
        lng = EXCLUDED.lng,
        "patrolType" = EXCLUDED."patrolType"
    `;
  }

  await sql.end();
  console.log(`Seeded ${NB_BEACHES.length} beaches`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
