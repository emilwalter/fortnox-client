// src/fortnoxClient.ts
import axios, { AxiosError } from "axios";
import Bottleneck from "bottleneck";
import { FortnoxError } from "./fortnoxError";
import type {
  AccountCollection,
  CompanyInformationWrapper,
  DetailedVoucher,
  FinancialYearsCollection,
  FortnoxAPIError,
  FortnoxClientOptions,
  GetAccountParams,
  GetAccountsParams,
  GetVoucherDetailsParams,
  GetVouchersParams,
  VoucherCollection,
} from "./types";

class FortnoxClient {
  private accessToken: string;
  private baseURL: string = "https://api.fortnox.se/3/";
  private limiter: Bottleneck;

  constructor(options: FortnoxClientOptions) {
    this.accessToken = options.accessToken;
    this.limiter = new Bottleneck({
      maxConcurrent: 1,
      minTime: 250,
    });
  }

  private get headers() {
    return {
      Authorization: `Bearer ${this.accessToken}`,
      "Content-Type": "application/json",
    };
  }

  public async getVouchers(
    params: GetVouchersParams
  ): Promise<VoucherCollection> {
    const queryParams = this.buildQueryParams(params);
    const endpoint = `vouchers?${queryParams.toString()}`;
    return this.basicRequest<VoucherCollection>(endpoint);
  }

  public async getVoucherDetails(
    params: GetVoucherDetailsParams
  ): Promise<DetailedVoucher> {
    const queryParams = this.buildQueryParams(params);
    const endpoint = `vouchers/${params.voucherSeries}/${
      params.voucherNumber
    }?${queryParams.toString()}`;
    return this.basicRequest<DetailedVoucher>(endpoint);
  }

  public async getCompanyInformation(): Promise<CompanyInformationWrapper> {
    return this.basicRequest<CompanyInformationWrapper>("companyinformation");
  }

  public async getFinancialYears(): Promise<FinancialYearsCollection> {
    return this.basicRequest<FinancialYearsCollection>("financialyears");
  }

  public async getAccounts(
    params: GetAccountsParams
  ): Promise<AccountCollection> {
    const queryParams = this.buildQueryParams(params);
    const endpoint = `accounts?${queryParams.toString()}`;
    return this.basicRequest<AccountCollection>(endpoint);
  }

  public async getAccountDetails(
    params: GetAccountParams
  ): Promise<AccountCollection> {
    const queryParams = this.buildQueryParams(params);
    const endpoint = `accounts/${
      params.accountNumber
    }?${queryParams.toString()}`;
    return this.basicRequest<AccountCollection>(endpoint);
  }

  private buildQueryParams(params: Record<string, any>): URLSearchParams {
    let queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        const formattedKey = key.toLowerCase();
        queryParams.append(formattedKey, value.toString());
      }
    });
    return queryParams;
  }

  private async basicRequest<T>(endpoint: string): Promise<T> {
    return this.limiter.schedule(async () => {
      try {
        const url = `${this.baseURL}${endpoint}`;
        const response = await axios.get<T>(url, {
          headers: {
            ...this.headers,
            Accept: "application/json",
          },
        });
        return response.data;
      } catch (error: any) {
        this.handleError(error);
      }
    });
  }

  private handleError(error: any): never {
    console.error(error); // Log the error to diagnose the issue

    if (axios.isAxiosError(error)) {
      const axiosError: AxiosError = error;
      const statusCode = axiosError.response?.status;
      const errorData = axiosError.response?.data as
        | FortnoxAPIError
        | undefined;
      const errorMessage =
        errorData?.ErrorInformation?.message || "Unknown Error";
      throw new FortnoxError(errorMessage, statusCode, errorData, axiosError);
    } else if (error.response) {
      const errorMessage =
        error.response.data.ErrorInformation?.message || "Unknown Error";
      throw new FortnoxError(
        errorMessage,
        error.response.status,
        error.response.data
      );
    } else if (error.request) {
      throw new FortnoxError("No response received from Fortnox API");
    } else {
      throw new FortnoxError(error.message);
    }
  }
}

export default FortnoxClient;
