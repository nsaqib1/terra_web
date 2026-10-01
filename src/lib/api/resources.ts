import { apiClient } from "./client";
import {
  CreateResourceTagInput,
  PaginatedResponse,
  ResourceItem,
  ResourceListQuery,
  ResourceTag,
  UpdateResourceInput,
  UpdateResourceTagInput,
} from "./types";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

export const resourcesApi = {
  async list(query: ResourceListQuery): Promise<PaginatedResponse<ResourceItem>> {
    return apiClient.get<PaginatedResponse<ResourceItem>>("/resources", {
      params: {
        communityId: query.communityId,
        q: query.q,
        tagIds: query.tagIds?.join(","),
        mimeType: query.mimeType,
        sort: query.sort,
        page: query.page,
        limit: query.limit,
      },
    });
  },

  async getById(id: string): Promise<ResourceItem> {
    return apiClient.get<ResourceItem>(`/resources/${id}`);
  },

  async listTags(communityId: string, q?: string): Promise<ResourceTag[]> {
    return apiClient.get<ResourceTag[]>("/resources/tags", {
      params: { communityId, q },
    });
  },

  fileUrl(id: string, download = false): string {
    return `${API_URL}/resources/${id}/file${download ? "?download=true" : ""}`;
  },

  async adminList(query: ResourceListQuery): Promise<PaginatedResponse<ResourceItem>> {
    return apiClient.get<PaginatedResponse<ResourceItem>>("/admin/resources", {
      params: {
        communityId: query.communityId,
        q: query.q,
        tagIds: query.tagIds?.join(","),
        mimeType: query.mimeType,
        sort: query.sort,
        page: query.page,
        limit: query.limit,
      },
    });
  },

  async adminCreate(data: FormData): Promise<ResourceItem> {
    return apiClient.post<ResourceItem>("/admin/resources", data);
  },

  async adminUpdate(id: string, data: UpdateResourceInput): Promise<ResourceItem> {
    return apiClient.patch<ResourceItem>(`/admin/resources/${id}`, data);
  },

  async adminDelete(id: string): Promise<{ id: string; deleted: boolean }> {
    return apiClient.delete(`/admin/resources/${id}`);
  },

  async adminPublish(id: string): Promise<ResourceItem> {
    return apiClient.post<ResourceItem>(`/admin/resources/${id}/publish`, {});
  },

  async adminUnpublish(id: string): Promise<ResourceItem> {
    return apiClient.post<ResourceItem>(`/admin/resources/${id}/unpublish`, {});
  },

  async adminListTags(communityId: string, q?: string): Promise<ResourceTag[]> {
    return apiClient.get<ResourceTag[]>("/admin/resource-tags", {
      params: { communityId, q },
    });
  },

  async adminCreateTag(data: CreateResourceTagInput): Promise<ResourceTag> {
    return apiClient.post<ResourceTag>("/admin/resource-tags", data);
  },

  async adminUpdateTag(id: string, data: UpdateResourceTagInput): Promise<ResourceTag> {
    return apiClient.patch<ResourceTag>(`/admin/resource-tags/${id}`, data);
  },
};
