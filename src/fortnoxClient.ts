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
  Account,
  FinancialYear,
  VoucherSeries,
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
      minTime: 200, // Adjust as needed
    });
  }

  private get headers() {
    return {
      Authorization: `Bearer ${this.accessToken}`,
      "Content-Type": "application/json",
    };
  }

  private async getAllPages<T>(baseEndpoint: string): Promise<T> {
    let currentPage = 1;
    let results: any[] = [];
    let totalPages: number;

    // Initial request without the page parameter
    let response = await this.basicRequest<{
      MetaInformation: any;
      [key: string]: any;
    }>(baseEndpoint);

    // Extract the key that is not 'MetaInformation' from the response
    const dataKey = Object.keys(response).find(
      (key) => key !== "MetaInformation"
    );

    if (dataKey) {
      const data = response[dataKey];
      // If the data is an array, concatenate
      if (Array.isArray(data)) {
        results = results.concat(data);
      } else {
        // If it's an object, directly return that object
        return data as T;
      }
    }

    totalPages = response.MetaInformation["@TotalPages"];

    // If totalPages is 1, then we've already fetched all the data in the initial request
    if (totalPages === 1) {
      return results as unknown as T;
    }

    // Start from the second page if there are more pages
    currentPage++;

    while (currentPage <= totalPages) {
      const endpoint = `${baseEndpoint}&page=${currentPage}`;
      response = await this.basicRequest<{
        MetaInformation: any;
        [key: string]: any;
      }>(endpoint);

      if (dataKey) {
        const data = response[dataKey];
        results = results.concat(data);
      }

      currentPage++;
    }

    return results as unknown as T;
  }

  public async getVoucherDetails(
    voucherSeries: string,
    voucherNumber: number
  ): Promise<Voucher> {
    const endpoint = `vouchers/${voucherSeries}/${voucherNumber}`;
    return this.basicRequest<Voucher>(endpoint);
  }

  public async getAllVouchers(
    fromDate?: string,
    toDate?: string
  ): Promise<Voucher[]> {
    let endpoint = "vouchers?";

    if (fromDate) {
      endpoint += `fromdate=${fromDate}&`;
    }

    if (toDate) {
      endpoint += `todate=${toDate}&`;
    }

    // Remove the trailing '&' if no parameters were added
    endpoint = endpoint.endsWith("&") ? endpoint.slice(0, -1) : endpoint;

    return this.getAllPages<Voucher[]>(endpoint);
  }

  //expensive operation - use with care (to get all voucher rows for all vouchers)
  public async getAllVouchersWithVoucherRows(
    fromDate?: string,
    toDate?: string
  ): Promise<Voucher[]> {
    let endpoint = "vouchers?";

    if (fromDate) {
      endpoint += `fromdate=${fromDate}&`;
    }

    if (toDate) {
      endpoint += `todate=${toDate}&`;
    }

    // Remove the trailing '&' if no parameters were added
    endpoint = endpoint.endsWith("&") ? endpoint.slice(0, -1) : endpoint;

    const vouchersSummary = await this.getAllPages<Voucher[]>(endpoint);

    // Now, fetch details for each voucher
    const detailedVouchersPromises = vouchersSummary.map((voucher) =>
      this.getVoucherDetails(voucher.VoucherSeries, voucher.VoucherNumber)
    );

    const detailedVouchers = await Promise.all(detailedVouchersPromises);

    return detailedVouchers;
  }

  public async getVouchers(
    fromDate?: string,
    toDate?: string
  ): Promise<VoucherCollection> {
    let endpoint = "vouchers?";
    if (fromDate) {
      endpoint += `fromdate=${fromDate}&`;
    }
    if (toDate) {
      endpoint += `todate=${toDate}&`;
    }
    endpoint = endpoint.endsWith("&") ? endpoint.slice(0, -1) : endpoint;
    return this.basicRequest<VoucherCollection>(endpoint);
  }

  public async getAllVoucherSeries(): Promise<VoucherSeries[]> {
    return this.getAllPages<VoucherSeries[]>("voucherseries");
  }

  public async getVoucherSeries(): Promise<VoucherSeriesCollection> {
    return this.basicRequest<VoucherSeriesCollection>("voucherseries");
  }

  public async getAllFinancialYears(): Promise<FinancialYear[]> {
    return this.getAllPages<FinancialYear[]>("financialyears");
  }

  public async getFinancialYears(): Promise<FinancialYearsCollection> {
    return this.basicRequest<FinancialYearsCollection>("financialyears");
  }

  public async getCompanyInformation(): Promise<CompanyInformationWrapper> {
    return this.basicRequest<CompanyInformationWrapper>("companyinformation");
  }

  public async getAllAccounts(
    accountNumberFrom: number,
    accountNumberTo: number,
    financialYear?: number
  ): Promise<Account[]> {
    let endpoint = `accounts?accountnumberfrom=${accountNumberFrom}&accountnumberto=${accountNumberTo}`;
    if (financialYear) {
      endpoint += `&financialyear=${financialYear}`;
    }
    return this.getAllPages<Account[]>(endpoint);
  }

  public async getAccounts(
    accountNumberFrom: number,
    accountNumberTo: number,
    financialYear?: number
  ): Promise<AccountCollection> {
    let endpoint = `accounts?accountnumberfrom=${accountNumberFrom}&accountnumberto=${accountNumberTo}`;
    if (financialYear) {
      endpoint += `&financialyear=${financialYear}`;
    }
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
        console.error(error);
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
