import { AppShell } from "@/components/layout/AppShell";
import { CreatePostForm } from "@/components/post/create/CreatePostForm";

interface CreatePostPageProps {
  searchParams: Promise<{ communityId?: string | string[] }>;
}

export default async function CreatePostPage({
  searchParams,
}: CreatePostPageProps) {
  const { communityId } = await searchParams;
  const initialCommunityId = Array.isArray(communityId)
    ? communityId[0]
    : communityId;

  return (
    <AppShell>
      <div className="mx-auto max-w-295">
        <CreatePostForm
          key={initialCommunityId}
          initialCommunityId={initialCommunityId}
        />
      </div>
    </AppShell>
  );
}
