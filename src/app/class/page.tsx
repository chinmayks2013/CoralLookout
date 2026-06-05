import { StudentClassView } from "@/components/class/StudentClassView";

export const metadata = {
  title: "My Class | Coral Lookout",
  description: "Join your school class and see classmates and the class leaderboard.",
};

export default function ClassPage() {
  return <StudentClassView />;
}
