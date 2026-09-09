import { AppShell } from "@/components/layout/AppShell";
import { CreatePostForm } from "@/components/post/create/CreatePostForm";

export default function CreatePostPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-[1180px]">
        <CreatePostForm />
      </div>
    </AppShell>
  );
}
