// src/fortnoxClient.ts
import axios, { AxiosError } from "axios";
import type {
  VoucherSeriesCollection,
  VoucherCollection,
  FinancialYearsCollection,
  AccountCollection,
  FortnoxClientOptions,
  CompanyInformationWrapper,
  Voucher,
  FortnoxAPIError,
  DetailedVoucher,
} from "./types";
import { FortnoxError } from "./fortnoxError";
import Bottleneck from "bottleneck";

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

  private async handlePagination<T>(
    baseEndpoint: string,
    limit: number = 500,
    financialyear?: number,
    paginate: boolean = false
  ): Promise<{ data: T; MetaInformation: any }> {
    let results: any = {};

    // Create a list of query params and their values.
    const queryParams: string[] = [];
    if (limit) queryParams.push(`limit=${limit}`);
    if (financialyear) queryParams.push(`financialyear=${financialyear}`);

    // Join the query params using '&' and append to baseEndpoint.
    const finalEndpoint = queryParams.length
      ? `${baseEndpoint}${
          baseEndpoint.includes("?") ? "&" : "?"
        }${queryParams.join("&")}`
      : baseEndpoint;

    let response = await this.basicRequest<{
      MetaInformation: any;
      [key: string]: any;
    }>(finalEndpoint);

    const dataKey = Object.keys(response).find(
      (key) => key !== "MetaInformation"
    );

    if (dataKey) {
      results[dataKey] = response[dataKey];
    }

    if (!paginate) {
      return {
        data: results as T,
        MetaInformation: response.MetaInformation, // Include the MetaInformation here
      };
    }

    let currentPage = 2; // Start from the second page, as the first page has already been fetched.
    const totalPages = response.MetaInformation["@TotalPages"];

    while (currentPage <= totalPages) {
      response = await this.basicRequest<{
        MetaInformation: any;
        [key: string]: any;
      }>(`${finalEndpoint}&page=${currentPage}`);

      if (dataKey) {
        results[dataKey] = results[dataKey].concat(response[dataKey]);
      }

      currentPage++;
    }

    return {
      data: results as T,
      MetaInformation: response.MetaInformation, // Include the MetaInformation here too
    };
  }

  public async getVouchers(
    fromDate?: string,
    toDate?: string,
    limit?: number,
    financialyear?: number,
    paginate: boolean = false,
    page?: number,
    offset?: number
  ): Promise<{ data: VoucherCollection; MetaInformation: any }> {
    let endpoint = "vouchers?";
    if (fromDate) {
      endpoint += `fromdate=${fromDate}&`;
    }
    if (toDate) {
      endpoint += `todate=${toDate}&`;
    }
    if (page) {
      endpoint += `&page=${page}`;
    }
    if (offset) {
      endpoint += `&offset=${offset}`;
    }
    endpoint = endpoint.endsWith("&") ? endpoint.slice(0, -1) : endpoint;

    return this.handlePagination<VoucherCollection>(
      endpoint,
      limit,
      financialyear,
      paginate
    );
  }

  public async getVoucherDetails(
    voucherSeries: string,
    voucherNumber: number
  ): Promise<DetailedVoucher> {
    const endpoint = `vouchers/${voucherSeries}/${voucherNumber}`;
    return this.basicRequest<DetailedVoucher>(endpoint);
  }
  public async getVoucherSeries(
    paginate: boolean = false
  ): Promise<{ data: VoucherSeriesCollection; MetaInformation: any }> {
    return this.handlePagination<VoucherSeriesCollection>(
      "voucherseries",
      undefined,
      undefined,
      paginate
    );
  }

  public async getFinancialYears(
    paginate: boolean = false
  ): Promise<{ data: FinancialYearsCollection; MetaInformation: any }> {
    return this.handlePagination<FinancialYearsCollection>(
      "financialyears",
      undefined,
      undefined,
      paginate
    );
  }

  public async getCompanyInformation(): Promise<CompanyInformationWrapper> {
    return this.basicRequest<CompanyInformationWrapper>("companyinformation");
  }

  public async getAccounts(
    accountNumberFrom: number,
    accountNumberTo: number,
    financialYear?: number,
    limit?: number,
    paginate: boolean = false
  ): Promise<{ data: AccountCollection; MetaInformation: any }> {
    let endpoint = `accounts?accountnumberfrom=${accountNumberFrom}&accountnumberto=${accountNumberTo}`;
    if (financialYear) {
      endpoint += `&financialyear=${financialYear}`;
    }
    return this.handlePagination<AccountCollection>(
      endpoint,
      limit,
      financialYear,
      paginate
    );
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
          // Axios error
          const axiosError: AxiosError = error;
          const errorData = axiosError.response?.data as
            | FortnoxAPIError
            | undefined;
          const errorMessage =
            errorData?.ErrorInformation?.message || "Unknown Error";
          const statusCode = axiosError.response?.status;
          throw new FortnoxError(
            errorMessage,
            statusCode,
            errorData,
            axiosError
          );
        } else if (error.response) {
          // Other HTTP error (not from Axios)
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
