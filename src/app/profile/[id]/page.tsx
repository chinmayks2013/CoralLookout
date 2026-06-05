import { ProfileView } from "@/components/profile/ProfileView";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProfileView userId={id} />;
}
