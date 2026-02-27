import { FortnoxAPIError } from "./types";
import { AxiosError } from "axios";
import { sanitizeAxiosResponse } from "./sanitizeError";

export class FortnoxError extends Error {
  public error: number = 0;
  public code: number = 0;
  /** Sanitized response (status, statusText, data only - no auth headers) */
  public response?: { status?: number; statusText?: string; data?: unknown };

  constructor(
    public message: string,
    public statusCode?: number,
    errorInfo?: FortnoxAPIError,
    axiosError?: AxiosError
  ) {
    super(message);
    Object.setPrototypeOf(this, FortnoxError.prototype);

    if (errorInfo && errorInfo.ErrorInformation) {
      this.error = errorInfo.ErrorInformation.error;
      this.code = errorInfo.ErrorInformation.code;
      this.message = errorInfo.ErrorInformation.message;
    }

    if (axiosError?.response) {
      this.response = sanitizeAxiosResponse(axiosError.response);
    }
  }
}
