import { apiClient } from "./client";
import { PostVotesResponse, VoteInput, VoteResponse } from "./types";

export const votesApi = {
  /**
   * Cast or change a vote on a post or comment.
   */
  async vote(data: VoteInput): Promise<VoteResponse> {
    return apiClient.post<VoteResponse>("/votes", data);
  },

  /**
   * Get the current authenticated user's vote for a post and all its comments.
   */
  async getPostVotes(postId: string): Promise<PostVotesResponse> {
    return apiClient.get<PostVotesResponse>(`/votes/post-votes/${postId}`);
  },
};
