// src/types.ts
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
}
