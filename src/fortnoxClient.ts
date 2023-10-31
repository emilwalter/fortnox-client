// src/fortnoxClient.ts
import axios from "axios";
import type {
  VoucherSeriesCollection,
  VoucherCollection,
  FinancialYearsCollection,
  AccountCollection,
  FortnoxClientOptions,
  CompanyInformationWrapper,
  Voucher,
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
      minTime: 200,
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
    paginate: boolean = false
  ): Promise<T> {
    let results: any = {}; // Initialize an empty object

    const limitParam = limit ? `&limit=${limit}` : "";
    let response = await this.basicRequest<{
      MetaInformation: any;
      [key: string]: any;
    }>(`${baseEndpoint}${limitParam}`);

    const dataKey = Object.keys(response).find(
      (key) => key !== "MetaInformation"
    );

    if (dataKey) {
      results[dataKey] = response[dataKey]; // Directly set the dataKey property
    }

    if (!paginate) {
      return results as T;
    }

    let currentPage = 1;
    let totalPages = response.MetaInformation["@TotalPages"];
    currentPage++;

    while (currentPage <= totalPages) {
      const endpoint = `${baseEndpoint}&page=${currentPage}${limitParam}`;
      response = await this.basicRequest<{
        MetaInformation: any;
        [key: string]: any;
      }>(endpoint);

      if (dataKey) {
        results[dataKey] = results[dataKey].concat(response[dataKey]);
      }

      currentPage++;
    }

    return results as T;
  }

  public async getVouchers(
    fromDate?: string,
    toDate?: string,
    limit?: number,
    paginate: boolean = false
  ): Promise<VoucherCollection> {
    let endpoint = "vouchers?";
    if (fromDate) {
      endpoint += `fromdate=${fromDate}&`;
    }
    if (toDate) {
      endpoint += `todate=${toDate}&`;
    }
    endpoint = endpoint.endsWith("&") ? endpoint.slice(0, -1) : endpoint;

    return this.handlePagination<VoucherCollection>(endpoint, limit, paginate);
  }

  public async getVoucherDetails(
    voucherSeries: string,
    voucherNumber: number
  ): Promise<Voucher> {
    const endpoint = `vouchers/${voucherSeries}/${voucherNumber}`;
    return this.basicRequest<Voucher>(endpoint);
  }

  public async getVoucherSeries(
    paginate: boolean = false
  ): Promise<VoucherSeriesCollection> {
    return this.handlePagination<VoucherSeriesCollection>(
      "voucherseries",
      undefined,
      paginate
    );
  }

  public async getFinancialYears(
    paginate: boolean = false
  ): Promise<FinancialYearsCollection> {
    return this.handlePagination<FinancialYearsCollection>(
      "financialyears",
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
  ): Promise<AccountCollection> {
    let endpoint = `accounts?accountnumberfrom=${accountNumberFrom}&accountnumberto=${accountNumberTo}`;
    if (financialYear) {
      endpoint += `&financialyear=${financialYear}`;
    }
    return this.handlePagination<AccountCollection>(endpoint, limit, paginate);
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
        if (error.response) {
          throw new FortnoxError(error.response.data, error.response.status);
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
