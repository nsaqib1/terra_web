import { ApiErrorResponse } from "./types";

export class ApiError extends Error {
  public statusCode: number;
  public errors: string[];
  public raw: unknown;

  constructor(
    statusCode: number,
    message: string,
    errors: string[] = [],
    raw?: unknown
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errors = errors;
    this.raw = raw;
  }

  static fromResponse(statusCode: number, data: unknown): ApiError {
    let message = "An unexpected error occurred";
    let errors: string[] = [];

    if (data && typeof data === "object") {
      const errorPayload = data as Partial<ApiErrorResponse>;
      if (Array.isArray(errorPayload.message)) {
        errors = errorPayload.message;
        message = errors[0] || message;
      } else if (typeof errorPayload.message === "string") {
        message = errorPayload.message;
        errors = [errorPayload.message];
      }
    }

    return new ApiError(statusCode, message, errors, data);
  }
}

export function extractErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  if (error instanceof ApiError) {
    if (error.errors.length > 1) {
      return error.errors.join(", ");
    }
    return error.message || fallback;
  }

  if (error instanceof TypeError && error.message.includes("fetch")) {
    return "Cannot connect to server. Please ensure backend is running.";
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  if (typeof error === "string") {
    return error;
  }

  return fallback;
}
