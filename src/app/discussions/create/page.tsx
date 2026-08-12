import { AppShell } from "@/components/layout/AppShell";
import { CreateDiscussionForm } from "@/components/discussion/create/CreateDiscussionForm";

export default function CreateDiscussionPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-[1180px]">
        <CreateDiscussionForm />
      </div>
    </AppShell>
  );
}