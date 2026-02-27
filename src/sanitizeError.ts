/**
 * Sanitizes error objects before logging to prevent exposure of tokens, headers, or credentials.
 */

/**
 * Returns a safe representation of an error for logging.
 * Strips Authorization, Cookie, and other sensitive headers from response objects.
 */
export function sanitizeErrorForLogging(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message;
    // For Axios errors, include status and a generic message but not full response
    const axiosError = error as { response?: { status?: number; statusText?: string } };
    if (axiosError.response) {
      return `${message} (HTTP ${axiosError.response.status ?? "unknown"})`;
    }
    return message;
  }
  return "Unknown error";
}

/**
 * Creates a sanitized response object that excludes sensitive headers.
 * Use when storing error context that may be logged or serialized.
 */
export function sanitizeAxiosResponse(
  response: { status?: number; statusText?: string; data?: unknown }
): { status?: number; statusText?: string; data?: unknown } {
  return {
    status: response?.status,
    statusText: response?.statusText,
    data: response?.data,
    // Explicitly omit: headers, config, request (may contain auth tokens)
  };
}
