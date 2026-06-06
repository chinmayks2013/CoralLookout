# Coral Lookout

**Using AI and student innovation to help protect coral reefs worldwide.**

> **For judges:** This README is your quick guide to evaluating the project. Start with the [3-minute demo](#3-minute-demo-for-judges) below, or open the in-app judge page at **`/pitch`** when hackathon mode is enabled.

| | |
|---|---|
| **Repository** | [github.com/chinmayks2013/CoralLookout](https://github.com/chinmayks2013/CoralLookout) |
| **Stack** | Next.js 16 · React 19 · Supabase · Stripe · Leaflet |
| **Tracks** | Climate · AI · Education |

---

## The Problem

Coral reefs are dying faster than scientists can monitor them. Students and schools want to help, but most tools either require expensive equipment or stop at awareness — they don't turn curiosity into **shared, measurable data**.

## Our Solution

**Coral Lookout** is a global platform where any student can:

1. **Scan** a reef photo with AI and get an instant health assessment
2. **Publish** results to a community gallery that every user can see
3. **Pin** observations on a live global reef map alongside NOAA research sites
4. **Learn** through Reef Academy lessons and gamified challenges
5. **Compete** via school chapters with teacher dashboards and class leaderboards

One upload flows through the entire platform — scan → gallery post → map pin → class points.

## Impact

- Turns classroom reef projects into **crowdsourced monitoring data**
- Makes conservation **accessible** to any student with a phone and internet
- Builds a **student-driven network** that scales with school adoption, not lab budgets
- Sustainable via a freemium model: free for students, paid School Chapter tier for teachers

---

## 3-Minute Demo (for judges)

Follow this path to see the full product loop. Each step maps to a live route in the app.

| Step | Route | What to show | ~Time |
|------|-------|--------------|-------|
| 1 | [`/scanner`](http://localhost:3000/scanner) | Upload a reef image → health score, confidence, damage zones, and educational recommendations | 45s |
| 2 | [`/gallery`](http://localhost:3000/gallery) | Community posts, upvotes, comments, and creator leaderboard | 30s |
| 3 | [`/map`](http://localhost:3000/map) | Interactive global map — student scans + research hotspots | 30s |
| 4 | [`/class`](http://localhost:3000/class) | Students join with a code; class leaderboard and missions | 45s |
| 5 | [`/academy`](http://localhost:3000/academy) | Lessons on coral biology, bleaching, and conservation tech | 30s |

**Bonus routes for deeper review:**

| Route | Purpose |
|-------|---------|
| [`/pitch`](http://localhost:3000/pitch) | Judge-facing overview with problem, solution, impact, and demo path |
| [`/teacher`](http://localhost:3000/teacher) | Teacher dashboard — create chapter, manage roster, export CSV |
| [`/compete`](http://localhost:3000/compete) | Points, badges, streaks, and global rankings |
| [`/challenges`](http://localhost:3000/challenges) | Weekly conservation missions |
| [`/research`](http://localhost:3000/research) | Bleaching trends and reef health analytics |
| [`/business`](http://localhost:3000/business) | Pricing tiers and revenue model |

---

## What Works Without Extra Setup

Judges can evaluate the core experience immediately after `npm install && npm run dev`:

| Feature | Works out of the box? |
|---------|----------------------|
| AI Coral Scanner | ✅ Yes — client-side analysis, no API keys needed |
| Homepage, Academy, Challenges, Compete | ✅ Yes |
| Global Reef Map | ✅ Yes — includes demo markers and research sites |
| Hackathon pitch page (`/pitch`) | ✅ Yes — set `NEXT_PUBLIC_HACKATHON_MODE=true` |
| Teacher dashboard (`/teacher`) | ✅ Yes — demo mode enabled by default (`SCHOOL_DEMO_MODE=true`) |
| Reef Gallery (shared posts) | ⚙️ Requires Supabase (see below) |
| Stripe School subscriptions | ⚙️ Optional — demo mode bypasses Stripe |

---

## Quick Start (local review)

```bash
git clone https://github.com/chinmayks2013/CoralLookout.git
cd CoralLookout
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → go to **`/pitch`** or start at **`/scanner`**.

### Optional: enable shared gallery (Supabase)

The gallery persists posts across all users (not browser-only storage).

1. Create a free project at [supabase.com](https://supabase.com)
2. Copy `.env.example` → `.env.local` and set `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
3. Run `supabase/schema.sql` in the Supabase SQL Editor
4. Create a **public** Storage bucket named `gallery`
5. Restart the dev server

---

## Architecture

```
Student uploads photo
       │
       ▼
  /scanner  ──►  AI health analysis (client-side heuristics)
       │
       ├──►  /gallery  ──►  Supabase (posts, comments, upvotes, views)
       │
       ├──►  /map      ──►  Leaflet map (scan pins + NOAA research sites)
       │
       └──►  /class    ──►  School chapter leaderboard (Supabase + join codes)

Teachers ──►  /teacher  ──►  Roster, exports, Stripe subscription ($49/mo)
```

**Tech stack**

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS 4, Framer Motion
- **Map:** Leaflet / react-leaflet
- **Database & storage:** Supabase (PostgreSQL + object storage)
- **Payments:** Stripe (School Chapter tier)
- **Deploy target:** Vercel

---

## Business Model

Free for all students. Revenue from institutions and partners:

| Tier | Price | Audience |
|------|-------|----------|
| **Coral Enthusiast** | Free | All students — scanner, academy, gallery, map |
| **School Chapter** | $49/mo | Teachers — dashboard, roster, CSV export, private leaderboard |
| **Research & NGO** | Custom | Annual partnerships for data access and co-branded programs |

See [`/business`](http://localhost:3000/business) for full details.

---

## AI Scanner — honest note for judges

The current scanner uses **client-side color heuristics** to classify reef health (healthy, mild stress, bleaching, severe damage). This keeps the demo fast, offline-capable, and free of API costs.

For production, the architecture is ready to swap in a trained model (Teachable Machine, Hugging Face, or a custom CNN). The UI already surfaces confidence scores, damage zones, and educational recommendations — only the inference backend would change.

---

## What's Built vs. What's Next

**Built (this submission)**

- Full multi-page platform with 15+ routes
- End-to-end scan → gallery → map → leaderboard flow
- School chapter system with teacher dashboard and join codes
- Gamification: points, badges, challenges, streaks
- Reef Academy with structured lessons
- Research dashboard with bleaching analytics
- Hackathon judge page at `/pitch`
- Supabase schema and migrations for gallery + schools

**Phase 2 (post-hackathon)**

- Supabase Auth for verified student accounts
- Production ML model (Teachable Machine, Hugging Face, or custom CNN)
- Live ocean temperature APIs and mobile app
- Global inter-school competitions

---

## Environment Variables

See [`.env.example`](.env.example) for the full list. Key variables:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_HACKATHON_MODE` | Enables judge pitch page and demo banner |
| `NEXT_PUBLIC_HACKATHON_NAME` | Hackathon name shown on `/pitch` |
| `NEXT_PUBLIC_HACKATHON_TEAM` | Your team name |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (gallery + schools) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side uploads (keep secret) |
| `SCHOOL_DEMO_MODE` | Full teacher dashboard without Stripe (default: on) |
| `STRIPE_*` | School Chapter billing (optional for demo) |

---

## Team

**Coral Lookout Team**

Built for hackathon judges who care about climate, AI, and education. Customize team name and links via `.env.local`:

```
NEXT_PUBLIC_HACKATHON_TEAM=Your Team Name
NEXT_PUBLIC_HACKATHON_GITHUB=https://github.com/chinmayks2013/CoralLookout
NEXT_PUBLIC_HACKATHON_DEVPOST=https://devpost.com/...
NEXT_PUBLIC_HACKATHON_VIDEO=https://youtube.com/...
```

---

## License

MIT — built to help protect coral reefs worldwide.
