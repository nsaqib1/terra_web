"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Flame,
  Sparkles,
  TrendingUp,
  ArrowUp,
  MessageCircle,
  RefreshCw,
  AlertCircle,
  Star,
  Zap,
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

// ── Rising Star Algorithm ──────────────────────────────────────────────────
// Aggregates per-author momentum from the trending post window.
// Score = Σ trendingScore for each post by that author + bonus for post count.
// A "velocity" bar shows relative momentum vs. the top star.

interface RisingStarEntry {
  authorId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  risingScore: number;   // raw aggregated score
  postCount: number;     // # trending posts in window
  totalScore: number;    // sum of post scores (upvotes)
}

function computeRisingStars(posts: TrendingPost[], topN = 3): RisingStarEntry[] {
  const map = new Map<string, RisingStarEntry>();

  for (const post of posts) {
    const { author, trendingScore, score } = post;
    const existing = map.get(author.id);
    if (existing) {
      existing.risingScore += trendingScore;
      existing.postCount += 1;
      existing.totalScore += score;
    } else {
      map.set(author.id, {
        authorId: author.id,
        username: author.username,
        displayName: author.displayName,
        avatarUrl: author.avatarUrl,
        risingScore: trendingScore,
        postCount: 1,
        totalScore: score,
      });
    }
  }

  // Apply a post-count multiplier so authors with multiple hot posts rank higher
  const entries = Array.from(map.values()).map((e) => ({
    ...e,
    risingScore: e.risingScore * (1 + 0.15 * (e.postCount - 1)),
  }));

  return entries
    .sort((a, b) => b.risingScore - a.risingScore)
    .slice(0, topN);
}

function RisingStarBadge({ rank }: { rank: number }) {
  if (rank === 0)
    return (
      <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">
        <Zap size={8} className="text-amber-500" />
        HOT
      </span>
    );
  if (rank === 1)
    return (
      <span className="inline-flex items-center gap-0.5 rounded-full bg-orange-50 px-1.5 py-0.5 text-[9px] font-bold text-orange-600">
        <Flame size={8} />
        RISING
      </span>
    );
  return (
    <span className="inline-flex items-center gap-0.5 rounded-full bg-brand-sand px-1.5 py-0.5 text-[9px] font-bold text-brand-brown-600">
      <Star size={8} />
      NEW
    </span>
  );
}

function RisingStar() {
  const [stars, setStars] = useState<RisingStarEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      // Pull a larger window (7 days) to get enough author diversity
      const data = await postsApi.getTrending(25, 168);
      setStars(computeRisingStars(data, 4));
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const maxScore = stars[0]?.risingScore ?? 1;

  return (
    <section className="rounded-2xl border bg-white p-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-2">
        <div className="flex items-center gap-2">
          <span
            className="flex h-5 w-5 items-center justify-center rounded-full"
            style={{
              background: "linear-gradient(135deg,#f59e0b 0%,#ef4444 100%)",
            }}
          >
            <Flame size={11} className="text-white" />
          </span>
          <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-brand-brown-800">
            Rising Star
          </span>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={isLoading}
          title="Refresh rising stars"
          className="flex h-6 w-6 items-center justify-center rounded-lg text-brand-brown-600 transition-colors hover:bg-brand-sand hover:text-brand-brown-900 disabled:opacity-40"
        >
          <RefreshCw size={12} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Subtitle */}
      <p className="mt-2 text-[10px] text-muted-foreground leading-snug">
        Users whose posts have been gaining momentum lately.
      </p>

      <div className="mt-3 space-y-3">
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2.5 animate-pulse">
              <div className="h-9 w-9 rounded-full bg-brand-sand shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-brand-sand rounded w-3/4" />
                <div className="h-2 bg-brand-sand/60 rounded w-full" />
              </div>
            </div>
          ))
        ) : hasError ? (
          <div className="flex flex-col items-center gap-1.5 py-4 text-center">
            <AlertCircle size={18} className="text-brand-brown-600" />
            <p className="text-[11px] text-muted-foreground">Couldn&apos;t load stars</p>
            <button
              type="button"
              onClick={load}
              className="text-[11px] font-semibold text-brand-brown-700 hover:underline"
            >
              Retry
            </button>
          </div>
        ) : stars.length === 0 ? (
          <div className="py-4 text-center">
            <Star size={20} className="mx-auto text-brand-sand-dark mb-1" />
            <p className="text-[11px] text-muted-foreground">No stars yet.</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Keep posting!</p>
          </div>
        ) : (
          stars.map((star, index) => {
            const velPct = Math.round((star.risingScore / maxScore) * 100);
            const initials = star.displayName
              .split(" ")
              .map((w) => w[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <Link
                key={star.authorId}
                href={`/profile/${star.authorId}`}
                className="group block"
              >
                <div className="flex items-center gap-2.5">
                  {/* Avatar */}
                  {star.avatarUrl ? (
                    <img
                      src={star.avatarUrl}
                      alt={star.displayName}
                      className={
                        "h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-offset-1 transition-all group-hover:ring-amber-400 " +
                        (index === 0
                          ? "ring-amber-400"
                          : index === 1
                          ? "ring-orange-300"
                          : "ring-brand-sand-dark")
                      }
                    />
                  ) : (
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ring-2 ring-offset-1"
                      style={{
                        background:
                          index === 0
                            ? "linear-gradient(135deg,#f59e0b,#ef4444)"
                            : index === 1
                            ? "linear-gradient(135deg,#fb923c,#f59e0b)"
                            : "linear-gradient(135deg,#a78bfa,#60a5fa)",
                      }}
                    >
                      {initials}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-xs font-bold text-brand-brown-900 group-hover:text-brand-brown-700 group-hover:underline">
                        {star.displayName}
                      </p>
                      <RisingStarBadge rank={index} />
                    </div>

                    <p className="text-[10px] text-muted-foreground">@{star.username}</p>

                    {/* Velocity bar */}
                    <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-brand-sand/60">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${velPct}%`,
                          background:
                            index === 0
                              ? "linear-gradient(90deg,#f59e0b,#ef4444)"
                              : index === 1
                              ? "linear-gradient(90deg,#fb923c,#f59e0b)"
                              : "linear-gradient(90deg,#a78bfa,#60a5fa)",
                        }}
                      />
                    </div>

                    <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-0.5">
                        <ArrowUp size={9} />
                        {formatCount(star.totalScore)}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <MessageCircle size={9} />
                        {star.postCount} {star.postCount === 1 ? "post" : "posts"}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>

      {!isLoading && !hasError && stars.length > 0 && (
        <p className="mt-3 border-t pt-2.5 text-[10px] text-muted-foreground">
          Based on post momentum over the last 7 days.
        </p>
      )}
    </section>
  );
}

export function RightSidebar() {
  return (
    <aside className="hidden w-[280px] shrink-0 xl:block">
      <div className="sticky top-20 space-y-5">

        {/* Trending Discussions — Live */}
        <TrendingDiscussions />

        {/* Rising Star */}
        <RisingStar />

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