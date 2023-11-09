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
  VoucherCollection,
  VoucherSeriesCollection,
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
    fromDate?: string,
    toDate?: string,
    page?: number,
    offset?: number,
    lastmodified?: string,
    limit?: number,
    financialYear?: number
  ): Promise<{ data: VoucherCollection; MetaInformation: any }> {
    let queryParams = new URLSearchParams();

    if (fromDate) queryParams.append("fromdate", fromDate);
    if (toDate) queryParams.append("todate", toDate);
    if (page) queryParams.append("page", page.toString());
    if (offset) queryParams.append("offset", offset.toString());
    if (financialYear)
      queryParams.append("financialyear", financialYear.toString());
    if (lastmodified)
      queryParams.append("lastmodified", lastmodified.toString());
    if (limit) queryParams.append("limit", limit.toString());

    const endpoint = `vouchers?${queryParams.toString()}`;
    return this.basicRequest<{ data: VoucherCollection; MetaInformation: any }>(
      endpoint
    );
  }

  public async getVoucherDetails(
    voucherSeries: string,
    voucherNumber: number,
    financialYear?: number,
    lastmodified?: string
  ): Promise<DetailedVoucher> {
    let queryParams = new URLSearchParams();

    if (financialYear)
      queryParams.append("financialyear", financialYear.toString());
    if (lastmodified) queryParams.append("lastmodified", lastmodified);

    const endpoint = `vouchers/${voucherSeries}/${voucherNumber}?${queryParams.toString()}`;
    return this.basicRequest<DetailedVoucher>(endpoint);
  }

  public async getVoucherSeries(): Promise<{
    data: VoucherSeriesCollection;
    MetaInformation: any;
  }> {
    return this.basicRequest<{
      data: VoucherSeriesCollection;
      MetaInformation: any;
    }>("voucherseries");
  }

  public async getFinancialYears(): Promise<{
    data: FinancialYearsCollection;
    MetaInformation: any;
  }> {
    return this.basicRequest<{
      data: FinancialYearsCollection;
      MetaInformation: any;
    }>("financialyears");
  }

  public async getCompanyInformation(): Promise<CompanyInformationWrapper> {
    return this.basicRequest<CompanyInformationWrapper>("companyinformation");
  }

  public async getAccounts(
    offset?: number,
    limit?: number,
    financialYear?: number,
    lastmodified?: string
  ): Promise<{ data: AccountCollection; MetaInformation: any }> {
    let queryParams = new URLSearchParams();

    if (offset) queryParams.append("offset", offset.toString());
    if (limit) queryParams.append("limit", limit.toString());
    if (financialYear)
      queryParams.append("financialyear", financialYear.toString());
    if (lastmodified)
      queryParams.append("lastmodified", lastmodified.toString());

    const endpoint = `accounts?${queryParams.toString()}`;
    return this.basicRequest<{ data: AccountCollection; MetaInformation: any }>(
      endpoint
    );
  }

  public async getAccount(
    accountNumber: number,
    financialYear?: number,
    lastmodified?: string
  ): Promise<AccountCollection> {
    let queryParams = new URLSearchParams();

    if (financialYear)
      queryParams.append("financialyear", financialYear.toString());

    if (lastmodified)
      queryParams.append("lastmodified", lastmodified.toString());

    const endpoint = `accounts/${accountNumber}?${queryParams.toString()}`;
    return this.basicRequest<AccountCollection>(endpoint);
  }

  private async basicRequest<T>(endpoint: string): Promise<T> {
    return this.limiter.schedule(async () => {
      try {
        const response = await axios.get<T>(`${this.baseURL}${endpoint}`, {
          headers: {
            ...this.headers,
            Accept: "application/json",
          },
        });
        return response.data;
      } catch (error: any) {
        console.error(error); // Log the error to diagnose the issue

        if (axios.isAxiosError(error)) {
          const axiosError: AxiosError = error;
          const statusCode = axiosError.response?.status;

          // Check for 429 status code
          if (statusCode === 429) {
            throw new FortnoxError(
              "Too many requests, please try again later",
              statusCode
            );
          }

          const errorData = axiosError.response?.data as
            | FortnoxAPIError
            | undefined;
          const errorMessage =
            errorData?.ErrorInformation?.message || "Unknown Error";
          throw new FortnoxError(
            errorMessage,
            statusCode,
            errorData,
            axiosError
          );
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
    });
  }
}

export default FortnoxClient;
