import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { NextResponse } from "next/server";
import pg from "pg";

function verifyAdminSecret(request: Request): boolean {
  const expected = process.env.ADMIN_SECRET?.trim();
  if (!expected) return false;
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  return auth.slice(7) === expected;
}

export async function POST(request: Request) {
  if (!verifyAdminSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUrl =
    process.env.SUPABASE_DB_URL ??
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL;

  if (!dbUrl) {
    return NextResponse.json(
      {
        error:
          "Add SUPABASE_DB_URL to .env.local (Supabase → Settings → Database → URI), then retry.",
      },
      { status: 503 }
    );
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
    await client.query(sql);
    return NextResponse.json({ ok: true, message: "Academy tables created." });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Setup failed";
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await client.end();
  }
}
