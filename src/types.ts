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

export interface DetailedAccount {
  Account: Account;
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

export interface GetInvoicesParams {
  offset?: number;
  limit?: number;
  financialYear?: number;
  lastmodified?: string;
  filter?: "cancelled" | "fullypaid" | "unpaid" | "unpaidoverdue" | "unbooked";
  costcenter?: string;
  customername?: string;
  customernumber?: string;
  label?: string;
  documentnumber?: string;
  fromdate?: string;
  todate?: string;
  fromfinalpaydate?: string;
  tofinalpaydate?: string;
  notcompleted?: string;
  ocr?: string;
  ourreference?: string;
  project?: string;
  sent?: string;
  externalinvoicereference1?: string;
  externalinvoicereference2?: string;
  yourreference?: string;
  invoicetype?: string;
  articlenumber?: string;
  articledescription?: string;
  currency?: string;
  accountnumberfrom?: string;
  accountnumberto?: string;
  yourordernumber?: string;
  credit?: string;
  sortby?:
    | "customername"
    | "customernumber"
    | "documentnumber"
    | "invoicedate"
    | "ocr"
    | "total";
}

export interface Invoice {
  "@url": string;
  Balance: number;
  Booked: boolean;
  Cancelled: boolean;
  CostCenter: string;
  Currency: string;
  CurrencyRate: number;
  CurrencyUnit: number;
  CustomerName: string;
  CustomerNumber: string;
  DocumentNumber: string;
  DueDate: string; // ISO Date String
  ExternalInvoiceReference1: string;
  ExternalInvoiceReference2: string;
  InvoiceDate: string; // ISO Date String
  InvoiceType: string;
  NoxFinans: boolean;
  OCR: string;
  VoucherNumber: number;
  VoucherSeries: string;
  VoucherYear: number;
  WayOfDelivery: string;
  TermsOfPayment: string;
  Project: string;
  Sent: boolean;
  Total: number;
  FinalPayDate: string; // ISO Date String
}

export interface SupplierInvoice {
  "@url": string;
  Balance: string;
  Booked: boolean;
  Cancel: boolean;
  CostCenter: string;
  Credit: boolean;
  Currency: string;
  CurrencyRate: string;
  CurrencyUnit: number;
  DueDate: string; // Date in ISO format
  ExternalInvoiceNumber: string;
  ExternalInvoiceSeries: string;
  GivenNumber: string;
  InvoiceDate: string; // Date in ISO format
  InvoiceNumber: string;
  Project: string;
  SupplierNumber: string;
  SupplierName: string;
  Total: string;
  AuthorizerName: string;
  Vouchers: Voucher[];
  FinalPayDate: string; // Date in ISO format
}

export interface GetSupplierInvoicesParams {
  filter?:
    | "cancelled"
    | "fullypaid"
    | "unpaid"
    | "unpaidoverdue"
    | "unbooked"
    | "pendingpayment"
    | "authorizepending";
  offset?: number;
  limit?: number;
  financialYear?: number;
  lastmodified?: string;
}

export interface GetFinancialYearsParams {
  date: string;
}

export interface SupplierInvoicesCollection {
  SupplierInvoices: SupplierInvoice[];
  MetaInformation: MetaInformation;
}

export interface InvoiceCollection {
  Invoices: Invoice[];
  MetaInformation: MetaInformation;
}

export interface SIEParams {
  type: "3" | "4";
  financialYear?: number;
}
