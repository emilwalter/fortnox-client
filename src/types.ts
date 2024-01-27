// src/types.ts

export interface FortnoxClientOptions {
  accessToken: string;
}

export interface Approver {
  Id: number;
  Name: string;
}

export interface VoucherSeries {
  "@url": string;
  Code: string;
  Description: string;
  Manual: boolean;
  Year: number;
  Approver: Approver;
}

export interface VoucherSeriesCollection {
  VoucherSeriesCollection: VoucherSeries[];
}

export interface VoucherRow {
  Account: number;
  CostCenter: string;
  Credit: number;
  Description: string;
  Debit: number;
  Project: string;
  Removed: boolean;
  TransactionInformation: string;
  Quantity: number;
}

export interface Voucher {
  "@url": string;
  Comments: string;
  CostCenter: string;
  Description: string;
  Project: string;
  ReferenceNumber: string;
  ReferenceType: string;
  TransactionDate: string;
  VoucherNumber: number;
  VoucherRows: VoucherRow[];
  VoucherSeries: string;
  Year: number;
  ApprovalState: number;
}

export interface DetailedVoucher {
  Voucher: Voucher;
}

export interface VoucherCollection {
  Vouchers: Voucher[];
  MetaInformation: MetaInformation;
}

export interface FinancialYear {
  "@url": string;
  Id: number;
  FromDate: string;
  ToDate: string;
  AccountingMethod: string;
  accountCharts: string;
}

export interface FinancialYearsCollection {
  FinancialYears: FinancialYear[];
  MetaInformation: MetaInformation;
}

export interface OpeningQuantity {
  Project: string;
  Balance: number;
}

export interface Account {
  "@url": string;
  Active: boolean;
  BalanceBroughtForward: number;
  CostCenter: string;
  CostCenterSettings: string;
  Description: string;
  Number: number;
  Project: string;
  ProjectSettings: string;
  SRU: number;
  Year: number;
  VATCode: string;
  BalanceCarriedForward: number;
  TransactionInformation: string;
  TransactionInformationSettings: string;
  QuantitySettings: string;
  QuantityUnit: string;
  OpeningQuantities: OpeningQuantity[];
}

export interface AccountCollection {
  Accounts: Account[];
  MetaInformation: MetaInformation;
}

export interface CompanyInformationWrapper {
  CompanyInformation: {
    Address: string;
    City: string;
    CountryCode: string;
    DatabaseNumber: number;
    CompanyName: string;
    OrganizationNumber: string;
    VisitAddress: string;
    VisitCity: string;
    VisitCountryCode: string;
    VisitZipCode: string;
    ZipCode: string;
  };
}

export interface FortnoxAPIError {
  ErrorInformation: {
    error: number;
    message: string;
    code: number;
  };
}

export interface MetaInformation {
  "@TotalPages": number;
  "@CurrentPage": number;
  "@TotalResources": number;
}

export interface GetVouchersParams {
  fromDate?: string;
  toDate?: string;
  page?: number;
  offset?: number;
  lastmodified?: string;
  limit?: number;
  financialYear?: number;
}

export interface GetVoucherDetailsParams {
  voucherSeries: string;
  voucherNumber: number;
  financialYear?: number;
  lastmodified?: string;
}

export interface GetAccountsParams {
  offset?: number;
  limit?: number;
  financialYear?: number;
  lastmodified?: string;
}

export interface GetAccountParams {
  accountNumber: number;
  financialYear?: number;
  lastmodified?: string;
}
