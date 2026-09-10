const ACCESS_TOKEN_KEY = "terra_access_token";

let inMemoryToken: string | null = null;

export const tokenStorage = {
  getAccessToken(): string | null {
    if (inMemoryToken) {
      return inMemoryToken;
    }
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(ACCESS_TOKEN_KEY);
        if (stored) {
          inMemoryToken = stored;
          return stored;
        }
      } catch {
        // Ignore localStorage errors (e.g. private browsing restrictions)
      }
    }
    return null;
  },

  setAccessToken(token: string | null): void {
    inMemoryToken = token;
    if (typeof window !== "undefined") {
      try {
        if (token) {
          localStorage.setItem(ACCESS_TOKEN_KEY, token);
        } else {
          localStorage.removeItem(ACCESS_TOKEN_KEY);
        }
      } catch {
        // Ignore localStorage errors
      }
    }
  },

  clear(): void {
    inMemoryToken = null;
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
      } catch {
        // Ignore
      }
    }
  },
};
