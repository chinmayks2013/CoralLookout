/**
 * Apply full Supabase schema (gallery tables + storage bucket + academy).
 * Requires SUPABASE_DB_URL in .env.local (Database → Connection string URI).
 * Run: npm run setup:gallery
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });
dotenv.config();

const dbUrl =
  process.env.SUPABASE_DB_URL ??
  process.env.DATABASE_URL ??
  process.env.POSTGRES_URL;

if (!dbUrl) {
  console.error(
    [
      "Missing SUPABASE_DB_URL in .env.local.",
      "",
      "Get it from: Supabase Dashboard → Project Settings → Database → Connection string (URI)",
      "",
      "Or paste supabase/schema.sql manually in Supabase → SQL Editor.",
    ].join("\n")
  );
  process.exit(1);
}

const sqlPath = resolve(process.cwd(), "supabase/schema.sql");
const sql = readFileSync(sqlPath, "utf8");

const client = new pg.Client({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  console.log("Connected. Applying supabase/schema.sql …");
  await client.query(sql);
  console.log("Done — gallery tables, storage bucket, and academy tables are ready.");
  console.log("Run: npm run check:gallery");
} catch (error) {
  console.error("Setup failed:", error instanceof Error ? error.message : error);
  process.exit(1);
} finally {
  await client.end();
}
