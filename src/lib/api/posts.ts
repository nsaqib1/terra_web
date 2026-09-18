import { apiClient } from "./client";
import {
  CreatePostInput,
  GetPostsQuery,
  PaginatedResponse,
  PostItem,
  UpdatePostInput,
} from "./types";

export const postsApi = {
  /**
   * List posts with pagination, optional community filter, and sorting.
   */
  async list(query?: GetPostsQuery): Promise<PaginatedResponse<PostItem>> {
    return apiClient.get<PaginatedResponse<PostItem>>("/posts", {
      params: {
        communityId: query?.communityId,
        page: query?.page,
        limit: query?.limit,
        sort: query?.sort,
      },
    });
  },

  /**
   * Fetch a single post by ID.
   */
  async getById(id: string): Promise<PostItem> {
    return apiClient.get<PostItem>(`/posts/${id}`);
  },

  /**
   * Create a new post.
   */
  async create(data: CreatePostInput): Promise<PostItem> {
    return apiClient.post<PostItem>("/posts", data);
  },

  /**
   * Update an existing post.
   */
  async update(id: string, data: UpdatePostInput): Promise<PostItem> {
    return apiClient.patch<PostItem>(`/posts/${id}`, data);
  },

  /**
   * Remove / delete a post.
   */
  async remove(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/posts/${id}`);
  },
};

