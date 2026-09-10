import { apiClient } from "./client";
import {
  CreateTagInput,
  ListTagsQuery,
  PaginatedResponse,
  Tag,
  UpdateTagInput,
} from "./types";

export const tagsApi = {
  /**
   * List tags for a community with optional search and pagination.
   * Public endpoint — no auth required.
   */
  async list(query: ListTagsQuery): Promise<PaginatedResponse<Tag>> {
    return apiClient.get<PaginatedResponse<Tag>>("/tags", {
      params: {
        communityId: query.communityId,
        q: query.q,
        page: query.page,
        limit: query.limit,
      },
    });
  },

  /**
   * Create a new tag in a community. Requires admin.
   */
  async create(data: CreateTagInput): Promise<Tag> {
    return apiClient.post<Tag>("/tags", data);
  },

  /**
   * Update a tag's name, description, or status. Requires admin.
   */
  async update(id: string, data: UpdateTagInput): Promise<Tag> {
    return apiClient.patch<Tag>(`/tags/${id}`, data);
  },

  /**
   * Archive a tag (soft-delete). Requires admin.
   */
  async archive(id: string): Promise<Tag> {
    return apiClient.delete<Tag>(`/tags/${id}`);
  },
};
