import { FortnoxAPIError } from "./types";
import { AxiosError } from "axios";
export class FortnoxError extends Error {
  public error: number = 0;
  public code: number = 0;
  public response?: AxiosError["response"];

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

    if (axiosError && axiosError.response) {
      this.response = axiosError.response;
    }
  }
}
