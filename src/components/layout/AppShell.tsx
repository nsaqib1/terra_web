"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RightSidebar } from "./RightSidebar";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

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


      {/* Primary mobile action. The menu also contains Create Post, but this keeps
          the most common action one tap away without bringing back bottom tabs. */}
      {pathname !== "/posts/create" && (
        <Link
          href="/posts/create"
          className="
            fixed bottom-5 right-5 z-40
            inline-flex h-12 items-center gap-2
            rounded-full bg-brand-brown-950
            px-5
            text-xs font-bold text-white
            shadow-[0_10px_30px_rgba(47,41,31,0.22)]
            transition-transform
            hover:scale-[1.02]
            active:scale-[0.98]
            sm:hidden
          "
          aria-label="Create a post"
        >
          <span className="text-lg leading-none">+</span>
          Create Post
        </Link>
      )}
    </div>
  );
}
