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
      "Missing database connection string.",
      "Add SUPABASE_DB_URL to .env.local from:",
      "Supabase Dashboard → Project Settings → Database → Connection string (URI)",
      "",
      "Then run: npm run setup:academy",
    ].join("\n")
  );
  process.exit(1);
}

const sqlPath = resolve(
  process.cwd(),
  "supabase/migrations/006_academy_progress.sql"
);
const sql = readFileSync(sqlPath, "utf8");

const client = new pg.Client({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  console.log("Connected. Applying academy tables migration…");
  await client.query(sql);
  console.log("Done — academy_learners and academy_module_progress are ready.");
} catch (error) {
  console.error("Migration failed:", error instanceof Error ? error.message : error);
  process.exit(1);
} finally {
  await client.end();
}
