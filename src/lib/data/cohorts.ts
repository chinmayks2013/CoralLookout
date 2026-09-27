export type CohortId = "puerto-rico" | "caribbean" | "global";

export interface CohortOption {
  id: CohortId;
  label: string;
  region: string;
  welcomeTitle: string;
  welcomeBody: string;
}

export const COHORTS: CohortOption[] = [
  {
    id: "puerto-rico",
    label: "Puerto Rico Pilot",
    region: "Puerto Rico",
    welcomeTitle: "Bienvenidos — Puerto Rico Pilot",
    welcomeBody:
      "Your class is part of the Puerto Rico / Caribbean reef monitoring pilot. Scan local or coastal reef images, pin locations when you can, and help build a verified classroom dataset for educators and partners.",
  },
  {
    id: "caribbean",
    label: "Caribbean Cohort",
    region: "Caribbean",
    welcomeTitle: "Welcome — Caribbean Cohort",
    welcomeBody:
      "You're joining schools across the Caribbean tracking reef health together. Complete scans, share to the gallery when ready, and compete on the opt-in cohort leaderboard.",
  },
  {
    id: "global",
    label: "Global",
    region: "Global",
    welcomeTitle: "Welcome to Coral Lookout",
    welcomeBody:
      "Create your chapter, invite students with a join code, and run your first reef scan assignment.",
  },
];

export function getCohort(id: string | null | undefined): CohortOption | null {
  if (!id) return null;
  return COHORTS.find((c) => c.id === id) ?? null;
}

export const BOOK_PILOT_EMAIL =
  process.env.NEXT_PUBLIC_SCHOOL_SUPPORT_EMAIL ?? "schools@corallookout.org";

export const BOOK_PILOT_MAILTO = `mailto:${BOOK_PILOT_EMAIL}?subject=${encodeURIComponent(
  "Book a Coral Lookout pilot"
)}&body=${encodeURIComponent(
  "Hi Coral Lookout team,%0A%0AI'd like to book a classroom or partner pilot.%0A%0ASchool / org:%0ARole:%0APreferred start date:%0ACohort interest (Puerto Rico / Caribbean / other):%0A%0AThanks!"
)}`;

export const CALENDAR_BOOKING_URL =
  process.env.NEXT_PUBLIC_CALENDAR_BOOKING_URL?.trim() || null;
