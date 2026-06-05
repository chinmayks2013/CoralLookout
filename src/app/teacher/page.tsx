import { Suspense } from "react";
import { TeacherDashboardView } from "@/components/teacher/TeacherDashboardView";

export const metadata = {
  title: "Teacher Dashboard | Coral Lookout",
  description:
    "School Chapter teacher admin — roster, exports, private leaderboard, and $49/month subscription.",
};

export default function TeacherPage() {
  return (
    <Suspense
      fallback={
        <section className="mx-auto max-w-5xl px-4 py-12 text-center text-slate-400">
          Loading teacher dashboard…
        </section>
      }
    >
      <TeacherDashboardView />
    </Suspense>
  );
}
