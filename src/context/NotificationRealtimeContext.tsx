"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";

import { useAuth } from "./AuthContext";
import { notificationsApi } from "@/lib/api/notifications";
import type { NotificationItem } from "@/lib/api/types";
import { tokenStorage } from "@/lib/api/token";
import {
  getNotificationMessage,
} from "@/lib/api/notifications";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, MessageCircle, ThumbsUp, X } from "lucide-react";
import Link from "next/link";

interface NotificationRealtimeContextValue {
  count: number;
  latestNotification: NotificationItem | null;
  connected: boolean;
  refreshCount: () => Promise<void>;
  markReadLocal: (notificationId: string) => void;
  markAllReadLocal: () => void;
}

const NotificationRealtimeContext =
  createContext<NotificationRealtimeContextValue | null>(null);

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const SOCKET_URL = API_URL
  ? API_URL.replace(/\/api\/v1\/?$/, "")
  : "";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatToastText(notification: NotificationItem) {
  return getNotificationMessage(notification);
}

function NotificationToast({
  notification,
  onClose,
  onOpen,
}: {
  notification: NotificationItem;
  onClose: () => void;
  onOpen: () => void;
}) {
  const actor = notification.actor;
  const href = notification.postId
    ? `/posts/${notification.postId}${
        notification.commentId ? `#comment-${notification.commentId}` : ""
      }`
    : "/notifications";

  const isVote =
    notification.type === "POST_UPVOTED" ||
    notification.type === "COMMENT_UPVOTED";

  return (
    <div className="fixed right-4 top-20 z-[100] w-[min(380px,calc(100vw-2rem))] animate-in slide-in-from-right-4 fade-in duration-200">
      <Link
        href={href}
        onClick={onOpen}
        className="group flex gap-3 rounded-2xl border border-brand-sand-dark bg-white p-3.5 shadow-2xl transition-colors hover:bg-brand-cream"
      >
        <Avatar className="h-10 w-10 shrink-0 border border-brand-sand-dark">
          {actor?.avatarUrl && (
            <AvatarImage src={actor.avatarUrl} alt={actor.displayName} />
          )}
          <AvatarFallback className="bg-brand-desert text-xs font-bold text-brand-brown-950">
            {getInitials(actor?.displayName || "Terramids")}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-brand-brown-500">
            New notification
          </p>
          <p className="mt-0.5 text-sm leading-5 text-brand-brown-950">
            <span className="font-bold">{actor?.displayName || "Someone"}</span>{" "}
            {formatToastText(notification)}
          </p>
          <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-brand-brown-500">
            {isVote ? <ThumbsUp size={13} /> : <MessageCircle size={13} />}
            <span>View activity</span>
          </div>
        </div>

        <button
          type="button"
          aria-label="Dismiss notification"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onClose();
          }}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-brand-brown-500 opacity-0 transition-opacity hover:bg-brand-sand group-hover:opacity-100"
        >
          <X size={14} />
        </button>
      </Link>
    </div>
  );
}

export function NotificationRealtimeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, checkAuth } = useAuth();
  const [count, setCount] = useState(0);
  const [latestNotification, setLatestNotification] =
    useState<NotificationItem | null>(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const reconnectingAuthRef = useRef(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countMutationVersionRef = useRef(0);

  const refreshCount = useCallback(async () => {
    if (!isAuthenticated) return;

    const requestVersion = countMutationVersionRef.current;

    try {
      const response = await notificationsApi.unreadCount();

      if (requestVersion === countMutationVersionRef.current) {
        setCount(response.count);
      }
    } catch {
      // Notifications are non-critical; keep the current local state.
    }
  }, [isAuthenticated]);

  const refreshSessionAndReconnect = useCallback(async () => {
    if (reconnectingAuthRef.current) return;

    reconnectingAuthRef.current = true;

    try {
      const user = await checkAuth();

      if (!user) {
        socketRef.current?.disconnect();
        return;
      }

      const token = tokenStorage.getAccessToken();
      if (!token || !socketRef.current) return;

      socketRef.current.auth = { token };
      socketRef.current.connect();
      await refreshCount();
    } finally {
      reconnectingAuthRef.current = false;
    }
  }, [checkAuth, refreshCount]);

  useEffect(() => {
    if (isLoading || !isAuthenticated || !SOCKET_URL) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setConnected(false);
      setLatestNotification(null);

      if (!isAuthenticated) {
        setCount(0);
      }

      return;
    }

    let disposed = false;
    const token = tokenStorage.getAccessToken();

    if (!token) {
      void refreshSessionAndReconnect();
      return;
    }

    void refreshCount();

    const socket = io(`${SOCKET_URL}/notifications`, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1_000,
      reconnectionDelayMax: 10_000,
      randomizationFactor: 0.5,
      timeout: 10_000,
      autoConnect: true,
    });

    socketRef.current = socket;

    const onConnect = () => {
      if (disposed) return;
      setConnected(true);
      void refreshCount();
    };

    const onDisconnect = () => {
      if (disposed) return;
      setConnected(false);
    };

    const onCreated = (payload: {
      notification: NotificationItem;
    }) => {
      if (disposed || !payload?.notification) return;

      countMutationVersionRef.current += 1;
      setLatestNotification(payload.notification);
      setCount((current) => current + 1);

      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }

      toastTimerRef.current = setTimeout(() => {
        setLatestNotification(null);
      }, 5_000);
    };

    const onRead = (payload: { notificationId: string }) => {
      if (!payload?.notificationId) return;

      countMutationVersionRef.current += 1;
      setCount((current) => Math.max(0, current - 1));
    };

    const onReadAll = () => {
      countMutationVersionRef.current += 1;
      setCount(0);
    };

    const onAuthExpired = () => {
      void refreshSessionAndReconnect();
    };

    const onAuthError = (payload: { code?: string }) => {
      if (payload?.code === "UNAUTHORIZED") {
        void refreshSessionAndReconnect();
      }
    };

    const onConnectError = (error: Error) => {
      if (
        error.message.toLowerCase().includes("unauthorized") ||
        error.message.toLowerCase().includes("authentication")
      ) {
        void refreshSessionAndReconnect();
      }
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("notification.created", onCreated);
    socket.on("notification.read", onRead);
    socket.on("notifications.read-all", onReadAll);
    socket.on("auth.expired", onAuthExpired);
    socket.on("auth.error", onAuthError);
    socket.on("connect_error", onConnectError);

    return () => {
      disposed = true;
      socket.removeAllListeners();
      socket.disconnect();
      if (socketRef.current === socket) {
        socketRef.current = null;
      }
      setConnected(false);

      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
        toastTimerRef.current = null;
      }
    };
  }, [
    isAuthenticated,
    isLoading,
    refreshCount,
    refreshSessionAndReconnect,
  ]);

  const markReadLocal = useCallback((notificationId: string) => {
    countMutationVersionRef.current += 1;
    setCount((current) => Math.max(0, current - 1));
  }, []);

  const markAllReadLocal = useCallback(() => {
    countMutationVersionRef.current += 1;
    setCount(0);
  }, []);

  const onToastClose = useCallback(() => {
    setLatestNotification(null);

    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
  }, []);

  const handleToastOpen = useCallback(async () => {
    const notificationId = latestNotification?.id;
    onToastClose();

    if (!notificationId) {
      return;
    }

    try {
      await notificationsApi.markRead(notificationId);

      if (!socketRef.current?.connected) {
        countMutationVersionRef.current += 1;
        setCount((current) => Math.max(0, current - 1));
      }
    } catch {
      await refreshCount();
    }
  }, [latestNotification, onToastClose, refreshCount]);

  const value = useMemo(
    () => ({
      count,
      latestNotification,
      connected,
      refreshCount,
      markReadLocal,
      markAllReadLocal,
    }),
    [
      count,
      latestNotification,
      connected,
      refreshCount,
      markReadLocal,
      markAllReadLocal,
      onToastClose,
      handleToastOpen,
    ],
  );

  return (
    <NotificationRealtimeContext.Provider value={value}>
      {children}
      {latestNotification && (
        <NotificationToast
          notification={latestNotification}
          onClose={onToastClose}
          onOpen={() => void handleToastOpen()}
        />
      )}
    </NotificationRealtimeContext.Provider>
  );
}

export function useNotificationRealtime() {
  const context = useContext(NotificationRealtimeContext);

  if (!context) {
    throw new Error(
      "useNotificationRealtime must be used within NotificationRealtimeProvider",
    );
  }

  return context;
}
