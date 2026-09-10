import { apiClient } from "./client";
import {
  CommunityDetail,
  CommunityMembershipRecord,
  JoinedCommunity,
  MembershipStatusResponse,
} from "./types";

export const communitiesApi = {
  /**
   * All active communities.
   */
  async listAll(): Promise<CommunityDetail[]> {
    return apiClient.get<CommunityDetail[]>("/communities");
  },

  /**
   * Communities the current user has joined as an active citizen.
   */
  async listJoined(): Promise<JoinedCommunity[]> {
    return apiClient.get<JoinedCommunity[]>("/communities/me");
  },

  /**
   * Get single community details by slug.
   */
  async getBySlug(slug: string): Promise<CommunityDetail> {
    return apiClient.get<CommunityDetail>(`/communities/${encodeURIComponent(slug)}`);
  },

  /**
   * Check if current user is a citizen/member of the community.
   */
  async getMembership(slug: string): Promise<MembershipStatusResponse> {
    return apiClient.get<MembershipStatusResponse>(
      `/communities/${encodeURIComponent(slug)}/membership`
    );
  },

  /**
   * Join a community as a citizen.
   */
  async join(slug: string): Promise<CommunityMembershipRecord> {
    return apiClient.post<CommunityMembershipRecord>(
      `/communities/${encodeURIComponent(slug)}/join`
    );
  },

  /**
   * Leave a community.
   */
  async leave(slug: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(
      `/communities/${encodeURIComponent(slug)}/leave`
    );
  },
};

