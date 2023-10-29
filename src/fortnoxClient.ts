// src/fortnoxClient.ts
import axios from "axios";
import type {
  VoucherSeriesCollection,
  Voucher,
  FinancialYearsCollection,
  Account,
  FortnoxClientOptions,
} from "./types";
import { FortnoxError } from "./fortnoxError";

class FortnoxClient {
  private accessToken: string;
  private clientSecret: string;
  private baseURL: string = "https://api.fortnox.se/3/";

  constructor(options: FortnoxClientOptions) {
    this.accessToken = options.accessToken;
    this.clientSecret = options.clientSecret;
  }

  private get headers() {
    return {
      "Access-Token": this.accessToken,
      "Client-Secret": this.clientSecret,
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  public async getVoucherSeries(): Promise<VoucherSeriesCollection> {
    return this.request("voucherseries");
  }

  public async getVouchers(): Promise<Voucher> {
    return this.request("vouchers/");
  }

  public async getFinancialYears(): Promise<FinancialYearsCollection> {
    return this.request("financialyears");
  }

  public async getAccounts(
    accountNumberFrom: number,
    accountNumberTo: number
  ): Promise<Account[]> {
    const endpoint = `accounts?accountnumberfrom=${accountNumberFrom}&accountnumberto=${accountNumberTo}`;
    return this.request<Account[]>(endpoint);
  }

  public getAssetsAccounts(): Promise<Account[]> {
    return this.getAccounts(1000, 1999);
  }

  public getEquityAndLiabilitiesAccounts(): Promise<Account[]> {
    return this.getAccounts(2000, 2999);
  }

  public getRevenueAccounts(): Promise<Account[]> {
    return this.getAccounts(3000, 3999);
  }

  public getMaterialCostsAccounts(): Promise<Account[]> {
    return this.getAccounts(4000, 4999);
  }

  public getOtherCostsAccounts(): Promise<Account[]> {
    return this.getAccounts(5000, 6999);
  }

  public getPersonnelAccounts(): Promise<Account[]> {
    return this.getAccounts(7000, 7999);
  }

  public getFinancialAccounts(): Promise<Account[]> {
    return this.getAccounts(8000, 8999);
  }

  private async request<T>(endpoint: string): Promise<T> {
    try {
      const response = await axios.get<T>(`${this.baseURL}${endpoint}`, {
        headers: this.headers,
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
  }
}

export default FortnoxClient;
