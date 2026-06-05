# Coral Lookout

**Using AI and student innovation to help protect coral reefs worldwide.**

A global AI-powered platform for monitoring coral reef health, detecting bleaching, educating students, and building the world's largest student-driven reef conservation network.

## Features

- **Homepage** — Mission-driven hero with animated ocean visuals
- **AI Coral Scanner** — Upload reef images for health analysis, confidence scores, damage zones, and educational insights
- **Global Reef Map** — Interactive map with uploads, hotspots, restoration projects, and student activity
- **Student Competitions** — Points, badges, rankings, and streaks
- **Reef Academy** — Lessons on coral biology, bleaching, climate science, and conservation tech
- **Challenges & Missions** — Weekly conservation missions and STEM contests
- **Research Dashboard** — Bleaching trends and reef health analytics
- **Community** — School chapters, teams, and collaboration

## Tech Stack

- [Next.js](https://nextjs.org) 16 (App Router)
- [React](https://react.dev) 19
- [Tailwind CSS](https://tailwindcss.com) 4
- [Framer Motion](https://www.framer.com/motion/) — animations
- [Leaflet](https://leafletjs.com) / [react-leaflet](https://react-leaflet.js.org) — global map
- Deploy on [Vercel](https://vercel.com)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Reef Gallery (required for shared posts)

The gallery uses **Supabase** so every user sees the same posts and comments (not browser-only storage).

1. Create a project at [supabase.com](https://supabase.com)
2. Copy `.env.example` → `.env.local` and set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (optional for future client features)
   - `SUPABASE_SERVICE_ROLE_KEY` (server uploads; keep secret)
3. In Supabase **SQL Editor**, run the full script in `supabase/schema.sql`
4. In **Storage**, create a **public** bucket named `gallery`
5. Restart `npm run dev`

Deploying to Vercel: add the same env vars in Project Settings → Environment Variables.

## Business model

See **`/business`** for pricing tiers and **`/teacher`** for the School Chapter dashboard ($49/mo):

- **Coral Enthusiast** — free for all students
- **School Chapter** — Stripe subscription; teacher dashboard, roster, CSV exports, private leaderboard
- **Research & NGO** — custom annual partnerships

### School Chapter setup

1. Run `supabase/migrations/005_school_chapters.sql` in the SQL Editor
2. Create a Stripe product at $49/month and set `STRIPE_SCHOOL_PRICE_ID`
3. Add webhook endpoint `https://YOUR_DOMAIN/api/school/webhook` for events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Teachers open **`/teacher`** → create chapter → Subscribe

## Next Steps (Phase 2+)

- Supabase Auth for verified student accounts
- Replace demo scanner with **Teachable Machine** or **Hugging Face** models
- Live ocean data APIs and mobile app
- School programs and global competitions

## AI Scanner Note

The current scanner uses client-side color heuristics for demo purposes. For production, integrate a trained coral health model.
