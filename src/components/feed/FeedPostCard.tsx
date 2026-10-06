"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowUp, ArrowDown, MessageCircle, Play } from "lucide-react";
import { PostItem, VoteValue } from "@/lib/api/types";
import { votesApi } from "@/lib/api/votes";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not configured");
}

const API_BASE = API_URL.replace(/\/+$/, "");

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function renderInlineContent(content: unknown[]): React.ReactNode[] {
  return content.flatMap((item, index) => {
    if (!isRecord(item) || typeof item.text !== "string") return [];

    const marks = Array.isArray(item.marks) ? item.marks : [];
    let rendered: React.ReactNode = item.text;

    for (let markIndex = marks.length - 1; markIndex >= 0; markIndex -= 1) {
      const mark = marks[markIndex];
      if (!isRecord(mark) || typeof mark.type !== "string") continue;

      const key = `${index}-${markIndex}`;
      switch (mark.type) {
        case "bold":
          rendered = <strong key={key}>{rendered}</strong>;
          break;
        case "italic":
          rendered = <em key={key}>{rendered}</em>;
          break;
        case "underline":
          rendered = <u key={key}>{rendered}</u>;
          break;
        case "strike":
          rendered = <s key={key}>{rendered}</s>;
          break;
        case "code":
          rendered = (
            <code
              key={key}
              className="rounded bg-brand-sand px-1 py-0.5 font-mono text-[0.85em] text-brand-brown-800"
            >
              {rendered}
            </code>
          );
          break;
        case "link": {
          const attrs = isRecord(mark.attrs) ? mark.attrs : null;
          const href =
            typeof mark.href === "string"
              ? mark.href
              : typeof attrs?.href === "string"
                ? attrs.href
                : null;
          if (href && /^https?:\/\//i.test(href)) {
            rendered = (
              <a
                key={key}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(event) => event.stopPropagation()}
                className="text-brand-desert-dark underline underline-offset-2 hover:opacity-80"
              >
                {rendered}
              </a>
            );
          }
          break;
        }
      }
    }

    return <React.Fragment key={index}>{rendered}</React.Fragment>;
  });
}

interface PostPreviewContent {
  text: React.ReactNode[];
  media: FeedMediaPreview | null;
}

function getMediaPreviewFromNode(node: Record<string, unknown>): FeedMediaPreview | null {
  const attrs = isRecord(node.attrs) ? node.attrs : null;
  const mediaId =
    node.type === "image"
      ? node.mediaId
      : node.type === "postImage"
        ? attrs?.mediaId
        : null;

  if (typeof mediaId === "string" && mediaId.length > 0) {
    return {
      type: "image",
      src: `${API_BASE}/media/${encodeURIComponent(mediaId)}`,
      alt:
        typeof node.altText === "string"
          ? node.altText
          : typeof attrs?.alt === "string"
            ? attrs.alt
            : "Post image",
    };
  }

  const videoUrl = node.type === "youtube" ? attrs?.src : null;
  const videoId =
    node.type === "youtube" && typeof node.videoId === "string"
      ? node.videoId
      : typeof videoUrl === "string"
        ? getYoutubeVideoId(videoUrl)
        : null;

  if (videoId && /^[A-Za-z0-9_-]{11}$/.test(videoId)) {
    return {
      type: "youtube",
      src: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    };
  }

  return null;
}

