import { GalleryPostDetail } from "@/components/gallery/GalleryPostDetail";

export default async function GalleryPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <GalleryPostDetail postId={id} />;
}
