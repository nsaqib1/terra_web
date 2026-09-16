import { apiClient } from "./client";
import {
  PaginatedResponse,
  PostItem,
  UpdateProfileInput,
  UserCommunitiesQuery,
  UserCommunityItem,
  UserPostsQuery,
  UserProfileResponse,
} from "./types";

export const usersApi = {
  /**
   * Fetch user profile by ID (including statistics).
   */
  async getProfile(userId: string): Promise<UserProfileResponse> {
    return apiClient.get<UserProfileResponse>(`/users/${userId}`);
  },

  /**
   * Fetch active posts authored by a user.
   */
  async getPosts(
    userId: string,
    query?: UserPostsQuery
  ): Promise<PaginatedResponse<PostItem>> {
    return apiClient.get<PaginatedResponse<PostItem>>(`/users/${userId}/posts`, {
      params: {
        page: query?.page,
        limit: query?.limit,
      },
    });
  },

  /**
   * Fetch active communities joined by a user.
   */
  async getCommunities(
    userId: string,
    query?: UserCommunitiesQuery
  ): Promise<PaginatedResponse<UserCommunityItem>> {
    return apiClient.get<PaginatedResponse<UserCommunityItem>>(
      `/users/${userId}/communities`,
      {
        params: {
          page: query?.page,
          limit: query?.limit,
        },
      }
    );
  },

  /**
   * Update the current authenticated user's profile.
   */
  async updateProfile(
    input: UpdateProfileInput
  ): Promise<{ user: UserProfileResponse["user"] }> {
    return apiClient.patch<{ user: UserProfileResponse["user"] }>("/users/me", input);
  },
};
