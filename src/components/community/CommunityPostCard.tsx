"use client";

import Link from "next/link";
import { ArrowUp, ArrowDown, MessageCircle } from "lucide-react";
import { PostItem } from "@/lib/api/types";

function getPostPreviewText(document: any): string {
  if (!document) return "";
  if (typeof document === "string") return document;

  if (document.content && Array.isArray(document.content)) {
    const textPieces: string[] = [];
    for (const node of document.content) {
      if (
        node.type === "paragraph" ||
        node.type === "heading" ||
        node.type === "blockquote"
      ) {
        if (Array.isArray(node.content)) {
          const text = node.content
            .map((item: any) => item?.text || "")
            .join("");
          if (text.trim()) {
            textPieces.push(text.trim());
          }
        }
      } else if (node.type === "bulletList" || node.type === "orderedList") {
        if (Array.isArray(node.content)) {
          for (const item of node.content) {
            if (Array.isArray(item.content)) {
              const text = item.content
                .map((t: any) => t?.text || "")
                .join("");
              if (text.trim()) textPieces.push(text.trim());
            }
          }
        }
      }
    }
    return textPieces.join(" ");
  }

  return "";
}

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "just now";
    }
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    }
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    }
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  } catch {
    return dateString;
  }
}

function getAuthorInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

interface CommunityPostCardProps {
  post: PostItem;
}

export function CommunityPostCard({ post }: CommunityPostCardProps) {
  const previewText = getPostPreviewText(post.document) || "No preview text available.";
  const authorName = post.author?.displayName || post.author?.username || "Anonymous";
  const authorUsername = post.author?.username || "unknown";
  const relativeTime = formatRelativeTime(post.createdAt);
  const initials = getAuthorInitials(authorName);

  return (
    <article className="group relative rounded-2xl border bg-white p-5 transition-all duration-200 hover:border-brand-brown-700/30 hover:shadow-[0_8px_30px_rgba(72,64,48,0.07)]">
      {/* Whole card is clickable to view post page */}
      <Link
        href={`/posts/${post.id}`}
        className="absolute inset-0 z-0 rounded-2xl"
        aria-label={`View discussion by ${authorName}`}
      />

      {/* Header: Author & Metadata & Tags */}
      <div className="relative z-10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {post.author?.avatarUrl ? (
            <img
              src={post.author.avatarUrl}
              alt={authorName}
              className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-white"
            />
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-desert-light text-xs font-bold text-brand-brown-900 ring-2 ring-white">
              {initials}
            </div>
          )}

          <div className="flex flex-col min-w-0">
            <span className="truncate text-xs font-bold text-brand-brown-950 group-hover:text-brand-brown-800">
              {authorName}
            </span>
            <span className="truncate text-[11px] text-muted-foreground">
              @{authorUsername} • {relativeTime}
            </span>
          </div>
        </div>

        {/* Post Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 shrink-0">
            {post.tags.map((tag) => (
              <span
                key={tag.id || tag.slug || tag.name}
                className="rounded-md bg-brand-sand/60 px-2 py-0.5 text-xs font-medium text-brand-brown-700"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Body Preview (2 to 3 lines) */}
      <div className="relative z-10 mt-3.5">
        <p className="line-clamp-3 text-sm leading-relaxed text-brand-brown-900">
          {previewText}
        </p>
      </div>

      {/* Action Bar: Non-interactive numbers */}
      <div className="relative z-10 mt-4 flex items-center gap-3 border-t pt-3">
        {/* Voting display only (non-interactive) */}
        <div
          title="Votes"
          className="flex items-center rounded-xl bg-brand-sand/50 p-1 select-none pointer-events-none"
        >
          <div
            aria-label="Upvote"
            className="flex items-center justify-center rounded-lg p-1.5 text-brand-brown-700/80"
          >
            <ArrowUp size={16} />
          </div>

          <span className="px-2 text-xs font-bold text-brand-brown-900">
            {post.score ?? 0}
          </span>

          <div
            aria-label="Downvote"
            className="flex items-center justify-center rounded-lg p-1.5 text-brand-brown-700/80"
          >
            <ArrowDown size={16} />
          </div>
        </div>

        {/* Comment Count display only (non-interactive) */}
        <div
          title="Comments"
          className="flex items-center gap-1.5 rounded-xl bg-brand-sand/50 px-3 py-1.5 text-xs font-semibold text-brand-brown-700 select-none pointer-events-none"
        >
          <MessageCircle size={16} />
          <span>{post.commentCount ?? 0} Comments</span>
        </div>
      </div>
    </article>
  );
}
