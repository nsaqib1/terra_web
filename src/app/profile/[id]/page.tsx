"use client";

import {
  Calendar,
  Compass,
  ExternalLink,
  Globe,
  Loader2,
  MapPin,
  MessageSquare,
  ThumbsUp,
  UserX,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usersApi } from "@/lib/api/users";
import {
  PostItem,
  UserCommunityItem,
  UserProfileResponse,
} from "@/lib/api/types";

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

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function PublicProfilePage() {
  const params = useParams();
  const rawId = typeof params?.id === "string" ? params.id : "";

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [profileData, setProfileData] = useState<UserProfileResponse | null>(null);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [communities, setCommunities] = useState<UserCommunityItem[]>([]);

  useEffect(() => {
    if (!rawId) return;

    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      setError(null);
      try {
        const [profileRes, postsRes, communitiesRes] = await Promise.all([
          usersApi.getProfile(rawId),
          usersApi.getPosts(rawId, { page: 1, limit: 10 }),
          usersApi.getCommunities(rawId, { page: 1, limit: 20 }),
        ]);

        if (isMounted) {
          setProfileData(profileRes);
          setPosts(postsRes.data);
          setCommunities(communitiesRes.data);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(
            err?.message || "User profile could not be found or is inactive."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [rawId]);

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-brand-brown-600" />
          <p className="text-sm font-medium text-brand-brown-700">
            Loading profile…
          </p>
        </div>
      </AppShell>
    );
  }

  if (error || !profileData) {
    return (
      <AppShell>
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 rounded-3xl border border-brand-sand-dark bg-white p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <UserX size={28} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-brand-brown-950">
              User Not Found
            </h2>
            <p className="mt-1 text-sm text-brand-brown-600">
              {error || "The requested user profile does not exist or has been deactivated."}
            </p>
          </div>
          <Link
            href="/"
            className="mt-2 rounded-xl bg-brand-brown-950 px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-brand-brown-800"
          >
            Back to Home
          </Link>
        </div>
      </AppShell>
    );
  }

  const { user, stats } = profileData;
  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Recent";

  return (
    <AppShell>
      <div className="space-y-6">
        {/* =========================================================
            PROFILE HEADER
        ========================================================= */}
        <section className="overflow-hidden rounded-3xl border border-brand-sand-dark bg-white shadow-xs">
          {/* Banner */}
          <div className="relative h-40 sm:h-48 w-full bg-gradient-to-r from-[#e8cba2] via-[#e2b781] to-[#cf985e]">
            <div
              className="absolute inset-0 opacity-25"
              style={{
                backgroundImage:
                  "radial-gradient(#2f291f 1px, transparent 1px), radial-gradient(#2f291f 1px, #e2b781 1px)",
                backgroundSize: "24px 24px",
                backgroundPosition: "0 0, 12px 12px",
              }}
            />
          </div>

          {/* Identity */}
          <div className="relative px-5 pb-6 sm:px-8">
            <div className="-mt-14 sm:-mt-16">
              <div className="flex flex-col sm:flex-row sm:items-end gap-5">
                {/* Avatar */}
                <Avatar className="h-28 w-28 sm:h-32 sm:w-32 shrink-0 rounded-full border-4 border-white bg-white shadow-md">
                  {user.avatarUrl && (
                    <AvatarImage
                      src={user.avatarUrl}
                      alt={user.displayName}
                      className="rounded-full object-cover"
                    />
                  )}

                  <AvatarFallback className="rounded-full bg-brand-desert text-2xl font-bold text-brand-brown-950">
                    {getInitials(user.displayName || "User")}
                  </AvatarFallback>
                </Avatar>

                {/* Name */}
                <div className="pb-1">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-brand-brown-950">
                    {user.displayName}
                  </h1>

                  <p className="mt-1 text-sm font-medium text-brand-brown-600">
                    @{user.username}
                  </p>
                </div>
              </div>

              {/* Bio */}
              {user.bio && (
                <p className="mt-5 max-w-3xl text-sm leading-relaxed text-brand-brown-800">
                  {user.bio}
                </p>
              )}

              {/* Profile metadata */}
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-brand-sand-dark/60 pt-4 text-xs text-brand-brown-600">
                {/* Points first */}
                <div className="flex items-center gap-1.5 font-medium text-brand-brown-950">
                  <Zap
                    size={14}
                    className="text-brand-desert-dark"
                  />

                  <span className="font-bold">
                    {user.points.toLocaleString()}
                  </span>

                  <span>Points</span>
                </div>

                {user.location && (
                  <div className="flex items-center gap-1.5 font-medium">
                    <MapPin
                      size={14}
                      className="text-brand-brown-500"
                    />
                    <span>{user.location}</span>
                  </div>
                )}

                {user.website && (
                  <div className="flex items-center gap-1.5 font-medium">
                    <Globe
                      size={14}
                      className="text-brand-brown-500"
                    />

                    <a
                      href={
                        user.website.startsWith("http")
                          ? user.website
                          : `https://${user.website}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-brand-brown-900 hover:underline"
                    >
                      {user.website.replace(/^https?:\/\//, "")}
                      <ExternalLink size={11} />
                    </a>
                  </div>
                )}

                {/* Joined last */}
                <div className="flex items-center gap-1.5 font-medium">
                  <Calendar
                    size={14}
                    className="text-brand-brown-500"
                  />
                  <span>Joined {joinedDate}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            CONTENT
        ========================================================= */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* =======================================================
              POSTS
          ======================================================= */}
          <section className="min-w-0">
            <div className="mb-4 flex items-center gap-2">
              <h2 className="text-lg font-semibold text-brand-brown-950">
                Posts
              </h2>

              <span className="rounded-full bg-brand-sand px-2 py-0.5 text-[10px] font-bold text-brand-brown-700">
                {stats.posts}
              </span>
            </div>

            {posts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-brand-sand-dark bg-white p-8 text-center">
                <p className="text-sm text-brand-brown-600">
                  No active posts published yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <ProfilePostCard
                    key={post.id}
                    post={post}
                  />
                ))}
              </div>
            )}
          </section>

          {/* =======================================================
              COMMUNITIES
          ======================================================= */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="mb-4 flex items-center gap-2">
              <h2 className="text-lg font-semibold text-brand-brown-950">
                Communities
              </h2>

              <span className="rounded-full bg-brand-sand px-2 py-0.5 text-[10px] font-bold text-brand-brown-700">
                {stats.communities}
              </span>
            </div>

            {communities.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-brand-sand-dark bg-white p-6 text-center">
                <p className="text-xs text-brand-brown-600">
                  Not currently a member of any community.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {communities.map((community) => (
                  <CommunityCard
                    key={community.id}
                    community={community}
                  />
                ))}
              </div>
            )}
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

/* ================================================================
   POST CARD
================================================================ */

function ProfilePostCard({
  post,
}: {
  post: PostItem;
}) {
  const previewText = getPostPreviewText(post.document) || "No preview text available.";
  const relativeTime = formatRelativeTime(post.createdAt);

  return (
    <article className="group rounded-2xl border border-brand-sand-dark bg-white p-5 shadow-xs transition-all hover:border-brand-sand-dark/80 hover:shadow-sm sm:p-6">
      {/* Community + Tags */}
      <div className="flex items-center justify-between gap-3">
        {/* Community */}
        {post.community && (
          <Link
            href={`/community/${post.community.slug}`}
            className="inline-flex min-w-0 items-center gap-1.5 rounded-lg bg-brand-sand/60 px-2.5 py-1 text-[11px] font-bold text-brand-brown-800 transition-colors hover:bg-brand-sand"
          >
            <Compass
              size={12}
              className="shrink-0 text-brand-desert-dark"
            />

            <span className="truncate">
              {post.community.name}
            </span>
          </Link>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex min-w-0 flex-wrap items-center justify-end gap-1.5">
            {post.tags.map((tag) => (
              <span
                key={tag.id || tag.slug}
                className="rounded-md bg-brand-sand/40 px-2 py-0.5 text-[10px] font-semibold text-brand-brown-600"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Post body + date */}
      <Link
        href={`/posts/${post.id}`}
        className="mt-4 block"
      >
        <p className="line-clamp-3 text-sm leading-relaxed text-brand-brown-800">
          {previewText}
        </p>

        {/* Date intentionally close to body */}
        <p className="mt-2 text-[11px] font-medium text-muted-foreground">
          {relativeTime}
        </p>
      </Link>

      {/* Engagement + Views */}
      <div className="mt-4 flex items-center justify-between border-t border-brand-sand-dark/40 pt-3">
        {/* Votes + Comments */}
        <div className="flex items-center gap-4 text-xs font-semibold text-brand-brown-700">
          <div className="flex items-center gap-1">
            <ThumbsUp
              size={14}
              className="text-brand-desert-dark"
            />
            <span>{post.score ?? 0}</span>
          </div>

          <div className="flex items-center gap-1">
            <MessageSquare size={14} />
            <span>{post.commentCount ?? 0}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ================================================================
   COMMUNITY CARD
=============================================================== */

function CommunityCard({
  community,
}: {
  community: UserCommunityItem;
}) {
  return (
    <Link
      href={`/community/${community.slug}`}
      className="group block rounded-2xl border border-brand-sand-dark bg-white p-4 shadow-xs transition-all hover:border-brand-sand-dark/80 hover:shadow-sm"
    >
      <div className="flex items-start gap-3">
        {/* Community avatar */}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-desert/20 text-sm font-black text-brand-brown-950">
          {community.name.slice(0, 2).toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          {/* Community name */}
          <h3 className="truncate text-sm font-bold text-brand-brown-950 group-hover:underline">
            {community.name}
          </h3>

          <p className="mt-1 text-xs text-brand-brown-600">
            {community.role === "MODERATOR" ? "Moderator" : "Citizen"}
          </p>
        </div>
      </div>
    </Link>
  );
}
