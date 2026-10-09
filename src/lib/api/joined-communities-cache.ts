import { communitiesApi } from "./communities";
import type { JoinedCommunity } from "./types";

// Shared by the sidebar and create-post community selector for this browser tab.
// The in-flight promise also prevents duplicate requests during initial loading.
let cachedCommunities: JoinedCommunity[] | null = null;
let inFlightRequest: Promise<JoinedCommunity[]> | null = null;
let cacheGeneration = 0;

export function getCachedJoinedCommunities(): JoinedCommunity[] | null {
  return cachedCommunities;
}

export function loadJoinedCommunities(): Promise<JoinedCommunity[]> {
  if (cachedCommunities !== null) {
    return Promise.resolve(cachedCommunities);
  }

  if (inFlightRequest) {
    return inFlightRequest;
  }

  const generationAtStart = cacheGeneration;
  const request = communitiesApi
    .listJoined()
    .then((communities) => {
      // Ignore results from a previous signed-in session or invalidated request.
      if (generationAtStart === cacheGeneration) {
        cachedCommunities = communities;
      }
      return communities;
    })
    .finally(() => {
      if (inFlightRequest === request) {
        inFlightRequest = null;
      }
    });

  inFlightRequest = request;
  return request;
}

export function refreshJoinedCommunities(): Promise<JoinedCommunity[]> {
  cachedCommunities = null;
  return loadJoinedCommunities();
}

export function clearJoinedCommunitiesCache(): void {
  cacheGeneration += 1;
  cachedCommunities = null;
  inFlightRequest = null;
}
