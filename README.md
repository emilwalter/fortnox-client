# @waltermedia/fortnox-client

A TypeScript client library for interacting with the Fortnox API, featuring built-in rate limiting and error handling.

## Installation

Install the package using npm:

```bash
npm install @waltermedia/fortnox-client
```

Or using Yarn:

```bash
yarn add @waltermedia/fortnox-client
```

Or using PNPM

```bash
pnpm add @waltermedia/fortnox-client
```

## Usage

```typescript
import { FortnoxClient } from '@waltermedia/fortnox-client';

const client = new FortnoxClient({
  accessToken: 'your-access-token',
});

// Example: Fetch vouchers
async function fetchVouchers() {
  const vouchers = await client.getVouchers({
    fromdate: '2023-01-01', // Note: parameter names are lowercase
    todate: '2023-12-31',
    limit: 100,
    page: 1,
  });

  // Access the MetaInformation
  const totalPages = vouchers.MetaInformation['@TotalPages'];
  const currentPage = vouchers.MetaInformation['@CurrentPage'];
  const totalResources = vouchers.MetaInformation['@TotalResources'];

  console.log(vouchers.Vouchers); // Array of vouchers
}

// Example: Fetch account details
async function fetchAccountDetails() {
  const account = await client.getAccountDetails({
    accountNumber: 1920,
    financialYear: 7, // This needs to be the ID of the financial year
  });
  console.log(account);
}
```

## Pagination

The Fortnox API uses page-based pagination. Each collection response includes MetaInformation:

```typescript
interface MetaInformation {
  '@TotalPages': number;
  '@CurrentPage': number;
  '@TotalResources': number;
}
```

Example of manual pagination:

```typescript
async function fetchAllVouchers() {
  let currentPage = 1;
  const results = [];
  let hasMorePages = true;

  while (hasMorePages) {
    const response = await client.getVouchers({
      fromdate: '2023-01-01',
      todate: '2023-12-31',
      limit: 100,
      page: currentPage,
    });

    results.push(...response.Vouchers);

    hasMorePages = currentPage < response.MetaInformation['@TotalPages'];
    currentPage++;
  }

  return results;
}
```

## Available Methods

### Vouchers

```typescript
getVouchers(params: GetVouchersParams): Promise<VoucherCollection>
getVoucherDetails(params: GetVoucherDetailsParams): Promise<DetailedVoucher>
```

### Accounts

```typescript
getAccounts(params: GetAccountsParams): Promise<AccountCollection>
getAccountDetails(params: GetAccountParams): Promise<DetailedAccount>
```

### Invoices

```typescript
getInvoices(params: GetInvoicesParams): Promise<InvoiceCollection>
getSupplierInvoices(params: GetSupplierInvoicesParams): Promise<SupplierInvoicesCollection>
```

### Other

```typescript
getCompanyInformation(): Promise<CompanyInformationWrapper>
getFinancialYears(params: GetFinancialYearsParams): Promise<FinancialYearsCollection>
getSIE(params: SIEParams): Promise<string>
```

## Error Handling

The client includes built-in error handling that wraps Fortnox API errors in a `FortnoxError` class:

```typescript
try {
  const vouchers = await client.getVouchers({
    fromDate: '2023-01-01',
    toDate: '2023-12-31',
  });
} catch (error) {
  if (error instanceof FortnoxError) {
    console.error('Fortnox API Error:', error.message);
    console.error('Status Code:', error.statusCode);
    console.error('Error Code:', error.code);
  }
}
```

## Rate Limiting

The client includes built-in rate limiting to prevent hitting Fortnox API limits:

- Maximum 1 concurrent request
- Minimum 250ms between requests

## Types

The package includes comprehensive TypeScript definitions for all Fortnox API responses and parameters. Import them as needed:

```typescript
import type {
  VoucherCollection,
  AccountCollection,
  InvoiceCollection,
  // etc...
} from '@waltermedia/fortnox-client';
```

## License

Commercial - See LICENSE file for details.
