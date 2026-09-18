"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowUp, ArrowDown, MessageCircle, Image as ImageIcon } from "lucide-react";
import { PostItem, VoteValue } from "@/lib/api/types";
import { votesApi } from "@/lib/api/votes";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

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

function getCommunityInitials(name?: string): string {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "??";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function getAuthorInitials(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

interface FeedPostCardProps {
  post: PostItem;
  onTagClick?: (tagSlug: string) => void;
  onErrorToast?: (msg: string) => void;
}

export function FeedPostCard({ post, onTagClick, onErrorToast }: FeedPostCardProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [score, setScore] = useState<number>(post.score ?? 0);
  const [currentVote, setCurrentVote] = useState<VoteValue | null>(null);
  const [isVoting, setIsVoting] = useState<boolean>(false);

  const previewText = getPostPreviewText(post.document) || "No text preview available.";
  const authorName = post.author?.displayName || post.author?.username || "Anonymous";
  const authorUsername = post.author?.username || "unknown";
  const relativeTime = formatRelativeTime(post.createdAt);
  const communityName = post.community?.name || "General";
  const communitySlug = post.community?.slug || "";
  const communityInitials = getCommunityInitials(communityName);
  const authorInitials = getAuthorInitials(authorName);
  const commentCount = post.commentCount ?? 0;
  const hasMedia = post.media && post.media.length > 0;

  const handleVote = async (e: React.MouseEvent, value: VoteValue) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push(`/login?redirect=/posts/${post.id}`);
      return;
    }

    if (isVoting) return;

    const prevVote = currentVote;
    const prevScore = score;

    let newVote: VoteValue | null = value;
    let scoreDelta = 0;

    if (prevVote === value) {
      newVote = null;
      scoreDelta = value === "UP" ? -1 : 1;
    } else if (prevVote === null) {
      newVote = value;
      scoreDelta = value === "UP" ? 1 : -1;
    } else {
      newVote = value;
      scoreDelta = value === "UP" ? 2 : -2;
    }

    setCurrentVote(newVote);
    setScore((s) => s + scoreDelta);
    setIsVoting(true);

    try {
      const res = await votesApi.vote({
        postId: post.id,
        value,
      });
      setCurrentVote(res.value);
    } catch {
      // Revert on error
      setCurrentVote(prevVote);
      setScore(prevScore);
      if (onErrorToast) {
        onErrorToast("Failed to record vote. Please try again.");
      }
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <article className="group relative rounded-2xl border border-brand-sand-dark/60 bg-white p-5 transition-all duration-200 hover:border-brand-brown-700/30 hover:shadow-[0_8px_30px_rgba(72,64,48,0.07)]">
      {/* Clickable background overlay */}
      <Link
        href={`/posts/${post.id}`}
        className="absolute inset-0 z-0 rounded-2xl"
        aria-label={`View discussion by ${authorName}`}
      />

      {/* Header: Community + Author Info & Tags */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Author Avatar with Community Badge */}
          <div className="relative shrink-0">
            {post.author?.avatarUrl ? (
              <img
                src={post.author.avatarUrl}
                alt={authorName}
                className="h-10 w-10 rounded-full object-cover ring-2 ring-white"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-sand text-xs font-bold text-brand-brown-900 ring-2 ring-white">
                {authorInitials}
              </div>
            )}

            {communitySlug && (
              <Link
                href={`/community/${communitySlug}`}
                title={communityName}
                onClick={(e) => e.stopPropagation()}
                className="
                  absolute -bottom-1 -right-1
                  flex h-5 w-5 items-center justify-center
                  rounded-md bg-brand-desert-light text-[9px] font-bold text-brand-brown-800
                  ring-2 ring-white transition-transform hover:scale-110
                "
              >
                {communityInitials}
              </Link>
            )}
          </div>

          {/* Metadata Stack */}
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 text-xs truncate">
              {communitySlug ? (
                <Link
                  href={`/community/${communitySlug}`}
                  onClick={(e) => e.stopPropagation()}
                  className="font-bold text-brand-brown-950 hover:text-brand-brown-700 hover:underline truncate"
                >
                  {communityName}
                </Link>
              ) : (
                <span className="font-bold text-brand-brown-950 truncate">
                  {communityName}
                </span>
              )}
              <span className="text-muted-foreground shrink-0">•</span>
              <span className="text-muted-foreground shrink-0">{relativeTime}</span>
            </div>

            <div className="flex items-center gap-1 text-xs text-muted-foreground truncate">
              <span>Posted by</span>
              <Link
                href={`/profile/${post.author?.id || authorUsername}`}
                onClick={(e) => e.stopPropagation()}
                className="font-medium text-brand-brown-700 hover:text-brand-brown-950 hover:underline truncate"
              >
                @{authorUsername}
              </Link>
            </div>
          </div>
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <button
                key={tag.id || tag.slug || tag.name}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (onTagClick) {
                    onTagClick(tag.slug || tag.name);
                  }
                }}
                className="
                  rounded-md bg-brand-sand/70
                  px-2.5 py-0.5
                  text-xs font-medium text-brand-brown-700
                  transition-colors hover:bg-brand-desert-light/80 hover:text-brand-brown-950
                "
              >
                #{tag.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Body Preview */}
      <div className="relative z-10 mt-3.5">
        <p className="line-clamp-3 text-sm leading-relaxed text-brand-brown-900">
          {previewText}
        </p>

        {hasMedia && (
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-brand-brown-600 font-medium">
            <ImageIcon size={14} className="text-brand-brown-700" />
            <span>{post.media?.length} {post.media?.length === 1 ? "media attachment" : "media attachments"}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="relative z-10 mt-4 flex items-center justify-between border-t border-brand-sand-dark/40 pt-3">
        <div className="flex items-center gap-3">
          {/* Vote Controls */}
          <div className="flex items-center rounded-xl bg-brand-sand/50 p-1">
            <button
              type="button"
              aria-label="Upvote"
              onClick={(e) => handleVote(e, "UP")}
              className={`
                flex items-center justify-center rounded-lg p-1.5 transition-colors
                ${
                  currentVote === "UP"
                    ? "bg-brand-desert text-brand-brown-950 font-bold"
                    : "text-brand-brown-700 hover:bg-brand-desert-light hover:text-brand-brown-950"
                }
              `}
            >
              <ArrowUp size={16} />
            </button>

            <span className="px-2 text-xs font-bold text-brand-brown-900 min-w-[20px] text-center">
              {score}
            </span>

            <button
              type="button"
              aria-label="Downvote"
              onClick={(e) => handleVote(e, "DOWN")}
              className={`
                flex items-center justify-center rounded-lg p-1.5 transition-colors
                ${
                  currentVote === "DOWN"
                    ? "bg-brand-desert text-brand-brown-950 font-bold"
                    : "text-brand-brown-700 hover:bg-brand-desert-light hover:text-brand-brown-950"
                }
              `}
            >
              <ArrowDown size={16} />
            </button>
          </div>

          {/* Comments link button */}
          <Link
            href={`/posts/${post.id}#comments`}
            onClick={(e) => e.stopPropagation()}
            className="
              flex items-center gap-1.5 rounded-xl bg-brand-sand/50 px-3 py-1.5
              text-xs font-semibold text-brand-brown-700
              hover:bg-brand-desert-light hover:text-brand-brown-950
              transition-colors
            "
          >
            <MessageCircle size={15} />
            <span>{commentCount}</span>
          </Link>
        </div>

        {/* View Discussion Link */}
        <Link
          href={`/posts/${post.id}`}
          onClick={(e) => e.stopPropagation()}
          className="text-xs font-semibold text-brand-brown-700 hover:text-brand-brown-950 hover:underline"
        >
          View discussion →
        </Link>
      </div>
    </article>
  );
}
