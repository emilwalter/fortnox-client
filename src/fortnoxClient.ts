// src/fortnoxClient.ts
import axios from "axios";
import type {
  VoucherSeriesCollection,
  Voucher,
  FinancialYearsCollection,
} from "./types";

interface FortnoxClientOptions {
  accessToken: string;
  clientSecret: string;
}

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

  private async request<T>(endpoint: string): Promise<T> {
    const response = await axios.get<T>(`${this.baseURL}${endpoint}`, {
      headers: this.headers,
    });
    return response.data;
  }
}

export default FortnoxClient;
