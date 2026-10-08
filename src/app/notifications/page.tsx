"use client";

import { Bell, ChevronLeft, ChevronRight, MessageCircle, ThumbsUp } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { getNotificationMessage, notificationsApi } from "@/lib/api/notifications";
import type { NotificationItem } from "@/lib/api/types";

function formatRelativeTime(value: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function initials(name: string) {
  return name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
}

export default function NotificationsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const load = useCallback(async (nextCursor?: string) => {
    if (!isAuthenticated) return;
    const response = await notificationsApi.list(nextCursor, 30);
    setItems((current) => (nextCursor ? [...current, ...response.data] : response.data));
    setCursor(response.nextCursor);
    setHasMore(response.hasMore);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [isAuthenticated, load]);

  const handleLoadMore = async () => {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      await load(cursor);
    } finally {
      setLoadingMore(false);
    }
  };

  const markRead = async (notification: NotificationItem) => {
    if (notification.readAt) return;
    setItems((current) =>
      current.map((item) =>
        item.id === notification.id ? { ...item, readAt: new Date().toISOString() } : item,
      ),
    );
    try {
      await notificationsApi.markRead(notification.id);
    } catch {
      // Keep the optimistic UI; the next refresh will reconcile it.
    }
  };

  if (authLoading || !isAuthenticated) return null;

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl py-2">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-sand text-brand-brown-800">
                <Bell size={18} />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-brand-brown-950">Notifications</h1>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Stay up to date with activity around your posts and comments.
            </p>
          </div>
          <Link
            href="/"
            className="hidden items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold text-brand-brown-700 hover:bg-brand-sand sm:flex"
          >
            <ChevronLeft size={15} />
            Home
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-brand-sand-dark bg-white shadow-sm">
          {loading ? (
            <div className="divide-y divide-brand-sand/60">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="flex gap-4 p-5">
                  <div className="h-10 w-10 animate-pulse rounded-full bg-brand-sand" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3.5 w-3/5 animate-pulse rounded bg-brand-sand" />
                    <div className="h-3 w-1/4 animate-pulse rounded bg-brand-sand/70" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-sand text-brand-brown-700">
                <Bell size={22} />
              </div>
              <h2 className="mt-4 text-base font-bold text-brand-brown-950">You&apos;re all caught up</h2>
              <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                When someone interacts with your posts or comments, their activity will appear here.
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-brand-sand/60">
                {items.map((notification) => {
                  const actor = notification.actor;
                  const href = notification.postId
                    ? `/posts/${notification.postId}${notification.commentId ? `#comment-${notification.commentId}` : ""}`
                    : "/notifications";

                  return (
                    <Link
                      key={notification.id}
                      href={href}
                      onClick={() => markRead(notification)}
                      className={`flex gap-4 p-5 transition-colors hover:bg-brand-cream ${
                        !notification.readAt ? "bg-brand-cream/45" : ""
                      }`}
                    >
                      <Avatar className="h-10 w-10 shrink-0 border border-brand-sand-dark">
                        {actor?.avatarUrl && <AvatarImage src={actor.avatarUrl} alt={actor.displayName} />}
                        <AvatarFallback className="bg-brand-desert text-xs font-bold text-brand-brown-950">
                          {initials(actor?.displayName || "Terramids")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm leading-6 text-brand-brown-900">
                          <span className="font-bold">{actor?.displayName || "Someone"}</span>{" "}
                          {getNotificationMessage(notification)}
                        </p>
                        <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                          {notification.type.includes("UPVOTED") ? <ThumbsUp size={13} /> : <MessageCircle size={13} />}
                          <span>{formatRelativeTime(notification.createdAt)}</span>
                          {!notification.readAt && (
                            <span className="h-1.5 w-1.5 rounded-full bg-brand-brown-950" aria-label="Unread" />
                          )}
                        </div>
                      </div>
                      <ChevronRight className="mt-2 shrink-0 text-brand-brown-400" size={17} />
                    </Link>
                  );
                })}
              </div>

              {hasMore && (
                <div className="border-t border-brand-sand/60 p-3 text-center">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="rounded-xl px-4 py-2 text-xs font-bold text-brand-brown-800 hover:bg-brand-sand disabled:opacity-50"
                  >
                    {loadingMore ? "Loading…" : "Load more"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
