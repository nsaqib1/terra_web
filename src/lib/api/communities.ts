import { apiClient } from "./client";
import { JoinedCommunity } from "./types";

export const communitiesApi = {
  /**
   * Communities the current user has joined as an active citizen.
   */
  async listJoined(): Promise<JoinedCommunity[]> {
    return apiClient.get<JoinedCommunity[]>("/communities/me");
  },
};
