"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MessageCircle, ArrowUp, ArrowDown, Loader2, AlertCircle } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { PostDocumentRenderer } from "@/components/post/PostDocumentRenderer";
import { postsApi } from "@/lib/api/posts";
import { PostItem } from "@/lib/api/types";
import type { PostDocument } from "@/components/post/create/editor/editor-types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ---------------------------------------------------------------------------
// Static comments (to be replaced later)
// ---------------------------------------------------------------------------

const STATIC_COMMENTS = [
  {
    id: "1",
    author: {
      name: "Sarah Chen",
      username: "sarahc",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
    },
    time: "1 hour ago",
    votes: 126,
    replies: 18,
    isTopAnswer: true,
    content:
      "For a local-first assistant, I would separate the system into four main layers: the model runtime, an orchestration layer, persistent memory, and a tool interface.\n\nThe orchestration layer should remain independent from the model itself. That makes it much easier to switch between models as local inference improves.\n\nI'd also keep long-term memory outside the model context. Use retrieval to bring only the relevant information into each interaction.",
  },
  {
    id: "2",
    author: {
      name: "Daniel Reed",
      username: "dreed",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    },
    time: "2 hours ago",
    votes: 84,
    replies: 12,
    isTopAnswer: false,
    content:
      "I've been running a local assistant for several months. The biggest mistake I made initially was trying to make the model responsible for everything.\n\nOnce I separated tools, memory, and reasoning into independent components, the system became considerably easier to debug.",
  },
  {
    id: "3",
    author: {
      name: "Maya Patel",
      username: "mpatel",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    },
    time: "3 hours ago",
    votes: 61,
    replies: 7,
    isTopAnswer: false,
    content:
      "If you're exploring this architecture, I'd start by studying agent orchestration patterns before choosing a particular framework. The framework landscape is changing very quickly, while the underlying architectural principles are much more stable.",
  },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function PostSkeleton() {
  return (
    <div className="rounded-2xl border bg-white p-5 space-y-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-brand-sand" />
        <div className="space-y-1.5">
          <div className="h-3 w-32 rounded bg-brand-sand" />
          <div className="h-2.5 w-24 rounded bg-brand-sand" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-brand-sand" />
        <div className="h-3 w-5/6 rounded bg-brand-sand" />
        <div className="h-3 w-4/6 rounded bg-brand-sand" />
      </div>
    </div>
  );
}

function PostError({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-red-100 bg-red-50 p-6 flex items-start gap-3">
      <AlertCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
      <div>
        <p className="text-sm font-semibold text-red-700">Could not load post</p>
        <p className="text-xs text-red-500 mt-0.5">{message}</p>
      </div>
    </div>
  );
}

function CommentCard({
  author,
  time,
  votes,
  replies,
  isTopAnswer,
  content,
}: {
  author: { name: string; username: string; avatar: string };
  time: string;
  votes: number;
  replies: number;
  isTopAnswer?: boolean;
  content: string;
}) {
  return (
    <div className="rounded-2xl border bg-white p-4 transition-shadow hover:shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <img
            src={author.avatar}
            alt={author.name}
            className="h-8 w-8 rounded-full object-cover"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-brand-brown-950 hover:underline cursor-pointer">
                {author.name}
              </span>
              {isTopAnswer && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  Top Comment
                </span>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground">
              @{author.username} • {time}
            </p>
          </div>
        </div>
      </div>

      <p className="mt-3 whitespace-pre-line text-xs leading-relaxed text-brand-brown-900">
        {content}
      </p>

      <div className="mt-3 flex items-center gap-2 border-t pt-2.5">
        <div className="flex items-center rounded-lg bg-brand-sand/50 p-0.5">
          <button
            aria-label="Upvote comment"
            className="rounded p-1 text-brand-brown-700 hover:bg-brand-desert-light hover:text-brand-brown-950 transition-colors"
          >
            <ArrowUp size={14} />
          </button>
          <span className="px-1.5 text-[11px] font-bold text-brand-brown-900">
            {votes}
          </span>
          <button
            aria-label="Downvote comment"
            className="rounded p-1 text-brand-brown-700 hover:bg-brand-desert-light hover:text-brand-brown-950 transition-colors"
          >
            <ArrowDown size={14} />
          </button>
        </div>

        <button className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-brand-brown-700 hover:bg-brand-sand/60 transition-colors">
          <MessageCircle size={14} />
          <span>{replies} Replies</span>
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function PostPage() {
  const params = useParams<{ postId: string }>();
  const postId = params?.postId ?? "";

  const [post, setPost] = useState<PostItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!postId) return;
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    postsApi
      .getById(postId)
      .then((data) => {
        if (!cancelled) {
          setPost(data);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load post."
          );
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [postId]);

  const communityInitials = post
    ? initials(post.community.name)
    : "";

  const document = post?.document as PostDocument | null;

  return (
    <AppShell>
      <div className="mx-auto max-w-[1180px]">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          {/* Main column */}
          <main className="min-w-0 space-y-4">

            {/* Post card */}
            {isLoading ? (
              <PostSkeleton />
            ) : error ? (
              <PostError message={error} />
            ) : post && document ? (
              <article className="rounded-2xl border bg-white p-5 transition-shadow">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Author avatar + community badge */}
                    <div className="relative shrink-0">
                      {post.author.avatarUrl ? (
                        <img
                          src={post.author.avatarUrl}
                          alt={post.author.displayName}
                          className="h-10 w-10 rounded-full object-cover ring-2 ring-white"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-sand text-xs font-bold text-brand-brown-800 ring-2 ring-white">
                          {initials(post.author.displayName)}
                        </div>
                      )}
                      <div
                        title={post.community.name}
                        className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-md bg-brand-desert-light text-[9px] font-bold text-brand-brown-800 ring-2 ring-white"
                      >
                        {communityInitials}
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="font-bold text-brand-brown-950 hover:underline cursor-pointer">
                          {post.community.name}
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">
                          {relativeTime(post.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span>Posted by</span>
                        <span className="font-medium text-brand-brown-700 hover:underline cursor-pointer">
                          @{post.author.username}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {post.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="rounded-md bg-brand-sand/60 px-2 py-0.5 text-xs font-medium text-brand-brown-700"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Post body */}
                <div className="mt-4">
                  <PostDocumentRenderer document={document} />
                </div>

                {/* Actions */}
                <div className="mt-5 flex items-center gap-3 border-t pt-3">
                  {/* Vote group */}
                  <div className="flex items-center rounded-xl bg-brand-sand/50 p-1">
                    <button
                      aria-label="Upvote"
                      className="flex items-center justify-center rounded-lg p-1.5 text-brand-brown-700 hover:bg-brand-desert-light hover:text-brand-brown-950 transition-colors"
                    >
                      <ArrowUp size={16} />
                    </button>
                    <span className="px-2 text-xs font-bold text-brand-brown-900">
                      {post.score}
                    </span>
                    <button
                      aria-label="Downvote"
                      className="flex items-center justify-center rounded-lg p-1.5 text-brand-brown-700 hover:bg-brand-desert-light hover:text-brand-brown-950 transition-colors"
                    >
                      <ArrowDown size={16} />
                    </button>
                  </div>

                  {/* Comment count */}
                  <div className="flex items-center gap-1.5 rounded-xl bg-brand-sand/50 px-3 py-1.5 text-xs font-semibold text-brand-brown-700">
                    <MessageCircle size={16} />
                    <span>{post.commentCount} Comments</span>
                  </div>
                </div>
              </article>
            ) : null}

            {/* Comment composer — static */}
            <div className="rounded-2xl border bg-white p-4">
              <textarea
                rows={3}
                placeholder="Write a comment..."
                className="w-full resize-none rounded-xl border border-brand-sand bg-brand-sand/30 p-3 text-sm text-brand-brown-900 placeholder:text-muted-foreground focus:border-brand-brown-700 focus:outline-none focus:ring-0"
              />
              <div className="mt-2 flex justify-end">
                <button className="rounded-xl bg-brand-brown-950 px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90">
                  Comment
                </button>
              </div>
            </div>

            {/* Comments stream — static */}
            <section className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-sm font-bold text-brand-brown-950">
                  {post ? `${post.commentCount} Comments` : "Comments"}
                </h2>
                <select className="rounded-lg border bg-white px-2.5 py-1.5 text-xs font-semibold text-brand-brown-700 focus:outline-none">
                  <option value="top">Top Comments</option>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
              <div className="space-y-3">
                {STATIC_COMMENTS.map((comment) => (
                  <CommentCard key={comment.id} {...comment} />
                ))}
              </div>
            </section>
          </main>

          {/* Sidebar */}
          <aside className="space-y-4">
            <div className="rounded-2xl border bg-white p-4">
              {isLoading ? (
                <div className="space-y-3 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-brand-sand" />
                    <div className="space-y-1.5">
                      <div className="h-3 w-28 rounded bg-brand-sand" />
                      <div className="h-2.5 w-16 rounded bg-brand-sand" />
                    </div>
                  </div>
                  <div className="h-2.5 w-full rounded bg-brand-sand" />
                  <div className="h-2.5 w-4/5 rounded bg-brand-sand" />
                </div>
              ) : post ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-desert-light text-xs font-bold text-brand-brown-800 shrink-0">
                      {communityInitials}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-brand-brown-950">
                        {post.community.name}
                      </h3>
                    </div>
                  </div>
                  <button className="mt-4 w-full rounded-xl bg-brand-sand py-2 text-xs font-bold text-brand-brown-950 hover:bg-brand-desert-light transition-colors">
                    View Community
                  </button>
                </>
              ) : null}
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}