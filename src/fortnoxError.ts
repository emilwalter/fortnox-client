import { FortnoxAPIError } from "./types";
export class FortnoxError extends Error {
  public error: number = 0;
  public code: number = 0;

  constructor(
    public message: string,
    public statusCode?: number,
    errorInfo?: FortnoxAPIError
  ) {
    super(message);
    Object.setPrototypeOf(this, FortnoxError.prototype);

    if (errorInfo) {
      this.error = errorInfo.ErrorInformation.error;
      this.code = errorInfo.ErrorInformation.code;
      this.message = errorInfo.ErrorInformation.message; // Overrides the message parameter
    }
  }
}
