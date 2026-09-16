import { apiClient } from "./client";
import {
  CommentItem,
  CreateCommentInput,
  ListCommentsQuery,
  PaginatedResponse,
  UpdateCommentInput,
} from "./types";

export const commentsApi = {
  /**
   * List comments for a post.
   */
  async list(query: ListCommentsQuery): Promise<PaginatedResponse<CommentItem>> {
    return apiClient.get<PaginatedResponse<CommentItem>>("/comments", {
      params: {
        postId: query.postId,
        page: query.page,
        limit: query.limit,
        sort: query.sort,
      },
    });
  },

  /**
   * Create a new top-level comment or reply.
   */
  async create(data: CreateCommentInput): Promise<CommentItem> {
    return apiClient.post<CommentItem>("/comments", data);
  },

  /**
   * Update a comment.
   */
  async update(id: string, data: UpdateCommentInput): Promise<CommentItem> {
    return apiClient.patch<CommentItem>(`/comments/${id}`, data);
  },

  /**
   * Delete a comment.
   */
  async remove(id: string): Promise<CommentItem> {
    return apiClient.delete<CommentItem>(`/comments/${id}`);
  },
};
