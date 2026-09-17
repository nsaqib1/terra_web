"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit3,
  ExternalLink,
  Eye,
  Filter,
  Image as ImageIcon,
  Layers,
  LayoutList,
  Loader2,
  MessageCircle,
  PenLine,
  Plus,
  RotateCcw,
  Search,
  Share2,
  SlidersHorizontal,
  Sparkles,
  Tag as TagIcon,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { postsApi } from "@/lib/api/posts";
import { usersApi } from "@/lib/api/users";
import { PostItem } from "@/lib/api/types";
import { extractErrorMessage } from "@/lib/api/errors";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

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

    if (diffInSeconds < 60) return "just now";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  } catch {
    return dateString;
  }
}

function getCommunityInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

/* -------------------------------------------------------------------------- */
/* Page Component                                                             */
/* -------------------------------------------------------------------------- */

export default function ManagePostsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [posts, setPosts] = useState<PostItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPostsCount, setTotalPostsCount] = useState(0);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCommunity, setSelectedCommunity] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"newest" | "score" | "comments" | "oldest">("newest");

  // Deletion modal state
  const [postToDelete, setPostToDelete] = useState<PostItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Feedback toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  }, []);

  // Fetch posts authored by current user
  const loadPosts = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    setError(null);

    try {
      // Fetch up to 50 posts for management overview
      const res = await usersApi.getPosts(user.id, { page: 1, limit: 50 });
      setPosts(res.data);
      setTotalPostsCount(res.meta.total);
      setTotalPages(res.meta.totalPages || 1);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.id) {
      void loadPosts();
    }
  }, [authLoading, isAuthenticated, user?.id, loadPosts]);

  // Extract unique communities the user has posted in
  const userCommunities = useMemo(() => {
    const map = new Map<string, { id: string; name: string; slug: string }>();
    for (const post of posts) {
      if (post.community && !map.has(post.community.id)) {
        map.set(post.community.id, post.community);
      }
    }
    return Array.from(map.values());
  }, [posts]);

  // Aggregate stats
  const stats = useMemo(() => {
    const totalScore = posts.reduce((acc, p) => acc + (p.score || 0), 0);
    const totalComments = posts.reduce((acc, p) => acc + (p.commentCount || 0), 0);
    return {
      totalPosts: totalPostsCount || posts.length,
      totalScore,
      totalComments,
      communitiesCount: userCommunities.length,
    };
  }, [posts, totalPostsCount, userCommunities.length]);

  // Filtered and sorted posts
  const filteredPosts = useMemo(() => {
    let result = [...posts];

    // Filter by community
    if (selectedCommunity !== "ALL") {
      result = result.filter((p) => p.community?.id === selectedCommunity);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((p) => {
        const text = getPostPreviewText(p.document).toLowerCase();
        const tagMatch = p.tags?.some((t) => t.name.toLowerCase().includes(q));
        const communityMatch = p.community?.name.toLowerCase().includes(q);
        return text.includes(q) || tagMatch || communityMatch;
      });
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === "score") {
        return (b.score || 0) - (a.score || 0);
      }
      if (sortBy === "comments") {
        return (b.commentCount || 0) - (a.commentCount || 0);
      }
      return 0;
    });

    return result;
  }, [posts, selectedCommunity, searchQuery, sortBy]);

  // Handle Delete Post
  async function confirmDeletePost() {
    if (!postToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      await postsApi.remove(postToDelete.id);
      // Optimistic state update
      setPosts((prev) => prev.filter((p) => p.id !== postToDelete.id));
      setTotalPostsCount((prev) => Math.max(0, prev - 1));
      showToast("Post was successfully deleted.");
      setPostToDelete(null);
    } catch (err) {
      setDeleteError(extractErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  }

  // Handle Share Link
  function handleCopyLink(postId: string) {
    const url = `${window.location.origin}/posts/${postId}`;
    navigator.clipboard.writeText(url);
    setCopiedPostId(postId);
    showToast("Link copied to clipboard!");
    setTimeout(() => {
      setCopiedPostId(null);
    }, 2000);
  }

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="mx-auto max-w-[1100px] space-y-6 pb-16">
          {/* Toast feedback banner */}
          {toastMessage && (
            <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl bg-brand-brown-950 px-4 py-3 text-xs font-semibold text-white shadow-xl animate-in fade-in slide-in-from-bottom-3">
              <Check size={16} className="text-brand-desert" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Top Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Link
                  href="/"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-brand-brown-950"
                >
                  <ArrowLeft size={13} />
                  Home
                </Link>
                <span className="text-xs text-muted-foreground/50">/</span>
                <span className="text-xs font-semibold text-brand-brown-800">
                  Manage Posts
                </span>
              </div>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-brand-brown-950 sm:text-3xl">
                My Authored Posts
              </h1>
              <p className="mt-1 text-sm text-brand-brown-600">
                View, filter, edit, or remove the discussions and contributions you have created.
              </p>
            </div>

            <Link href="/posts/create">
              <Button className="h-10 gap-2 rounded-xl bg-brand-brown-950 px-4 font-semibold text-white shadow-xs hover:bg-brand-brown-900">
                <Plus size={16} />
                Create New Post
              </Button>
            </Link>
          </div>

          {/* Quick Stats Overview Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <div className="rounded-2xl border border-brand-sand-dark/60 bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-brand-brown-600">Total Posts</span>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-sand/70 text-brand-brown-800">
                  <Layers size={14} />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold text-brand-brown-950">
                {isLoading ? "-" : stats.totalPosts}
              </p>
              <span className="text-[11px] text-muted-foreground">Authored by you</span>
            </div>

            <div className="rounded-2xl border border-brand-sand-dark/60 bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-brand-brown-600">Net Upvotes</span>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                  <TrendingUp size={14} />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold text-brand-brown-950">
                {isLoading ? "-" : stats.totalScore}
              </p>
              <span className="text-[11px] text-emerald-600 font-medium">Community score</span>
            </div>

            <div className="rounded-2xl border border-brand-sand-dark/60 bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-brand-brown-600">Discussions</span>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                  <MessageCircle size={14} />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold text-brand-brown-950">
                {isLoading ? "-" : stats.totalComments}
              </p>
              <span className="text-[11px] text-muted-foreground">Comments received</span>
            </div>

            <div className="rounded-2xl border border-brand-sand-dark/60 bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-brand-brown-600">Communities</span>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-800">
                  <Sparkles size={14} />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold text-brand-brown-950">
                {isLoading ? "-" : stats.communitiesCount}
              </p>
              <span className="text-[11px] text-muted-foreground">Active hubs</span>
            </div>
          </div>

          {/* Search, Filter & Controls Bar */}
          <div className="rounded-2xl border border-brand-sand-dark/60 bg-white p-4 shadow-2xs">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              {/* Search input */}
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-brown-600/70"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search in your posts by content, tag, or community..."
                  className="h-10 w-full rounded-xl border border-brand-sand-dark/70 bg-brand-cream/60 pl-10 pr-9 text-xs text-brand-brown-950 outline-none placeholder:text-brand-brown-600/60 focus:border-brand-desert-dark focus:ring-2 focus:ring-brand-desert-light"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-brand-brown-950"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Filter Controls */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Community filter */}
                <div className="relative">
                  <select
                    value={selectedCommunity}
                    onChange={(e) => setSelectedCommunity(e.target.value)}
                    className="h-10 appearance-none rounded-xl border border-brand-sand-dark/70 bg-white pl-3.5 pr-8 text-xs font-semibold text-brand-brown-800 outline-none hover:bg-brand-sand/30 focus:border-brand-desert-dark"
                  >
                    <option value="ALL">All Communities</option>
                    {userCommunities.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={13}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-brand-brown-600"
                  />
                </div>

                {/* Sort selector */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="h-10 appearance-none rounded-xl border border-brand-sand-dark/70 bg-white pl-3.5 pr-8 text-xs font-semibold text-brand-brown-800 outline-none hover:bg-brand-sand/30 focus:border-brand-desert-dark"
                  >
                    <option value="newest">Sort: Newest First</option>
                    <option value="score">Sort: Highest Score</option>
                    <option value="comments">Sort: Most Comments</option>
                    <option value="oldest">Sort: Oldest First</option>
                  </select>
                  <ChevronDown
                    size={13}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-brand-brown-600"
                  />
                </div>

                {/* Reset button if filtered */}
                {(searchQuery || selectedCommunity !== "ALL" || sortBy !== "newest") && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCommunity("ALL");
                      setSortBy("newest");
                    }}
                    className="h-10 gap-1.5 rounded-xl px-3 text-xs font-semibold text-brand-brown-700 hover:bg-brand-sand/60"
                  >
                    <RotateCcw size={13} />
                    Reset
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Posts List Section */}
          <div className="space-y-3">
            {isLoading ? (
              <div className="space-y-3">
                <PostCardSkeleton />
                <PostCardSkeleton />
                <PostCardSkeleton />
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50/70 p-6 text-center">
                <AlertCircle size={24} className="mx-auto text-red-500 mb-2" />
                <h3 className="text-sm font-bold text-red-800">Could not load your posts</h3>
                <p className="mt-1 text-xs text-red-600">{error}</p>
                <Button
                  onClick={() => void loadPosts()}
                  className="mt-4 h-8 rounded-lg bg-red-600 px-4 text-xs font-semibold text-white hover:bg-red-700"
                >
                  Try Again
                </Button>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-brand-sand-dark bg-white p-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-sand/70 text-brand-brown-800">
                  <LayoutList size={26} />
                </div>
                {posts.length === 0 ? (
                  <>
                    <h3 className="mt-4 text-base font-bold text-brand-brown-950">
                      You haven&apos;t created any posts yet
                    </h3>
                    <p className="mt-1.5 max-w-md mx-auto text-xs text-brand-brown-600">
                      Share your insights, start a discussion, or ask a question in any of your joined communities.
                    </p>
                    <Link href="/posts/create">
                      <Button className="mt-5 h-9 gap-1.5 rounded-xl bg-brand-brown-950 px-4 text-xs font-semibold text-white hover:bg-brand-brown-900">
                        <Plus size={14} />
                        Create Your First Post
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <h3 className="mt-4 text-base font-bold text-brand-brown-950">
                      No posts match your filters
                    </h3>
                    <p className="mt-1 max-w-md mx-auto text-xs text-brand-brown-600">
                      Try adjusting your search query or community selection to see results.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCommunity("ALL");
                      }}
                      className="mt-4 h-8 rounded-lg text-xs font-semibold text-brand-brown-800"
                    >
                      Clear Filters
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1 text-xs text-brand-brown-600">
                  <span>
                    Showing <strong className="text-brand-brown-950">{filteredPosts.length}</strong> post
                    {filteredPosts.length === 1 ? "" : "s"}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Sorted by {sortBy === "newest" ? "Newest" : sortBy === "score" ? "Highest Score" : sortBy === "comments" ? "Most Comments" : "Oldest"}
                  </span>
                </div>

                {filteredPosts.map((post) => {
                  const preview = getPostPreviewText(post.document);
                  const isEdited = post.updatedAt && post.createdAt && new Date(post.updatedAt).getTime() - new Date(post.createdAt).getTime() > 10000;
                  const hasMedia = Boolean(post.media && post.media.length > 0);

                  return (
                    <div
                      key={post.id}
                      className="group relative rounded-2xl border border-brand-sand-dark/70 bg-white p-5 transition-all duration-200 hover:border-brand-desert-dark/60 hover:shadow-[0_4px_20px_rgba(72,64,48,0.06)]"
                    >
                      {/* Top Bar: Community + Timestamp + Actions */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-2.5">
                          {/* Community Badge */}
                          <Link
                            href={`/community/${post.community?.slug}`}
                            className="flex items-center gap-2 rounded-lg bg-brand-sand/50 px-2.5 py-1 text-xs font-bold text-brand-brown-900 transition-colors hover:bg-brand-sand hover:text-brand-brown-950"
                          >
                            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-brand-desert-light text-[10px] font-bold text-brand-brown-800">
                              {getCommunityInitials(post.community?.name || "C")}
                            </span>
                            <span>{post.community?.name}</span>
                          </Link>

                          <span className="text-muted-foreground/50">•</span>

                          <span className="flex items-center gap-1 text-xs text-muted-foreground" title={new Date(post.createdAt).toLocaleString()}>
                            <Clock size={12} />
                            {formatRelativeTime(post.createdAt)}
                          </span>

                          {isEdited && (
                            <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                              Edited
                            </span>
                          )}
                        </div>

                        {/* Top Right Action Button Bar */}
                        <div className="flex items-center gap-1.5">
                          {/* Share Button */}
                          <button
                            type="button"
                            onClick={() => handleCopyLink(post.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-brown-600 transition-colors hover:bg-brand-sand/60 hover:text-brand-brown-950"
                            title="Copy link"
                            aria-label="Copy link"
                          >
                            {copiedPostId === post.id ? (
                              <Check size={14} className="text-emerald-600" />
                            ) : (
                              <Share2 size={14} />
                            )}
                          </button>

                          {/* Edit Post Button */}
                          <Link
                            href={`/posts/${post.id}/edit`}
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-brand-sand-dark/70 bg-brand-sand/30 px-3 text-xs font-semibold text-brand-brown-900 transition-colors hover:bg-brand-sand hover:text-brand-brown-950"
                          >
                            <Edit3 size={13} />
                            <span>Edit</span>
                          </Link>

                          {/* Delete Post Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteError(null);
                              setPostToDelete(post);
                            }}
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-red-100 bg-red-50/50 px-3 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100/80 hover:text-red-900"
                            title="Delete post"
                          >
                            <Trash2 size={13} />
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                        </div>
                      </div>

                      {/* Post Content Excerpt */}
                      <Link href={`/posts/${post.id}`} className="block mt-3">
                        <p className="line-clamp-3 text-sm leading-relaxed text-brand-brown-900 group-hover:text-brand-brown-950">
                          {preview || <span className="italic text-muted-foreground">No text content</span>}
                        </p>
                      </Link>

                      {/* Bottom row: Tags, Media flag, and Engagement metrics */}
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-brand-sand/60 pt-3">
                        {/* Tags & Media Indicator */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          {hasMedia && (
                            <span className="flex items-center gap-1 rounded-md bg-brand-desert-light/60 px-2 py-0.5 text-[11px] font-semibold text-brand-brown-800">
                              <ImageIcon size={12} />
                              Media
                            </span>
                          )}

                          {post.tags && post.tags.length > 0 ? (
                            post.tags.map((tag) => (
                              <span
                                key={tag.id}
                                className="flex items-center gap-1 rounded-md bg-brand-sand/60 px-2 py-0.5 text-xs font-medium text-brand-brown-700"
                              >
                                <TagIcon size={11} className="text-brand-brown-500" />
                                {tag.name}
                              </span>
                            ))
                          ) : null}
                        </div>

                        {/* Engagement Stats & View Details Link */}
                        <div className="flex items-center gap-3">
                          {/* Score Pill */}
                          <div
                            className="flex items-center gap-1 rounded-md bg-brand-sand/40 px-2 py-0.5 text-xs font-semibold text-brand-brown-800"
                            title="Post score (Upvotes minus downvotes)"
                          >
                            <ArrowUp size={13} className="text-emerald-700" />
                            <span>{post.score || 0}</span>
                          </div>

                          {/* Comments Pill */}
                          <div
                            className="flex items-center gap-1 rounded-md bg-brand-sand/40 px-2 py-0.5 text-xs font-semibold text-brand-brown-800"
                            title="Total comments"
                          >
                            <MessageCircle size={13} className="text-blue-700" />
                            <span>{post.commentCount || 0}</span>
                          </div>

                          {/* View Post link */}
                          <Link
                            href={`/posts/${post.id}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-brand-brown-950 hover:underline"
                          >
                            <span>Open Post</span>
                            <ExternalLink size={12} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {postToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-md rounded-2xl border border-brand-sand-dark bg-white p-6 shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
                  <Trash2 size={20} />
                </div>
                <button
                  type="button"
                  onClick={() => setPostToDelete(null)}
                  disabled={isDeleting}
                  className="rounded-lg p-1 text-muted-foreground hover:bg-brand-sand hover:text-brand-brown-950"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-4">
                <h3 className="text-lg font-bold text-brand-brown-950">
                  Delete this post?
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-brand-brown-600">
                  Are you sure you want to delete this post from{" "}
                  <strong>{postToDelete.community?.name}</strong>? This will permanently remove the
                  post and citizens will no longer be able to read or comment on it.
                </p>

                {/* Excerpt preview in dialog */}
                <div className="mt-3 rounded-xl bg-brand-sand/40 p-3 text-xs text-brand-brown-800 line-clamp-2 border border-brand-sand-dark/40">
                  {getPostPreviewText(postToDelete.document) || "Post without text"}
                </div>

                {deleteError && (
                  <p className="mt-3 text-xs font-semibold text-red-600">
                    {deleteError}
                  </p>
                )}
              </div>

              <div className="mt-6 flex items-center justify-end gap-2.5">
                <Button
                  variant="outline"
                  disabled={isDeleting}
                  onClick={() => setPostToDelete(null)}
                  className="rounded-xl border-brand-sand-dark text-xs font-semibold text-brand-brown-800 hover:bg-brand-sand/60"
                >
                  Cancel
                </Button>

                <Button
                  disabled={isDeleting}
                  onClick={confirmDeletePost}
                  className="rounded-xl bg-red-600 px-4 text-xs font-semibold text-white shadow-xs hover:bg-red-700 disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 size={14} className="animate-spin mr-1.5" />
                      Deleting…
                    </>
                  ) : (
                    "Delete Permanently"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </AppShell>
    </ProtectedRoute>
  );
}

function PostCardSkeleton() {
  return (
    <div className="rounded-2xl border border-brand-sand-dark/60 bg-white p-5 space-y-3 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-6 w-28 rounded-lg bg-brand-sand" />
          <div className="h-4 w-16 rounded bg-brand-sand/70" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-16 rounded-lg bg-brand-sand" />
          <div className="h-8 w-16 rounded-lg bg-brand-sand" />
        </div>
      </div>
      <div className="space-y-2 py-1">
        <div className="h-4 w-full rounded bg-brand-sand" />
        <div className="h-4 w-4/5 rounded bg-brand-sand/70" />
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-brand-sand/60">
        <div className="flex gap-1.5">
          <div className="h-5 w-14 rounded bg-brand-sand" />
          <div className="h-5 w-14 rounded bg-brand-sand" />
        </div>
        <div className="h-5 w-20 rounded bg-brand-sand" />
      </div>
    </div>
  );
}
