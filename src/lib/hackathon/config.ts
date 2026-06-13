export interface HackathonDemoStep {
  step: number;
  title: string;
  hook: string;
  href: string;
  duration: string;
}

export interface HackathonConfig {
  enabled: boolean;
  name: string;
  track: string;
  tagline: string;
  teamLabel: string;
  githubUrl: string | null;
  devpostUrl: string | null;
  videoUrl: string | null;
  problem: string;
  solution: string;
  impact: string;
  demoSteps: HackathonDemoStep[];
  techStack: string[];
  tracks: string[];
}

const DEFAULT_DEMO_STEPS: HackathonDemoStep[] = [
  {
    step: 1,
    title: "AI reef pipeline",
    hook: "Upload a photo → 6-step coral-saving pipeline (classify, localize, conserve) traced in W&B.",
    href: "/scanner",
    duration: "45s",
  },
  {
    step: 2,
    title: "Community gallery",
    hook: "Publish scans, earn corals from views, comments, and upvotes.",
    href: "/gallery",
    duration: "30s",
  },
  {
    step: 3,
    title: "Global map",
    hook: "Every scan pins to the map — student observations + NOAA research sites.",
    href: "/map",
    duration: "30s",
  },
  {
    step: 4,
    title: "School class",
    hook: "Teacher dashboard + students join with a code → private class leaderboard.",
    href: "/class",
    duration: "45s",
  },
  {
    step: 5,
    title: "Learn & compete",
    hook: "Academy lessons, challenges, and points — gamified conservation.",
    href: "/academy",
    duration: "30s",
  },
];

export function isHackathonMode(): boolean {
  if (process.env.NEXT_PUBLIC_HACKATHON_MODE === "false") return false;
  if (process.env.NEXT_PUBLIC_HACKATHON_MODE === "true") return true;
  return Boolean(process.env.NEXT_PUBLIC_HACKATHON_NAME?.trim());
}

export function getHackathonConfig(): HackathonConfig {
  const name =
    process.env.NEXT_PUBLIC_HACKATHON_NAME?.trim() || "Hackathon Demo";
  const track =
    process.env.NEXT_PUBLIC_HACKATHON_TRACK?.trim() ||
    "Climate · AI · Education";

  return {
    enabled: isHackathonMode(),
    name,
    track,
    tagline:
      process.env.NEXT_PUBLIC_HACKATHON_TAGLINE?.trim() ||
      "Student-driven reef monitoring — scan, map, learn, and compete in one platform.",
    teamLabel:
      process.env.NEXT_PUBLIC_HACKATHON_TEAM?.trim() || "Coral Lookout Team",
    githubUrl: process.env.NEXT_PUBLIC_HACKATHON_GITHUB?.trim() || null,
    devpostUrl: process.env.NEXT_PUBLIC_HACKATHON_DEVPOST?.trim() || null,
    videoUrl: process.env.NEXT_PUBLIC_HACKATHON_VIDEO?.trim() || null,
    problem:
      "Coral reefs are dying faster than scientists can monitor them. Students want to help but lack tools that turn curiosity into real data.",
    solution:
      "Coral Lookout combines AI reef analysis, a live community gallery, global mapping, and school chapters so any student can contribute measurable conservation impact.",
    impact:
      "One upload becomes a map pin, a gallery post, and class leaderboard points — turning classroom projects into a worldwide reef monitoring network.",
    demoSteps: DEFAULT_DEMO_STEPS,
    techStack: [
      "Next.js 16",
      "React 19",
      "Supabase",
      "Weights & Biases",
      "Sharp",
      "Tailwind CSS 4",
      "Leaflet",
      "Framer Motion",
    ],
    tracks: track.split(/[·|,]/).map((t) => t.trim()).filter(Boolean),
  };
}
