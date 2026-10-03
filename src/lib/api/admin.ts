import { apiClient } from "./client";
import {
  AdminCommunityQuery,
  AdminGame,
  AdminGameQuery,
  CreateGameInput,
  UpdateGameInput,
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

  async getGames(
    query?: AdminGameQuery
  ): Promise<PaginatedResponse<AdminGame>> {
    return apiClient.get<PaginatedResponse<AdminGame>>("/admin/games", {
      params: query as Record<string, string | number | boolean | undefined>,
    });
  },

  async getGame(id: string): Promise<AdminGame> {
    return apiClient.get<AdminGame>(`/admin/games/${id}`);
  },

  async createGame(data: CreateGameInput): Promise<AdminGame> {
    return apiClient.post<AdminGame>("/admin/games", data);
  },

  async updateGame(id: string, data: UpdateGameInput): Promise<AdminGame> {
    return apiClient.patch<AdminGame>(`/admin/games/${id}`, data);
  },

  async updateGameCommunities(id: string, communityIds: string[]): Promise<AdminGame> {
    return apiClient.put<AdminGame>(`/admin/games/${id}/communities`, { communityIds });
  },

  async deleteGame(id: string): Promise<AdminGame> {
    return apiClient.delete<AdminGame>(`/admin/games/${id}`);
  },

  async publishGame(id: string): Promise<AdminGame> {
    return apiClient.post<AdminGame>(`/admin/games/${id}/publish`);
  },

  async unpublishGame(id: string): Promise<AdminGame> {
    return apiClient.post<AdminGame>(`/admin/games/${id}/unpublish`);
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
