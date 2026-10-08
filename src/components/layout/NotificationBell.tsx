"use client";

import {
  Bell,
  ChevronRight,
  MessageCircle,
  ThumbsUp,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { useNotificationRealtime } from "@/context/NotificationRealtimeContext";
import {
  getNotificationMessage,
  notificationsApi,
} from "@/lib/api/notifications";
import type { NotificationItem } from "@/lib/api/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function formatRelativeTime(value: string): string {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w`;
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function NotificationIcon({ type }: { type: NotificationItem["type"] }) {
  if (type === "POST_UPVOTED" || type === "COMMENT_UPVOTED") {
    return <ThumbsUp size={14} strokeWidth={2.25} />;
  }
  return <MessageCircle size={14} strokeWidth={2.25} />;
}

export function NotificationBell() {
  const { isAuthenticated, isLoading } = useAuth();
  const {
    count,
    latestNotification,
    refreshCount,
    markAllReadLocal,
  } = useNotificationRealtime();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const loadNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const response = await notificationsApi.list(undefined, 8);
      setItems(response.data);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setItems([]);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!latestNotification) return;

    setItems((current) => [
      latestNotification,
      ...current.filter((item) => item.id !== latestNotification.id),
    ].slice(0, 8));
  }, [latestNotification]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  const handleOpen = async () => {
    const nextOpen = !open;
    setOpen(nextOpen);
    if (!nextOpen) return;

    await loadNotifications();

    if (count > 0) {
      markAllReadLocal();
      try {
        await notificationsApi.markAllRead();
      } catch {
        await refreshCount();
      }
    }
  };

  if (isLoading || !isAuthenticated) return null;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={handleOpen}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl text-brand-brown-800 transition-colors hover:bg-brand-sand"
        aria-label={count > 0 ? `${count} unread notifications` : "Notifications"}
        aria-expanded={open}
      >
        <Bell size={20} strokeWidth={2} />
        {count > 0 && (
          <span className="absolute right-0.5 top-0.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-brand-brown-950 px-1 text-[9px] font-bold leading-none text-white ring-2 ring-white">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-[min(380px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-brand-sand-dark bg-white shadow-xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between border-b border-brand-sand/70 px-4 py-3">
            <div>
              <h2 className="text-sm font-bold text-brand-brown-950">Notifications</h2>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Your latest activity
              </p>
            </div>
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="flex items-center gap-0.5 rounded-lg px-2 py-1.5 text-[11px] font-bold text-brand-brown-700 hover:bg-brand-sand"
            >
              View all
              <ChevronRight size={13} />
            </Link>
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {loading ? (
              <div className="space-y-3 p-4">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex gap-3">
                    <div className="h-9 w-9 animate-pulse rounded-full bg-brand-sand" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-3 w-4/5 animate-pulse rounded bg-brand-sand" />
                      <div className="h-2.5 w-1/4 animate-pulse rounded bg-brand-sand/70" />
                    </div>
                  </div>
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-brand-sand text-brand-brown-700">
                  <Bell size={19} />
                </div>
                <p className="mt-3 text-sm font-semibold text-brand-brown-900">
                  You&apos;re all caught up
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  New activity will appear here.
                </p>
              </div>
            ) : (
              items.map((notification) => {
                const actor = notification.actor;
                const href = notification.postId
                  ? `/posts/${notification.postId}${notification.commentId ? `#comment-${notification.commentId}` : ""}`
                  : "/notifications";

                return (
                  <Link
                    key={notification.id}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`flex gap-3 border-b border-brand-sand/50 px-4 py-3 transition-colors last:border-b-0 hover:bg-brand-cream ${!notification.readAt ? "bg-brand-cream/45" : ""}`}
                  >
                    <Avatar className="h-9 w-9 shrink-0 border border-brand-sand-dark">
                      {actor?.avatarUrl && (
                        <AvatarImage src={actor.avatarUrl} alt={actor.displayName} />
                      )}
                      <AvatarFallback className="bg-brand-desert text-[10px] font-bold text-brand-brown-950">
                        {getInitials(actor?.displayName || "Terramids")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs leading-5 text-brand-brown-900">
                        <span className="font-bold">
                          {actor?.displayName || "Someone"}
                        </span>{" "}
                        {getNotificationMessage(notification)}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <NotificationIcon type={notification.type} />
                        <span>{formatRelativeTime(notification.createdAt)}</span>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
