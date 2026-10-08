import { apiClient } from "./client";
import {
  NotificationItem,
  NotificationUnreadCountResponse,
  NotificationsResponse,
} from "./types";

export const notificationsApi = {
  async list(cursor?: string, limit = 20): Promise<NotificationsResponse> {
    return apiClient.get<NotificationsResponse>("/notifications", {
      params: { cursor, limit },
    });
  },

  async unreadCount(): Promise<NotificationUnreadCountResponse> {
    return apiClient.get<NotificationUnreadCountResponse>(
      "/notifications/unread-count",
    );
  },

  async markRead(id: string): Promise<{ success: boolean }> {
    return apiClient.patch<{ success: boolean }>(`/notifications/${id}/read`);
  },

  async markAllRead(): Promise<{ success: boolean; updated: number }> {
    return apiClient.post<{ success: boolean; updated: number }>(
      "/notifications/read-all",
    );
  },
};

export function getNotificationMessage(notification: NotificationItem): string {
  switch (notification.type) {
    case "POST_UPVOTED":
      return "upvoted your post";
    case "COMMENT_UPVOTED":
      return "upvoted your comment";
    case "POST_COMMENTED":
      return "commented on your post";
    case "COMMENT_REPLIED":
      return "replied to your comment";
  }
}
