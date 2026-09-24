import { ApiError } from "./errors";
import { tokenStorage } from "./token";
import { AuthResponse, RequestOptions } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not configured");
}

const API_BASE_URL = (API_URL).replace(/\/+$/, "");

let refreshPromise: Promise<string | null> | null = null;

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const {
    body,
    params,
    skipAuth = false,
    headers: customHeaders = {},
    ...customOptions
  } = options;

  let url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  const headers = new Headers(customHeaders);

  if (body !== undefined && !(body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (!skipAuth) {
    const token = tokenStorage.getAccessToken();
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const fetchOptions: RequestInit = {
    ...customOptions,
    headers,
    credentials: "include",
    body: body !== undefined && !(body instanceof FormData) ? JSON.stringify(body) : body,
  };

  let response: Response;
  response = await fetch(url, fetchOptions);

  // Handle 401 Unauthorized for authenticated endpoints (transparent token refresh)
  const isAuthEndpoint =
    endpoint === "/auth/login" ||
    endpoint === "/auth/register" ||
    endpoint === "/auth/refresh";

  if (response.status === 401 && !skipAuth && !isAuthEndpoint) {
    const newToken = await attemptSilentRefresh();
    if (newToken) {
      headers.set("Authorization", `Bearer ${newToken}`);
      return request<T>(endpoint, {
        ...options,
        headers,
      });
    }
  }

  if (!response.ok) {
    let errorData: unknown;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: response.statusText || `Request failed with status ${response.status}` };
    }
    throw ApiError.fromResponse(response.status, errorData);
  }

  if (response.status === 204) {
    return {} as T;
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return (await response.json()) as T;
  }

  return (await response.text()) as unknown as T;
}

async function attemptSilentRefresh(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        tokenStorage.clear();
        return null;
      }

      const data = (await res.json()) as AuthResponse;
      if (data?.accessToken) {
        tokenStorage.setAccessToken(data.accessToken);
        return data.accessToken;
      }
      return null;
    } catch {
      tokenStorage.clear();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export const apiClient = {
  get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, { ...options, method: "GET" });
  },

  post<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, { ...options, method: "POST", body });
  },

  put<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, { ...options, method: "PUT", body });
  },

  patch<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, { ...options, method: "PATCH", body });
  },

  delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, { ...options, method: "DELETE" });
  },
};
