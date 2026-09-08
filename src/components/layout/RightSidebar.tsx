"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Sparkles,
  TrendingUp,
  Trophy,
} from "lucide-react";

const discussions = [
  {
    id: 1,
    title: "What's the best architecture for a local AI assistant in 2026?",
    contributions: "1.2K replies",
    community: "Artificial Intelligence",
    slug: "local-ai-architecture-2026",
  },
  {
    id: 2,
    title: "What programming concepts took you years to truly understand?",
    contributions: "842 replies",
    community: "Programming",
    slug: "concepts-that-took-years",
  },
  {
    id: 3,
    title: "What makes a photograph feel timeless?",
    contributions: "618 replies",
    community: "Photography",
    slug: "timeless-photography",
  },
];

const topContributors = [
  {
    name: "Sarah Chen",
    username: "sarahc",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
    contributions: "342 posts",
  },
  {
    name: "David K.",
    username: "davidk",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    contributions: "289 posts",
  },
  {
    name: "Alex R.",
    username: "arivera",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    contributions: "215 posts",
  },
];

export function RightSidebar() {
  return (
    <aside className="hidden w-[280px] shrink-0 xl:block">
      <div className="sticky top-20 space-y-6">

        {/* Trending Discussions */}
        <section className="rounded-2xl border bg-white p-4">
          <SectionHeader
            icon={<TrendingUp size={16} />}
            title="Trending Discussions"
          />

          <div className="mt-3 space-y-3">
            {discussions.map((discussion, index) => (
              <Link
                key={discussion.id}
                href={`/post/${discussion.slug}`}
                className="group block transition-colors"
              >
                <div className="flex gap-2.5">
                  <span className="pt-0.5 text-xs font-bold text-brand-desert-dark">
                    0{index + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold leading-snug text-brand-brown-900 transition-colors group-hover:text-brand-brown-950 group-hover:underline">
                      {discussion.title}
                    </p>

                    <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <span className="truncate font-medium text-brand-brown-700">
                        {discussion.community}
                      </span>
                      <span>•</span>
                      <span>{discussion.contributions}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Top Contributors of the Week */}
        <section className="rounded-2xl border bg-white p-4">
          <SectionHeader
            icon={<Trophy size={16} />}
            title="Top Contributors"
          />

          <div className="mt-3 space-y-3">
            {topContributors.map((user) => (
              <div key={user.username} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-brand-brown-900 hover:underline cursor-pointer">
                      {user.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      @{user.username}
                    </p>
                  </div>
                </div>

                <span className="shrink-0 text-[10px] font-semibold text-brand-brown-700 bg-brand-sand px-2 py-0.5 rounded-full">
                  {user.contributions}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Platform Guidelines / Info Widget */}
        <section className="rounded-2xl border border-brand-desert-light bg-brand-desert-light/30 p-4">
          <div className="flex items-center gap-2 text-brand-brown-950 font-bold text-xs">
            <Sparkles size={14} className="text-brand-desert-dark" />
            <span>Community Guidelines</span>
          </div>

          <p className="mt-2 text-xs leading-relaxed text-brand-brown-700">
            Be respectful, contribute thoughtfully, and help foster constructive conversations across all communities.
          </p>

          <Link
            href="/rules"
            className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-brand-brown-900 hover:underline"
          >
            Read site rules
            <ArrowUpRight size={12} />
          </Link>
        </section>

        {/* Footer Links */}
        <footer className="px-2 text-[11px] text-muted-foreground">
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            <Link href="/about" className="hover:underline">About</Link>
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <Link href="/terms" className="hover:underline">Terms</Link>
            <Link href="/help" className="hover:underline">Help</Link>
          </div>
          <p className="mt-2">© 2026 Community Platform</p>
        </footer>

      </div>
    </aside>
  );
}

function SectionHeader({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2 border-b pb-2">
      <span className="text-brand-brown-700">{icon}</span>
      <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-brand-brown-800">
        {title}
      </span>
    </div>
  );
}