import { AdminMetricsView } from "@/components/admin/AdminMetricsView";

export const metadata = {
  title: "Platform Metrics | Coral Lookout",
  description: "Scans today, active chapters, open moderation flags, and partner leads.",
};

export default function AdminMetricsPage() {
  return <AdminMetricsView />;
}