function getPostPreviewContent(
  document: unknown,
  fallbackMedia?: PostItem["media"],
): PostPreviewContent {
  if (typeof document === "string") {
    return {
      text: document.trim()
        ? [<p key="text">{document.trim()}</p>]
        : [],
      media: getFeedMediaPreview(undefined, fallbackMedia),
    };
  }
  if (!isRecord(document) || !Array.isArray(document.content)) {
    return { text: [], media: getFeedMediaPreview(undefined, fallbackMedia) };
  }

  const blocks: React.ReactNode[] = [];
  for (const [index, node] of document.content.entries()) {
    if (!isRecord(node)) continue;

    if (node.type === "image" || node.type === "postImage" || node.type === "youtube") {
      const mediaPreview =
        getMediaPreviewFromNode(node) ?? getFeedMediaPreview(undefined, fallbackMedia);
      if (mediaPreview) {
        return { text: blocks, media: mediaPreview };
      }
      continue;
    }

    if (
      node.type === "paragraph" ||
      node.type === "heading" ||
      node.type === "blockquote" ||
      node.type === "codeBlock"
    ) {
      if (!Array.isArray(node.content)) continue;
      const inline = renderInlineContent(node.content);
      if (inline.length === 0) continue;

      if (node.type === "heading") {
        const level = node.level;
        const headingClass =
          level === 1
            ? "text-xl font-bold text-brand-brown-950"
            : level === 2
              ? "text-lg font-bold text-brand-brown-950"
              : "text-base font-semibold text-brand-brown-900";
        blocks.push(
          <div key={index} className={headingClass}>
            {inline}
          </div>,
        );
      } else if (node.type === "blockquote") {
        blocks.push(
          <blockquote
            key={index}
            className="border-l-2 border-brand-desert pl-3 text-sm italic leading-relaxed text-brand-brown-700"
          >
            {inline}
          </blockquote>,
        );
      } else if (node.type === "codeBlock") {
        blocks.push(
          <code
            key={index}
            className="rounded bg-brand-brown-950 px-1.5 py-1 font-mono text-xs text-brand-sand"
          >
            {inline}
          </code>,
        );
      } else {
        blocks.push(
          <p key={index} className="text-sm leading-relaxed text-brand-brown-900">
            {inline}
          </p>,
        );
      }
      continue;
    }

    if (node.type === "bulletList" || node.type === "orderedList") {
      if (!Array.isArray(node.content)) continue;
      const items = node.content.flatMap((item, itemIndex) => {
        if (!isRecord(item) || !Array.isArray(item.content)) return [];
        const inline = renderInlineContent(item.content);
        return inline.length
          ? [<li key={itemIndex}>{inline}</li>]
          : [];
      });
      if (items.length === 0) continue;

      const List = node.type === "orderedList" ? "ol" : "ul";
      blocks.push(
        <List
          key={index}
          className={`space-y-0.5 pl-5 text-sm leading-relaxed text-brand-brown-900 ${node.type === "orderedList" ? "list-decimal" : "list-disc"
            }`}
        >
          {items}
        </List>,
      );
    }
  }

  return {
    text: blocks,
    media: getFeedMediaPreview(undefined, fallbackMedia),
  };
}

type FeedMediaPreview =
  | { type: "image"; src: string; alt: string }
  | { type: "youtube"; src: string };

function getYoutubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    let videoId: string | null = null;

    if (parsed.hostname === "youtube.com" || parsed.hostname === "www.youtube.com") {
      if (parsed.pathname === "/watch") {
        videoId = parsed.searchParams.get("v");
      } else if (
        parsed.pathname.startsWith("/embed/") ||
        parsed.pathname.startsWith("/shorts/")
      ) {
        videoId = parsed.pathname.split("/")[2] ?? null;
      }
    } else if (
      parsed.hostname === "youtu.be" ||
      parsed.hostname === "www.youtu.be"
    ) {
      videoId = parsed.pathname.slice(1).split("/")[0] || null;
    }

    return videoId && /^[A-Za-z0-9_-]{11}$/.test(videoId)
      ? videoId
      : null;
  } catch {
    return null;
  }
}

