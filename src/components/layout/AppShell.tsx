import { RightSidebar } from "./RightSidebar";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-brand-cream">
      <TopBar />

      <div
        className="
          mx-auto flex max-w-[1600px]
          gap-6
          px-4
          pb-8
          pt-20
          lg:px-6
        "
      >
        <Sidebar />

        <main className="min-w-0 flex-1">
          {children}
        </main>

        <RightSidebar />
      </div>
    </div>
  );
}
