import { GalleryPostDetail } from "@/components/gallery/GalleryPostDetail";

export default async function ForumPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <GalleryPostDetail
      postId={id}
      backHref="/forum"
      backLabel="Coral Forum"
    />
  );
}