function getFeedMediaPreview(
  document: unknown,
  media?: PostItem["media"],
): FeedMediaPreview | null {
  if (isRecord(document) && Array.isArray(document.content)) {
    for (const node of document.content) {
      if (!isRecord(node)) continue;
      const preview = getMediaPreviewFromNode(node);
      if (preview) return preview;
    }
  }

  const imageAttachment = media?.find((item) =>
    item.mimeType.toLowerCase().startsWith("image/"),
  );

  if (imageAttachment) {
    return {
      type: "image",
      src: `${API_BASE}/media/${encodeURIComponent(imageAttachment.id)}`,
      alt: imageAttachment.altText || "Post image",
    };
  }

  return null;
}

function FeedMediaPreviewCard({
  media,
}: {
  media: FeedMediaPreview;
}) {
  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-brand-sand-dark/50 bg-brand-sand/40">
      <div className="relative mx-auto flex max-h-135 w-full items-center justify-center overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={media.src}
          alt={media.type === "image" ? media.alt : "YouTube video thumbnail"}
          loading="lazy"
          className="block h-auto max-h-135 w-auto max-w-full object-contain"
        />
        {media.type === "youtube" && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/10">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/75 text-white shadow-lg transition-transform group-hover:scale-105">
              <Play size={23} fill="currentColor" className="ml-0.5" />
            </span>
          </span>
        )}
      </div>
    </div>
  );
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

  const previewContent = getPostPreviewContent(post.document, post.media);
  const authorName = post.author?.displayName || post.author?.username || "Anonymous";
  const authorUsername = post.author?.username || "unknown";
  const relativeTime = formatRelativeTime(post.createdAt);
  const communityName = post.community?.name || "General";
  const communitySlug = post.community?.slug || "";
  const communityInitials = getCommunityInitials(communityName);
  const authorInitials = getAuthorInitials(authorName);
  const commentCount = post.commentCount ?? 0;
  const mediaPreview = previewContent.media;
  const hasMedia = Boolean(mediaPreview || post.media?.length);

  const navigateToPost = () => {
    router.push(`/posts/${post.id}`);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation if text is selected
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) return;

    navigateToPost();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      // Avoid triggering when inner interactive controls have focus
      if (e.target === e.currentTarget) {
        e.preventDefault();
        navigateToPost();
      }
    }
  };

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
    <article
      tabIndex={0}
      role="article"
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      className="
        group relative cursor-pointer rounded-none border border-x-0 border-brand-sand-dark/60 
        bg-white p-5 transition-all duration-200 
        hover:border-brand-brown-700/30 hover:shadow-[0_8px_30px_rgba(72,64,48,0.07)] 
        focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-brown-700
        sm:rounded-2xl sm:border
      "
    >
      {/* Header: Community + Author Info & Tags */}
      <div className="flex flex-wrap items-center justify-between gap-3">
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
      <div className="mt-3.5">
        {(previewContent.text.length > 0 || !hasMedia) && (
          <div
            className={`space-y-2 text-sm leading-relaxed text-brand-brown-900 ${hasMedia ? "line-clamp-2" : "line-clamp-3"
              }`}
          >
            {previewContent.text.length > 0
              ? previewContent.text
              : "No text preview available."}
          </div>
        )}

        {mediaPreview && (
          <FeedMediaPreviewCard media={mediaPreview} />
        )}
      </div>

      {/* Actions Toolbar */}
      <div className="mt-4 flex items-center justify-between border-t border-brand-sand-dark/40 pt-3">
        <div className="flex items-center gap-3">
          {/* Vote Controls */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center rounded-xl bg-brand-sand/50 p-1"
          >
            <button
              type="button"
              aria-label="Upvote"
              onClick={(e) => handleVote(e, "UP")}
              className={`
                flex items-center justify-center rounded-lg p-1.5 transition-colors
                ${currentVote === "UP"
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
                ${currentVote === "DOWN"
                  ? "bg-brand-desert text-brand-brown-950 font-bold"
                  : "text-brand-brown-700 hover:bg-brand-desert-light hover:text-brand-brown-950"
                }
              `}
            >
              <ArrowDown size={16} />
            </button>
          </div>

          {/* Comments Link */}
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
      </div>
    </article>
  );
}