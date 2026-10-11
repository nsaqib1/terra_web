"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { PlusCircle, RefreshCw, AlertCircle, Sparkles, CheckCircle2, Info, X } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { FeedPostCard } from "@/components/feed/FeedPostCard";
import { FeedSorting } from "@/components/feed/FeedSorting";
import { FeedSkeleton } from "@/components/feed/FeedSkeleton";
import { FeedEmptyState } from "@/components/feed/FeedEmptyState";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";
import { postsApi } from "@/lib/api/posts";
import { PostItem, PostSortOption } from "@/lib/api/types";
import { extractErrorMessage } from "@/lib/api/errors";

const PAGE_SIZE = 10;

export default function Home() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const requestInFlightRef = useRef(false);
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
    async (cursor: string | null, sort: PostSortOption, append = false) => {
      if (requestInFlightRef.current) return;
      requestInFlightRef.current = true;
      setErrorMessage(null);
      if (append) setIsLoadingMore(true);
      else {
        setIsLoading(true);
        setErrorMessage(null);
      }

      try {
        const response = await postsApi.list({
          limit: PAGE_SIZE,
          sort,
          cursor: cursor ?? undefined,
          cursorMode: true,
          tag: selectedTag ?? undefined,
        });
        const batch = response.data || [];
        setPosts((current) => append ? [...current, ...batch.filter((item) => !current.some((existing) => existing.id === item.id))] : batch);
        setNextCursor(response.meta?.nextCursor ?? null);
        setHasMore(Boolean(response.meta?.hasNextPage && response.meta?.nextCursor));
      } catch (err: unknown) {
        const msg = extractErrorMessage(err) || "Failed to load discussions feed.";
        setErrorMessage(msg);
      } finally {
        requestInFlightRef.current = false;
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [selectedTag]
  );

  // Initial load and refresh whenever the sorting mode changes.
  useEffect(() => {
    setPosts([]);
    setNextCursor(null);
    setHasMore(true);
    loadFeed(null, currentSort, false);
  }, [loadFeed, currentSort, selectedTag]);

  // Load the next batch automatically when the sentinel approaches the viewport.
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore || isLoading || isLoadingMore || errorMessage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && nextCursor && !requestInFlightRef.current) {
          loadFeed(nextCursor, currentSort, true);
        }
      },
      { rootMargin: "500px 0px", threshold: 0 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, isLoading, isLoadingMore, errorMessage, nextCursor, currentSort, loadFeed]);

  const handleSortChange = (newSort: PostSortOption) => {
    if (newSort === currentSort) return;
    setCurrentSort(newSort);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRefresh = () => {
    setPosts([]);
    setNextCursor(null);
    setHasMore(true);
    loadFeed(null, currentSort, false);
  };

  const displayedPosts = posts;

  return (
    <ProtectedRoute>
      <OnboardingModal onComplete={() => handleRefresh()} />
      <AppShell
        contextualSidebarContent={
          <FeedSorting
            currentSort={currentSort}
            onSortChange={handleSortChange}
            isLoading={isLoading}
            variant="sidebar"
          />
        }
      >
        <div className="mx-auto max-w-[740px] pb-12">
          {/* Feed controls */}
          <div className={`space-y-4 ${selectedTag ? "mb-4" : "mb-4 2xl:mb-0"}`}>
            <FeedSorting
              currentSort={currentSort}
              onSortChange={handleSortChange}
              isLoading={isLoading}
              variant="compact"
            />

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
            <div className="-mx-4 rounded-none border-y border-red-200 bg-red-50/70 p-6 text-center backdrop-blur-sm sm:mx-0 sm:rounded-2xl sm:border">
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
            <div className="-mx-4 space-y-4 sm:mx-0">
              {displayedPosts.map((post) => (
                <FeedPostCard
                  key={post.id}
                  post={post}
                  onTagClick={(tag) => setSelectedTag(tag)}
                  onErrorToast={(msg) => showToast(msg, "error")}
                />
              ))}

              <div ref={sentinelRef} aria-hidden="true" className="h-1 w-full" />
              {isLoadingMore && <FeedSkeleton />}
              {!hasMore && posts.length > 0 && (
                <p className="py-6 text-center text-xs text-muted-foreground">You're all caught up.</p>
              )}
              {errorMessage && posts.length > 0 && (
                <div className="py-4 text-center">
                  <p className="mb-2 text-xs text-red-700">Couldn't load more discussions.</p>
                  <button type="button" onClick={() => loadFeed(nextCursor, currentSort, true)} className="text-xs font-semibold text-brand-brown-800 hover:underline">Try again</button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Floating Toast Notification */}
        {toast && (
          <div
            className={`
              fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl px-4 py-3 text-xs font-semibold shadow-xl transition-all animate-in fade-in slide-in-from-bottom-5
              ${toast.type === "error"
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