import { apiClient } from './client';
import type { GameSessionResponse, PublicGame } from './types';

export const gamesApi = {
  getBySlug(slug: string): Promise<PublicGame> {
    return apiClient.get<PublicGame>(`/games/${encodeURIComponent(slug)}`);
  },

  startSession(slug: string): Promise<GameSessionResponse> {
    return apiClient.post<GameSessionResponse>(
      `/games/${encodeURIComponent(slug)}/session`,
    );
  },
};
