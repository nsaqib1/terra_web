"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  FileText,
  UserPlus,
  Check,
  Layers,
  Sparkles,
  Loader2,
  AlertCircle,
  PlusCircle,
  X,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { CommunityPostCard } from "@/components/community/CommunityPostCard";
import { useAuth } from "@/context/AuthContext";
import { communitiesApi } from "@/lib/api/communities";
import { tagsApi } from "@/lib/api/tags";
import { postsApi } from "@/lib/api/posts";
import { CommunityDetail, PostItem, Tag } from "@/lib/api/types";
import { extractErrorMessage } from "@/lib/api/errors";

function getCommunityInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function formatCount(count?: number | null): string {
  if (count === undefined || count === null) return "0";
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return String(count);
}

function formatMemberSince(dateString?: string | null): string {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

export default function CommunityPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params?.slug as string;

  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Data states
  const [community, setCommunity] = useState<CommunityDetail | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [isMember, setIsMember] = useState<boolean>(false);
  const [joinedAt, setJoinedAt] = useState<string | null>(null);
  const [membersCount, setMembersCount] = useState<number>(0);

  // Loading & error states
  const [isLoadingCommunity, setIsLoadingCommunity] = useState<boolean>(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState<boolean>(true);
  const [isMembershipLoading, setIsMembershipLoading] = useState<boolean>(false);
  const [isActionPending, setIsActionPending] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Filter state
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isHoveringMemberButton, setIsHoveringMemberButton] = useState<boolean>(false);

  // 1. Fetch community details and tags
  const loadCommunityData = useCallback(async () => {
    if (!slug) return;
    setIsLoadingCommunity(true);
    setErrorMessage(null);

    try {
      const communityData = await communitiesApi.getBySlug(slug);
      setCommunity(communityData);
      setMembersCount(communityData._count?.memberships ?? 0);

      // Fetch tags for this community
      try {
        const tagsResponse = await tagsApi.list({
          communityId: communityData.id,
          limit: 50,
        });
        setTags(tagsResponse.data || []);
      } catch (tagErr) {
        console.error("Failed to load community tags:", tagErr);
      }

      // Fetch posts for this community
      try {
        setIsLoadingPosts(true);
        const postsResponse = await postsApi.list({
          communityId: communityData.id,
          limit: 50,
        });
        setPosts(postsResponse.data || []);
      } catch (postErr) {
        console.error("Failed to load community posts:", postErr);
      } finally {
        setIsLoadingPosts(false);
      }
    } catch (err: any) {
      setErrorMessage(
        extractErrorMessage(err) || "Failed to load community details."
      );
    } finally {
      setIsLoadingCommunity(false);
    }
  }, [slug]);

  useEffect(() => {
    loadCommunityData();
  }, [loadCommunityData]);

  // 2. Fetch membership status when auth is ready
  const loadMembershipStatus = useCallback(async () => {
    if (!slug || authLoading) return;

    if (!isAuthenticated) {
      setIsMember(false);
      setJoinedAt(null);
      return;
    }

    setIsMembershipLoading(true);
    try {
      const response = await communitiesApi.getMembership(slug);
      setIsMember(Boolean(response.isMember));
      setJoinedAt(response.membership?.joinedAt ?? null);
    } catch (err) {
      console.error("Failed to check membership:", err);
      setIsMember(false);
      setJoinedAt(null);
    } finally {
      setIsMembershipLoading(false);
    }
  }, [slug, isAuthenticated, authLoading]);

  useEffect(() => {
    loadMembershipStatus();
  }, [loadMembershipStatus]);

  // Handle Join / Leave
  const handleToggleMembership = async () => {
    if (authLoading || isActionPending) return;

    if (!isAuthenticated) {
      router.push(`/login?redirect=/community/${encodeURIComponent(slug)}`);
      return;
    }

    setIsActionPending(true);
    setActionError(null);

    if (isMember) {
      // Leave community
      try {
        await communitiesApi.leave(slug);
        setIsMember(false);
        setJoinedAt(null);
        setMembersCount((prev) => Math.max(0, prev - 1));
        window.dispatchEvent(new Event("community-membership-changed"));
      } catch (err: any) {
        setActionError(extractErrorMessage(err) || "Failed to leave community.");
      } finally {
        setIsActionPending(false);
      }
    } else {
      // Join community
      try {
        const membership = await communitiesApi.join(slug);
        setIsMember(true);
        setJoinedAt(membership?.joinedAt || new Date().toISOString());
        setMembersCount((prev) => prev + 1);
        window.dispatchEvent(new Event("community-membership-changed"));
      } catch (err: any) {
        setActionError(extractErrorMessage(err) || "Failed to join community.");
      } finally {
        setIsActionPending(false);
      }
    }
  };

  // Filter posts by selected tag
  const filteredPosts = useMemo(() => {
    if (!selectedTag) return posts;
    return posts.filter((post) =>
      post.tags?.some(
        (t) =>
          t.name.toLowerCase() === selectedTag.toLowerCase() ||
          t.slug.toLowerCase() === selectedTag.toLowerCase()
      )
    );
  }, [posts, selectedTag]);

  if (isLoadingCommunity) {
    return (
      <AppShell>
        <div className="mx-auto max-w-[1180px] space-y-6 animate-pulse">
          {/* Header Skeleton */}
          <div className="h-48 rounded-2xl border bg-white p-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-brand-sand/60" />
              <div className="space-y-2">
                <div className="h-7 w-56 rounded-lg bg-brand-sand/60" />
                <div className="h-4 w-36 rounded bg-brand-sand/40" />
              </div>
            </div>
          </div>
          {/* Feed Skeleton */}
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="space-y-4">
              <div className="h-40 rounded-2xl border bg-white p-5" />
              <div className="h-40 rounded-2xl border bg-white p-5" />
            </div>
            <div className="h-60 rounded-2xl border bg-white p-5" />
          </div>
        </div>
      </AppShell>
    );
  }

  if (errorMessage || !community) {
    return (
      <AppShell>
        <div className="mx-auto max-w-[1180px] py-12">
          <div className="rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <AlertCircle size={28} />
            </div>
            <h1 className="mt-4 text-xl font-bold text-brand-brown-950">
              Community Not Found
            </h1>
            <p className="mt-2 text-sm text-brand-brown-700">
              {errorMessage || "The community you are looking for does not exist or may have been archived."}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                href="/communities"
                className="rounded-xl bg-brand-brown-950 px-5 py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
              >
                Explore Communities
              </Link>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  const initials = getCommunityInitials(community.name);

  return (
    <AppShell>
      <div className="mx-auto max-w-[1180px]">
        {/* Action Error Alert */}
        {actionError && (
          <div className="mb-4 flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-rose-600" />
              <span>{actionError}</span>
            </div>
            <button
              onClick={() => setActionError(null)}
              className="rounded p-1 hover:bg-rose-100"
              aria-label="Dismiss error"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Community Header Banner */}
        <div className="overflow-hidden rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            {/* Left: Avatar & Title & Stats */}
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-desert-light text-xl font-black text-brand-brown-900 shadow-inner">
                {initials}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-brand-brown-950">
                    {community.name}
                  </h1>
                </div>

                {/* Quick Stats */}
                <div className="mt-2 flex items-center gap-4 text-xs font-medium text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users size={14} className="text-brand-brown-700" />
                    <span className="font-semibold text-brand-brown-950">
                      {formatCount(membersCount)}
                    </span>
                    <span>Members</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <FileText size={14} className="text-brand-brown-700" />
                    <span className="font-semibold text-brand-brown-950">
                      {formatCount(community._count?.posts ?? posts.length)}
                    </span>
                    <span>Posts</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Dynamic Primary Action (Become a Member / Member) */}
            <div className="flex flex-col items-start sm:items-end gap-1.5 sm:self-center">
              {isMember ? (
                <>
                  <button
                    onClick={handleToggleMembership}
                    disabled={isActionPending}
                    onMouseEnter={() => setIsHoveringMemberButton(true)}
                    onMouseLeave={() => setIsHoveringMemberButton(false)}
                    className={`
                      group flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold
                      transition-all duration-150
                      ${isHoveringMemberButton
                        ? "border border-rose-200 bg-rose-50 text-rose-700 shadow-sm"
                        : "border border-brand-sand-dark/60 bg-brand-sand/50 text-brand-brown-900"
                      }
                      disabled:opacity-60
                    `}
                    title="Click to leave community"
                  >
                    {isActionPending ? (
                      <>
                        <Loader2 size={15} className="animate-spin text-brand-brown-800" />
                        <span>Updating...</span>
                      </>
                    ) : isHoveringMemberButton ? (
                      <>
                        <X size={15} className="text-rose-600" />
                        <span>Leave Community</span>
                      </>
                    ) : (
                      <>
                        <Check size={15} className="text-emerald-700" />
                        <span>Member</span>
                      </>
                    )}
                  </button>
                  {joinedAt && (
                    <span className="text-[11px] text-muted-foreground px-1">
                      Since {formatMemberSince(joinedAt)}
                    </span>
                  )}
                </>
              ) : (
                <button
                  onClick={handleToggleMembership}
                  disabled={isActionPending}
                  className="
                    flex items-center gap-2 rounded-xl bg-brand-brown-950
                    px-5 py-2.5 text-xs font-semibold text-white
                    transition-opacity hover:opacity-90 disabled:opacity-60
                  "
                >
                  {isActionPending ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Joining...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={15} />
                      <span>Become a Member</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Tag Vocabulary Navigation Bar */}
          {tags && tags.length > 0 && (
            <div className="mt-6 border-t pt-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <Layers size={14} className="text-brand-brown-700" />
                  <span>Tags</span>
                </div>
                {selectedTag && (
                  <button
                    onClick={() => setSelectedTag(null)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-brand-brown-700 hover:text-brand-brown-950"
                  >
                    <X size={12} />
                    <span>Clear filter</span>
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedTag(null)}
                  className={`
                    group flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors
                    ${selectedTag === null
                      ? "border-brand-brown-950 bg-brand-brown-950 text-white"
                      : "border-transparent bg-brand-sand/40 text-brand-brown-800 hover:border-brand-brown-700 hover:bg-brand-sand"
                    }
                  `}
                >
                  <span>All</span>
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[10px] ${selectedTag === null
                      ? "bg-white/20 text-white"
                      : "bg-white/80 text-muted-foreground group-hover:text-brand-brown-950"
                      }`}
                  >
                    {posts.length}
                  </span>
                </button>

                {tags.map((tag) => {
                  const isSelected =
                    selectedTag?.toLowerCase() === tag.name.toLowerCase() ||
                    selectedTag?.toLowerCase() === tag.slug.toLowerCase();

                  return (
                    <button
                      key={tag.id || tag.slug}
                      onClick={() => setSelectedTag(isSelected ? null : tag.name)}
                      className={`
                        group flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors
                        ${isSelected
                          ? "border-brand-brown-950 bg-brand-brown-950 text-white"
                          : "border-transparent bg-brand-sand/40 text-brand-brown-800 hover:border-brand-brown-700 hover:bg-brand-sand"
                        }
                      `}
                    >
                      <span>{tag.name}</span>
                      <span
                        className={`rounded-md px-1.5 py-0.5 text-[10px] ${isSelected
                          ? "bg-white/20 text-white"
                          : "bg-white/80 text-muted-foreground group-hover:text-brand-brown-950"
                          }`}
                      >
                        {formatCount(tag.usageCount)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Main Feed + Community Context Sidebar */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          {/* Main Feed */}
          <main className="space-y-4">
            {isLoadingPosts ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-36 rounded-2xl border bg-white p-5" />
                <div className="h-36 rounded-2xl border bg-white p-5" />
                <div className="h-36 rounded-2xl border bg-white p-5" />
              </div>
            ) : filteredPosts.length > 0 ? (
              <div className="space-y-4">
                {filteredPosts.map((post) => (
                  <CommunityPostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border bg-white p-10 text-center shadow-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-desert-light text-brand-brown-800">
                  <FileText size={24} />
                </div>
                <h3 className="mt-3 text-base font-bold text-brand-brown-950">
                  {selectedTag ? `No posts tagged #${selectedTag}` : "No discussions yet"}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
                  {selectedTag
                    ? "Try selecting another tag or clearing the filter to see all posts."
                    : "Be the first citizen to start a conversation in this community."}
                </p>

                <div className="mt-5">
                  <Link
                    href="/posts/create"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-brand-brown-950 px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    <PlusCircle size={14} />
                    <span>Create a Post</span>
                  </Link>
                </div>
              </div>
            )}
          </main>

          {/* Right Sidebar: About Community */}
          <aside className="space-y-4">
            <div className="rounded-2xl border bg-white p-4">
              <div className="flex items-center gap-2 border-b pb-2 text-xs font-bold uppercase tracking-wider text-brand-brown-950">
                <Sparkles size={14} className="text-brand-desert-dark" />
                <span>About Community</span>
              </div>

              {/* Centralized Description */}
              <p className="mt-3 text-xs leading-relaxed text-brand-brown-700">
                {community.description || "A dedicated digital space for discussions and knowledge sharing."}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}