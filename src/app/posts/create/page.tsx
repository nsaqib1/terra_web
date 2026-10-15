import { AppShell } from "@/components/layout/AppShell";
import { CreatePostForm } from "@/components/post/create/CreatePostForm";

export default function CreatePostPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-295">
        <CreatePostForm />
      </div>
    </AppShell>
  );
}
