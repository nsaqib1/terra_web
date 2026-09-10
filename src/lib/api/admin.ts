import { apiClient } from "./client";
import {
  AdminCommunityQuery,
  AdminCommunityStats,
  Community,
  CommunityProposal,
  CommunityProposalStatus,
  CreateCommunityInput,
  PaginatedResponse,
  ReviewProposalInput,
  UpdateCommunityInput,
} from "./types";

export const adminApi = {
  /**
   * Get overview stats for the admin dashboard
   */
  async getStats(): Promise<AdminCommunityStats> {
    return apiClient.get<AdminCommunityStats>("/admin/stats");
  },

  /**
   * List communities with search, filtering, and pagination
   */
  async getCommunities(
    query?: AdminCommunityQuery
  ): Promise<PaginatedResponse<Community>> {
    return apiClient.get<PaginatedResponse<Community>>("/admin/communities", {
      params: query as Record<string, string | number | boolean | undefined>,
    });
  },

  /**
   * Get community by ID with stats and tags
   */
  async getCommunityById(id: string): Promise<Community> {
    return apiClient.get<Community>(`/admin/communities/${id}`);
  },

  /**
   * Create a new community
   */
  async createCommunity(data: CreateCommunityInput): Promise<Community> {
    return apiClient.post<Community>("/admin/communities", data);
  },

  /**
   * Update community details, status, maturity, and governance mode
   */
  async updateCommunity(
    id: string,
    data: UpdateCommunityInput
  ): Promise<Community> {
    return apiClient.patch<Community>(`/admin/communities/${id}`, data);
  },

  /**
   * Soft-delete / archive community
   */
  async deleteCommunity(id: string): Promise<Community> {
    return apiClient.delete<Community>(`/admin/communities/${id}`);
  },

  /**
   * Get citizen community proposals with status filter
   */
  async getProposals(query?: {
    status?: CommunityProposalStatus;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<CommunityProposal>> {
    return apiClient.get<PaginatedResponse<CommunityProposal>>(
      "/admin/community-proposals",
      {
        params: query as Record<string, string | number | boolean | undefined>,
      }
    );
  },

  /**
   * Review (approve / reject) a community proposal
   */
  async reviewProposal(
    proposalId: string,
    data: ReviewProposalInput
  ): Promise<{ community?: Community; proposal: CommunityProposal }> {
    return apiClient.patch<{
      community?: Community;
      proposal: CommunityProposal;
    }>(`/admin/community-proposals/${proposalId}/review`, data);
  },
};
