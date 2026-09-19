"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Flame,
  Sparkles,
  Trophy,
  TrendingUp,
  ArrowUp,
  MessageCircle,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { postsApi } from "@/lib/api/posts";
import { TrendingPost } from "@/lib/api/types";

function getPostTitle(document: any): string {
  if (!document) return "Untitled discussion";
  if (typeof document === "string") return document.slice(0, 100);

  if (document.content && Array.isArray(document.content)) {
    for (const node of document.content) {
      if (node.type === "heading" && Array.isArray(node.content)) {
        const text = node.content.map((t: any) => t?.text || "").join("").trim();
        if (text) return text;
      }
    }
    for (const node of document.content) {
      if (node.type === "paragraph" && Array.isArray(node.content)) {
        const text = node.content.map((t: any) => t?.text || "").join("").trim();
        if (text) return text;
      }
    }
  }

  return "Untitled discussion";
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}

function TrendingDiscussions() {
  const [posts, setPosts] = useState<TrendingPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const data = await postsApi.getTrending(5, 72);
      setPosts(data);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <section className="rounded-2xl border bg-white p-4">
      <div className="flex items-center justify-between border-b pb-2">
        <div className="flex items-center gap-2">
          <span className="text-brand-brown-700">
            <Flame size={15} className="text-brand-desert-dark" />
          </span>
          <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-brand-brown-800">
            Trending
          </span>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={isLoading}
          title="Refresh trending"
          className="flex h-6 w-6 items-center justify-center rounded-lg text-brand-brown-600 transition-colors hover:bg-brand-sand hover:text-brand-brown-900 disabled:opacity-40"
        >
          <RefreshCw size={12} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="mt-3 space-y-3">
        {isLoading ? (
          // Skeleton
          [1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-2.5 animate-pulse">
              <div className="pt-0.5 w-4 h-3 rounded bg-brand-sand shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-brand-sand rounded w-full" />
                <div className="h-3 bg-brand-sand/60 rounded w-3/4" />
                <div className="h-2.5 bg-brand-sand/40 rounded w-1/2" />
              </div>
            </div>
          ))
        ) : hasError ? (
          <div className="flex flex-col items-center gap-1.5 py-4 text-center">
            <AlertCircle size={18} className="text-brand-brown-600" />
            <p className="text-[11px] text-muted-foreground">Couldn't load trending</p>
            <button
              type="button"
              onClick={load}
              className="text-[11px] font-semibold text-brand-brown-700 hover:underline"
            >
              Retry
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="py-4 text-center">
            <TrendingUp size={20} className="mx-auto text-brand-sand-dark mb-1" />
            <p className="text-[11px] text-muted-foreground">No trending posts yet.</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Check back soon!</p>
          </div>
        ) : (
          posts.map((post, index) => {
            const title = getPostTitle(post.document);

            return (
              <Link
                key={post.id}
                href={`/posts/${post.id}`}
                className="group block transition-colors"
              >
                <div className="flex gap-2.5">
                  {/* Rank badge */}
                  <span
                    className={`pt-0.5 text-xs font-bold shrink-0 ${
                      index === 0
                        ? "text-brand-desert-dark"
                        : index === 1
                        ? "text-brand-brown-700"
                        : "text-brand-brown-600/60"
                    }`}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div className="min-w-0 flex-1">
                    {/* Title */}
                    <p className="text-xs font-semibold leading-snug text-brand-brown-900 line-clamp-2 transition-colors group-hover:text-brand-brown-700 group-hover:underline">
                      {title}
                    </p>

                    {/* Community & stats */}
                    <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                      {post.community?.slug && (
                        <span
                          className="truncate text-[10px] font-semibold text-brand-brown-700 max-w-[90px]"
                          title={post.community.name}
                        >
                          {post.community.name}
                        </span>
                      )}

                      <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                        <ArrowUp size={10} />
                        {formatCount(post.score)}
                      </span>

                      <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                        <MessageCircle size={10} />
                        {formatCount(post.commentCount)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>

      {/* "See all" link */}
      {!isLoading && !hasError && posts.length > 0 && (
        <Link
          href="/?sort=top"
          className="mt-3 flex items-center gap-1 border-t pt-2.5 text-[11px] font-bold text-brand-brown-700 hover:text-brand-brown-950 hover:underline transition-colors"
        >
          See top posts
          <ArrowUpRight size={11} />
        </Link>
      )}
    </section>
  );
}

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
      <div className="sticky top-20 space-y-5">

        {/* Trending Discussions — Live */}
        <TrendingDiscussions />

        {/* Top Contributors of the Week */}
        <section className="rounded-2xl border bg-white p-4">
          <SectionHeader
            icon={<Trophy size={15} />}
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