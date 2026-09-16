/**
 * Applies pending SQL migrations to the Supabase database.
 *
 *   node scripts/db-migrate.mjs           # apply everything that is pending
 *   node scripts/db-migrate.mjs --dry-run # list what would be applied
 *   node scripts/db-migrate.mjs --seed    # also run supabase/seed.sql afterwards
 *
 * Needs SUPABASE_DB_URL in .env.local (Supabase dashboard → Settings → Database
 * → Connection string → URI). Applied versions are recorded the same way the
 * Supabase CLI records them, so both tools stay in sync.
 */
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import pg from "pg";

const MIGRATIONS_DIR = "supabase/migrations";

function readEnvFile(filePath) {
  try {
    return Object.fromEntries(
      readFileSync(filePath, "utf8")
        .split("\n")
        .filter((line) => line.includes("=") && !line.trim().startsWith("#"))
        .map((line) => [line.slice(0, line.indexOf("=")).trim(), line.slice(line.indexOf("=") + 1).trim()]),
    );
  } catch {
    return {};
  }
}

const env = { ...readEnvFile(".env.local"), ...process.env };
const connectionString = env.SUPABASE_DB_URL;
const dryRun = process.argv.includes("--dry-run");
const withSeed = process.argv.includes("--seed");

if (!connectionString) {
  console.error(
    "Missing SUPABASE_DB_URL in .env.local.\n" +
      "Supabase dashboard → Settings → Database → Connection string → URI.",
  );
  process.exit(1);
}

const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });
await client.connect();

try {
  await client.query("create schema if not exists supabase_migrations");
  await client.query(
    "create table if not exists supabase_migrations.schema_migrations (version text primary key, statements text[], name text)",
  );

  const { rows } = await client.query("select version from supabase_migrations.schema_migrations");
  const applied = new Set(rows.map((row) => row.version));

  const files = readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  let count = 0;

  for (const file of files) {
    const version = file.split("_")[0];
    if (applied.has(version)) continue;

    const sql = readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");

    // The first migration may have been applied by hand before this script
    // existed: record it instead of failing on objects that already exist.
    const { rows: existing } = await client.query("select to_regclass('public.services') as table_name");
    if (existing[0]?.table_name && file.includes("initial_schema")) {
      if (!dryRun) {
        await client.query(
          "insert into supabase_migrations.schema_migrations (version, name) values ($1, $2) on conflict do nothing",
          [version, file],
        );
      }
      console.log(`= ${file} (already present, recorded as applied)`);
      continue;
    }

    if (dryRun) {
      console.log(`~ ${file} (would apply)`);
      continue;
    }

    await client.query("begin");
    try {
      await client.query(sql);
      await client.query(
        "insert into supabase_migrations.schema_migrations (version, name) values ($1, $2)",
        [version, file],
      );
      await client.query("commit");
      console.log(`+ ${file} applied`);
      count += 1;
    } catch (error) {
      await client.query("rollback");
      console.error(`✗ ${file} failed: ${error.message}`);
      process.exit(1);
    }
  }

  if (withSeed && !dryRun) {
    await client.query(readFileSync("supabase/seed.sql", "utf8"));
    console.log("+ seed.sql applied");
  }

  console.log(dryRun ? "Dry run finished." : `Done. ${count} migration(s) applied.`);
} finally {
  await client.end();
}
