// src/fortnoxClient.ts
import axios from "axios";
import type {
  VoucherSeriesCollection,
  Voucher,
  FinancialYearsCollection,
  Account,
  FortnoxClientOptions,
  CompanyInformation,
} from "./types";
import { FortnoxError } from "./fortnoxError";

class FortnoxClient {
  private accessToken: string;
  private baseURL: string = "https://api.fortnox.se/3/";

  constructor(options: FortnoxClientOptions) {
    this.accessToken = options.accessToken;
  }

  private get headers() {
    return {
      Authorization: `Bearer ${this.accessToken}`,
      "Content-Type": "application/json",
    };
  }

  public async getVoucherSeries(): Promise<VoucherSeriesCollection> {
    return this.request("voucherseries");
  }

  public async getVouchers(
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

    // Remove the trailing '&' or '?' if no parameters were added
    endpoint = endpoint.endsWith("&") ? endpoint.slice(0, -1) : endpoint;

    return this.request<Voucher[]>(endpoint);
  }

  public async getFinancialYears(): Promise<FinancialYearsCollection> {
    return this.request("financialyears");
  }

  public async getCompanyInformation(): Promise<CompanyInformation> {
    return this.request("companyinformation");
  }

  public async getAccounts(
    accountNumberFrom: number,
    accountNumberTo: number,
    financialYear?: number
  ): Promise<Account[]> {
    let endpoint = `accounts?accountnumberfrom=${accountNumberFrom}&accountnumberto=${accountNumberTo}`;
    if (financialYear) {
      endpoint += `&financialyear=${financialYear}`;
    }
    return this.request<Account[]>(endpoint);
  }

  private async request<T>(endpoint: string): Promise<T> {
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
  }
}

export default FortnoxClient;
