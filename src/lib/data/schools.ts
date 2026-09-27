import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  FileSpreadsheet,
  ShieldCheck,
  Trophy,
  Camera,
} from "lucide-react";

export interface SchoolBenefit {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface SchoolFaqItem {
  question: string;
  answer: string;
}

export interface DemoStep {
  id: string;
  label: string;
  description: string;
  href: string;
}

export interface SchoolTestimonial {
  quote: string;
  name: string;
  role: string;
  school: string;
  placeholder: true;
}

export const SCHOOLS_TAGLINE =
  "A reef-monitoring program your students will actually finish — with a dashboard teachers trust and data schools can stand behind.";

export const SCHOOL_BENEFITS: SchoolBenefit[] = [
  {
    icon: LayoutDashboard,
    title: "Teacher dashboard",
    description:
      "One place to create your chapter, share a join code, and see who has scanned, posted, or completed lessons.",
  },
  {
    icon: Users,
    title: "Bulk, code-based onboarding",
    description:
      "Students sign in and enter a single join code — no manual roster entry, no per-student setup.",
  },
  {
    icon: FileSpreadsheet,
    title: "Grading-ready exports",
    description:
      "Download a CSV of class activity for grading, attendance, or reporting without screenshotting a leaderboard.",
  },
  {
    icon: Trophy,
    title: "Private chapter leaderboard",
    description:
      "A leaderboard scoped to your class or school — not the entire internet — to keep competition healthy.",
  },
  {
    icon: ShieldCheck,
    title: "Built with student privacy in mind",
    description:
      "Minimal data collection, no ads, and clear rules for gallery photo sharing. See the full privacy summary.",
  },
  {
    icon: Camera,
    title: "Real AI reef scanning",
    description:
      "Students scan real or practice reef images and get a health read-out — a hands-on hook for marine science units.",
  },
];

export const DEMO_PATH: DemoStep[] = [
  {
    id: "scanner",
    label: "1. Try the scanner",
    description:
      "See what a student sees: drop a reef photo and get an instant AI health read-out.",
    href: "/scanner",
  },
  {
    id: "teacher",
    label: "2. Set up a chapter",
    description:
      "Create a free demo chapter and get a join code in under a minute — no payment required to explore.",
    href: "/teacher",
  },
  {
    id: "class",
    label: "3. See the student view",
    description:
      "Preview the join-class flow students use to connect to your chapter with the join code.",
    href: "/class",
  },
];

export const SCHOOLS_FAQS: SchoolFaqItem[] = [
  {
    question: "Do students need to pay or create separate accounts?",
    answer:
      "No. Students sign in once, then join your chapter with a single join code. Coral Enthusiast access is always free.",
  },
  {
    question: "What does the school pay for?",
    answer:
      "The School Chapter tier covers the teacher dashboard, roster tools, exports, and a private leaderboard — not student access itself.",
  },
  {
    question: "Can we try it before paying?",
    answer:
      "Yes. Demo mode unlocks the full teacher dashboard so you can evaluate the workflow before subscribing or booking a pilot.",
  },
  {
    question: "What about student data and privacy?",
    answer:
      "We collect the minimum needed to run a classroom program. See our privacy & student-data summary for exactly what is (and isn't) collected.",
  },
];

// Quote pending customer approval — do not publish until Courtney signs off.
export const COURTNEY_TESTIMONIAL: SchoolTestimonial = {
  quote:
    "Placeholder quote — pending Courtney's approval before publishing.",
  name: "Courtney",
  role: "Educator (pilot partner)",
  school: "School name pending",
  placeholder: true,
};
