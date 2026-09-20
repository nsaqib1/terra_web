import { apiClient } from "./client";
import {
  CreateInviteInput,
  InviteItem,
  InviteListResponse,
  InviteQuery,
  InviteStatsResponse,
  UpdateInviteInput,
  ValidateInviteResponse,
} from "./types";

export const invitesApi = {
  /**
   * Public: Validate an invite code before or during registration
   */
  async validate(code: string): Promise<ValidateInviteResponse> {
    return apiClient.get<ValidateInviteResponse>(
      `/invites/validate/${encodeURIComponent(code)}`,
      { skipAuth: true }
    );
  },

  /**
   * Public: Check if platform registration is currently invite-only
   */
  async getStatus(): Promise<{ isInviteOnlyEnabled: boolean }> {
    return apiClient.get<{ isInviteOnlyEnabled: boolean }>("/invites/status", {
      skipAuth: true,
    });
  },

  /**
   * Admin: List all beta invite links with filters and pagination
   */
  async getAdminList(query?: InviteQuery): Promise<InviteListResponse> {
    return apiClient.get<InviteListResponse>("/admin/invites", {
      params: query as Record<string, string | number | boolean | undefined>,
    });
  },

  /**
   * Admin: Get invite metrics and overall beta stats
   */
  async getAdminStats(): Promise<InviteStatsResponse> {
    return apiClient.get<InviteStatsResponse>("/admin/invites/stats");
  },

  /**
   * Admin: Generate a new beta invite link
   */
  async createAdminInvite(data: CreateInviteInput): Promise<InviteItem> {
    return apiClient.post<InviteItem>("/admin/invites", data);
  },

  /**
   * Admin: Update invite settings (e.g. toggle active/inactive, change max uses)
   */
  async updateAdminInvite(
    id: string,
    data: UpdateInviteInput
  ): Promise<InviteItem> {
    return apiClient.patch<InviteItem>(`/admin/invites/${id}`, data);
  },

  /**
   * Admin: Permanently delete an invite code
   */
  async deleteAdminInvite(id: string): Promise<{ message: string; id: string }> {
    return apiClient.delete<{ message: string; id: string }>(
      `/admin/invites/${id}`
    );
  },
};
