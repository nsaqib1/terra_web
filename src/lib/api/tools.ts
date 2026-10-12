import { apiClient } from "./client";
import type { PublicTool, ToolQuery } from "./types";
export const toolsApi = {
  list(query?: ToolQuery): Promise<PublicTool[]> { return apiClient.get<PublicTool[]>("/tools", { params: query as Record<string, string | number | boolean | undefined> }); },
  getBySlug(slug: string): Promise<PublicTool> { return apiClient.get<PublicTool>(`/tools/${encodeURIComponent(slug)}`); },
};
