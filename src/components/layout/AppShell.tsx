import type { ReactNode } from "react";
import { RightSidebar } from "./RightSidebar";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

interface AppShellProps {
  children: ReactNode;
  contextualSidebarContent?: ReactNode;
}

export function AppShell({ children, contextualSidebarContent }: AppShellProps) {
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

        {contextualSidebarContent && (
          <aside className="hidden w-70 shrink-0 2xl:block">
            <div className="sticky top-20 space-y-5">
              {contextualSidebarContent}
            </div>
          </aside>
        )}

        <RightSidebar />
      </div>
    </div>
  );
}
