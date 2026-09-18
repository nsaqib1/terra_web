"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { PlusCircle, RefreshCw, AlertCircle, Sparkles, CheckCircle2, Info, X } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { FeedPostCard } from "@/components/feed/FeedPostCard";
import { FeedSorting } from "@/components/feed/FeedSorting";
import { FeedPagination } from "@/components/feed/FeedPagination";
import { FeedSkeleton } from "@/components/feed/FeedSkeleton";
import { FeedEmptyState } from "@/components/feed/FeedEmptyState";
import { postsApi } from "@/lib/api/posts";
import { PostItem, PostSortOption } from "@/lib/api/types";
import { extractErrorMessage } from "@/lib/api/errors";

const PAGE_SIZE = 10;

export default function Home() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [currentSort, setCurrentSort] = useState<PostSortOption>("newest");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  const loadFeed = useCallback(
    async (page: number, sort: PostSortOption) => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await postsApi.list({
          page,
          limit: PAGE_SIZE,
          sort,
        });

        setPosts(response.data || []);
        setCurrentPage(response.meta?.page || page);
        setTotalPages(response.meta?.totalPages || 1);
        setTotalItems(response.meta?.total || 0);
      } catch (err: unknown) {
        const msg = extractErrorMessage(err) || "Failed to load discussions feed.";
        setErrorMessage(msg);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Initial fetch and fetch on sort or page change
  useEffect(() => {
    loadFeed(currentPage, currentSort);
  }, [loadFeed, currentPage, currentSort]);

  const handleSortChange = (newSort: PostSortOption) => {
    if (newSort === currentSort) return;
    setCurrentSort(newSort);
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage === currentPage || newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRefresh = () => {
    loadFeed(currentPage, currentSort);
  };

  // Filter posts by tag if one is selected client-side
  const displayedPosts = selectedTag
    ? posts.filter((post) =>
        post.tags?.some(
          (t) =>
            t.name.toLowerCase() === selectedTag.toLowerCase() ||
            t.slug.toLowerCase() === selectedTag.toLowerCase()
        )
      )
    : posts;

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="mx-auto max-w-[850px] pb-12">
          {/* Header & Controls */}
          <div className="mb-6 space-y-4">
            {/* Sorting Bar */}
            <div className="flex items-center justify-between border-b border-brand-sand-dark/50 pb-3">
              <FeedSorting
                currentSort={currentSort}
                onSortChange={handleSortChange}
                isLoading={isLoading}
              />
            </div>

            {/* Active Tag Filter Tag */}
            {selectedTag && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-muted-foreground">Filtering by tag:</span>
                <span className="inline-flex items-center gap-1 rounded-lg bg-brand-desert-light px-2.5 py-1 text-xs font-bold text-brand-brown-900">
                  #{selectedTag}
                  <button
                    type="button"
                    onClick={() => setSelectedTag(null)}
                    className="ml-1 rounded-full p-0.5 hover:bg-brand-sand-dark/40"
                    aria-label="Clear tag filter"
                  >
                    <X size={12} />
                  </button>
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedTag(null)}
                  className="text-xs text-brand-brown-700 hover:underline"
                >
                  Clear filter
                </button>
              </div>
            )}
          </div>

          {/* Feed Content */}
          {isLoading ? (
            <FeedSkeleton />
          ) : errorMessage ? (
            <div className="rounded-2xl border border-red-200 bg-red-50/70 p-6 text-center backdrop-blur-sm">
              <AlertCircle size={28} className="mx-auto text-red-600 mb-2" />
              <h3 className="text-sm font-bold text-red-950">Unable to load discussions</h3>
              <p className="mt-1 text-xs text-red-700 max-w-md mx-auto">{errorMessage}</p>
              <button
                type="button"
                onClick={handleRefresh}
                className="
                  mt-4 inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2
                  text-xs font-bold text-white shadow-sm transition-colors
                  hover:bg-red-700
                "
              >
                <RefreshCw size={13} />
                <span>Try Again</span>
              </button>
            </div>
          ) : displayedPosts.length === 0 ? (
            <FeedEmptyState
              hasFilter={Boolean(selectedTag)}
              onResetFilter={() => setSelectedTag(null)}
            />
          ) : (
            <div className="space-y-4">
              {displayedPosts.map((post) => (
                <FeedPostCard
                  key={post.id}
                  post={post}
                  onTagClick={(tag) => setSelectedTag(tag)}
                  onErrorToast={(msg) => showToast(msg, "error")}
                />
              ))}

              {/* Pagination */}
              <FeedPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={PAGE_SIZE}
                onPageChange={handlePageChange}
                isLoading={isLoading}
              />
            </div>
          )}
        </div>

        {/* Floating Toast Notification */}
        {toast && (
          <div
            className={`
              fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl px-4 py-3 text-xs font-semibold shadow-xl transition-all animate-in fade-in slide-in-from-bottom-5
              ${
                toast.type === "error"
                  ? "bg-red-900 text-white shadow-red-900/20"
                  : toast.type === "success"
                  ? "bg-brand-brown-950 text-white shadow-brand-brown-950/20"
                  : "bg-brand-brown-900 text-white shadow-brand-brown-900/20"
              }
            `}
          >
            {toast.type === "error" && <AlertCircle size={16} className="text-red-300 shrink-0" />}
            {toast.type === "success" && <CheckCircle2 size={16} className="text-green-300 shrink-0" />}
            {toast.type === "info" && <Info size={16} className="text-brand-desert shrink-0" />}
            <span>{toast.message}</span>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="ml-2 rounded-lg p-1 hover:bg-white/10"
              aria-label="Dismiss toast"
            >
              <X size={13} />
            </button>
          </div>
        )}
      </AppShell>
    </ProtectedRoute>
  );
}