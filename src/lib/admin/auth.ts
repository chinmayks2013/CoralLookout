export type AdminAuthResult =
  | { ok: true }
  | { ok: false; status: 401 | 503; error: string };

export function verifyAdminRequest(request: Request): AdminAuthResult {
  const expected = process.env.ADMIN_SECRET?.trim();
  if (!expected) {
    return {
      ok: false,
      status: 503,
      error:
        "ADMIN_SECRET is not set on the server. Add it to .env.local, restart npm run dev, or add it on Vercel and redeploy.",
    };
  }

  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return {
      ok: false,
      status: 401,
      error: "Enter the admin secret on this page — it must match ADMIN_SECRET in server env.",
    };
  }

  if (auth.slice(7) !== expected) {
    return {
      ok: false,
      status: 401,
      error: "Wrong admin secret. Use the exact value from ADMIN_SECRET in .env.local.",
    };
  }

  return { ok: true };
}
