# Deploy Coral Lookout (production cloud features)

Gallery, forum, school leaderboard, teacher insights, and **sign-in** **require env vars on Vercel** — `.env.local` only works on localhost.

## Step 1 — Vercel environment variables

1. Open [vercel.com](https://vercel.com) → your **CoralLookout** project  
2. **Settings → Environment Variables**  
3. Add these for **Production**, **Preview**, and **Development**:

| Variable | Example / notes |
|----------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://kxpwvqhyhivfuinufoog.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → **anon public** |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → **service_role** (secret) |
| `NEXT_PUBLIC_APP_URL` | `https://your-live-domain.com` |

**Important:** Variable names must match exactly (including `NEXT_PUBLIC_` prefix on URL and anon key).

## Step 2 — Redeploy (required)

Saving env vars is **not enough**. You must redeploy:

**Deployments → latest deployment → ⋮ menu → Redeploy**

`NEXT_PUBLIC_*` values are baked in at build time. Without redeploy, sign-in and gallery stay broken on the live site even if vars look correct in settings.

## Step 3 — Verify on your live site

Open these URLs (replace with your domain):

| URL | Expected |
|-----|----------|
| `https://your-site.com/api/auth/config` | `"ready": true` |
| `https://your-site.com/api/health` | `"authReady": true`, `"galleryReady": true` |
| `https://your-site.com/login` | Email + Google sign-in form (not setup error) |

If `/api/auth/config` shows `"missing": ["NEXT_PUBLIC_SUPABASE_ANON_KEY"]`, that var is not on Vercel for Production — add it and redeploy again.

## Step 4 — Supabase Auth providers

In Supabase Dashboard → **Authentication → Providers**:

- **Email** — enable (turn off “Confirm email” for easier testing)
- **Google** — enable + add Google OAuth credentials

**Authentication → URL Configuration:**

- Site URL: `https://your-live-domain.com`
- Redirect URLs: `https://your-live-domain.com/auth/callback`

## Step 5 — Database (one time)

Run in **Supabase → SQL Editor** (in order):

- `supabase/schema.sql`
- `supabase/migrations/007_user_scans.sql` (saved scans)
- `supabase/migrations/008_sales_sprint.sql` (cohorts, assignments, provenance, flags, partner leads, co-teachers)

Or locally: `npm run setup:gallery` (needs `SUPABASE_DB_URL` in `.env.local`)

## Optional sales-sprint env vars

| Variable | Notes |
|----------|-------|
| `STRIPE_SCHOOL_PRICE_ID` | Monthly School Chapter price |
| `STRIPE_SCHOOL_ANNUAL_PRICE_ID` | Founding annual prepaid price |
| `SCHOOL_DEMO_MODE` | Set `false` for real paid teachers when Stripe is configured |
| `NEXT_PUBLIC_SCHOOL_SUPPORT_EMAIL` | Book-a-pilot / support inbox |
| `NEXT_PUBLIC_CALENDAR_BOOKING_URL` | Partner inquiry auto-reply calendar link |
| `PARTNER_API_KEY` | Private partner API preview (`x-api-key`) |
| `ADMIN_SECRET` | `/admin/metrics` + moderation queue |

## Uptime check

Point your monitor at `GET /api/health` and assert JSON `"ok": true`.

## Verify locally

```bash
npm run check:gallery
npm run dev
```

## GitHub Pages

GitHub Pages **cannot** run Next.js API routes. Use **Vercel** for gallery, forum, login, and leaderboard.
