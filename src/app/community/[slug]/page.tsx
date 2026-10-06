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
  FolderOpen,
  LogOut,
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

  // Leave modal state
  const [showLeaveModal, setShowLeaveModal] = useState<boolean>(false);

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

  // Handle Join
  const handleJoin = async () => {
    if (authLoading || isActionPending) return;

    if (!isAuthenticated) {
      router.push(`/login?redirect=/community/${encodeURIComponent(slug)}`);
      return;
    }

    setIsActionPending(true);
    setActionError(null);

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
  };

  // Handle Leave (called from modal confirmation)
  const handleLeave = async () => {
    if (isActionPending) return;

    setIsActionPending(true);
    setActionError(null);

    try {
      await communitiesApi.leave(slug);
      setIsMember(false);
      setJoinedAt(null);
      setMembersCount((prev) => Math.max(0, prev - 1));
      setShowLeaveModal(false);
      window.dispatchEvent(new Event("community-membership-changed"));
    } catch (err: any) {
      setActionError(extractErrorMessage(err) || "Failed to leave community.");
    } finally {
      setIsActionPending(false);
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
          <div className="-mx-4 h-48 rounded-none border-y bg-white p-6 sm:mx-0 sm:rounded-2xl sm:border">
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
              <div className="-mx-4 h-40 rounded-none border-y bg-white p-5 sm:mx-0 sm:rounded-2xl sm:border" />
              <div className="-mx-4 h-40 rounded-none border-y bg-white p-5 sm:mx-0 sm:rounded-2xl sm:border" />
            </div>
            <div className="-mx-4 h-60 rounded-none border-y bg-white p-5 sm:mx-0 sm:rounded-2xl sm:border" />
          </div>
        </div>
      </AppShell>
    );
  }

  if (errorMessage || !community) {
    return (
      <AppShell>
        <div className="mx-auto max-w-[1180px] py-12">
          <div className="-mx-4 rounded-none border-y border-rose-200 bg-white p-8 text-center shadow-sm sm:mx-0 sm:rounded-2xl sm:border">
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
        <div className="-mx-4 overflow-hidden rounded-none border-y bg-white p-6 shadow-sm sm:mx-0 sm:rounded-2xl sm:border">
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
                    onClick={() => setShowLeaveModal(true)}
                    className="
                      group flex items-center gap-2 rounded-xl border border-brand-sand-dark/60
                      bg-brand-sand/50 px-5 py-2.5 text-xs font-semibold text-brand-brown-900
                      transition-all duration-200 hover:border-brand-brown-700 hover:bg-brand-sand
                    "
                  >
                    <Check size={15} className="text-emerald-700" />
                    <span>Member</span>
                  </button>
                  {joinedAt && (
                    <span className="text-[11px] text-muted-foreground px-1">
                      Since {formatMemberSince(joinedAt)}
                    </span>
                  )}
                </>
              ) : (
                <button
                  onClick={handleJoin}
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
              <div className="-mx-4 space-y-4 animate-pulse sm:mx-0">
                <div className="h-36 rounded-none border-y bg-white p-5 sm:rounded-2xl sm:border" />
                <div className="h-36 rounded-none border-y bg-white p-5 sm:rounded-2xl sm:border" />
                <div className="h-36 rounded-none border-y bg-white p-5 sm:rounded-2xl sm:border" />
              </div>
            ) : filteredPosts.length > 0 ? (
              <div className="space-y-4">
                {filteredPosts.map((post) => (
                  <CommunityPostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="-mx-4 rounded-none border-y bg-white p-10 text-center shadow-sm sm:mx-0 sm:rounded-2xl sm:border">
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
            {/* Resources Card — only shown when there are published resources */}
            {(community._count?.resources ?? 0) > 0 && (
              <div className="-mx-4 rounded-none border-y bg-white p-4 sm:mx-0 sm:rounded-2xl sm:border">
                <div className="flex items-center gap-2 border-b pb-2 text-xs font-bold uppercase tracking-wider text-brand-brown-950">
                  <FolderOpen size={14} className="text-brand-desert-dark" />
                  <span>Resources</span>
                </div>
                <p className="mt-3 text-2xl font-extrabold text-brand-brown-950">{formatCount(community._count?.resources ?? 0)}</p>
                <p className="mt-0.5 text-[11px] text-brand-brown-600">Files and knowledge shared for this community.</p>
                <Link href={`/community/${community.slug}/resources`} className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-brand-sand px-3 py-2 text-xs font-semibold text-brand-brown-900 hover:bg-brand-desert-light">
                  Explore resources
                </Link>
              </div>
            )}

            <div className="-mx-4 rounded-none border-y bg-white p-4 sm:mx-0 sm:rounded-2xl sm:border">
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

      {/* Leave Community Confirmation Modal */}
      {showLeaveModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => !isActionPending && setShowLeaveModal(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-[fadeIn_150ms_ease-out]" />

          {/* Modal */}
          <div
            className="relative mx-4 w-full max-w-sm rounded-2xl border border-brand-sand-dark/40 bg-white p-6 shadow-2xl animate-[modalSlideUp_200ms_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => !isActionPending && setShowLeaveModal(false)}
              className="absolute right-3 top-3 rounded-lg p-1.5 text-brand-brown-600 transition-colors hover:bg-brand-sand/60 hover:text-brand-brown-950"
              aria-label="Close"
              disabled={isActionPending}
            >
              <X size={16} />
            </button>

            {/* Icon */}
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50">
              <LogOut size={22} className="text-rose-600" />
            </div>

            {/* Content */}
            <h3 className="mt-4 text-center text-base font-bold text-brand-brown-950">
              Leave {community.name}?
            </h3>
            <p className="mt-2 text-center text-xs leading-relaxed text-brand-brown-600">
              You’ll lose access to community posts and discussions. You can always rejoin later.
            </p>

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowLeaveModal(false)}
                disabled={isActionPending}
                className="
                  flex-1 rounded-xl border border-brand-sand-dark/60 bg-white
                  px-4 py-2.5 text-xs font-semibold text-brand-brown-900
                  transition-colors hover:bg-brand-sand/40
                  disabled:opacity-60
                "
              >
                Cancel
              </button>
              <button
                onClick={handleLeave}
                disabled={isActionPending}
                className="
                  flex-1 flex items-center justify-center gap-2 rounded-xl
                  bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white
                  transition-all hover:bg-rose-700
                  disabled:opacity-60
                "
              >
                {isActionPending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Leaving…</span>
                  </>
                ) : (
                  <>
                    <LogOut size={14} />
                    <span>Leave Community</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}