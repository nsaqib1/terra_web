import { apiClient } from "./client";
import { GetPostsQuery, PaginatedResponse, PostItem } from "./types";

export const postsApi = {
  /**
   * List posts for a community with pagination.
   */
  async list(query: GetPostsQuery): Promise<PaginatedResponse<PostItem>> {
    return apiClient.get<PaginatedResponse<PostItem>>("/posts", {
      params: {
        communityId: query.communityId,
        page: query.page,
        limit: query.limit,
      },
    });
  },

  /**
   * Fetch a single post by ID.
   */
  async getById(id: string): Promise<PostItem> {
    return apiClient.get<PostItem>(`/posts/${id}`);
  },
};
