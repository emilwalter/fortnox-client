# @waltermedia/fortnox-client

[![npm version](https://img.shields.io/npm/v/@waltermedia/fortnox-client.svg)](https://www.npmjs.com/package/@waltermedia/fortnox-client)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A TypeScript client for the [Fortnox API](https://developer.fortnox.se/) — Sweden's leading cloud-based accounting platform. Built for reliability with built-in rate limiting, OAuth token refresh, input validation, and security hardening.

## Features

- **Rate limiting** — Respects Fortnox API limits (1 concurrent request, 250ms minimum between requests)
- **OAuth token management** — `TokenManager` handles refresh flows automatically
- **Full TypeScript support** — Typed requests, responses, and parameters
- **Security** — Path injection prevention, sanitized error logging, no credential leakage
- **Read-only operations** — Vouchers, accounts, invoices, company info, SIE export

## Installation

```bash
npm install @waltermedia/fortnox-client
```

Or with Yarn or pnpm:

```bash
yarn add @waltermedia/fortnox-client
pnpm add @waltermedia/fortnox-client
```

## Quick Start

You need an OAuth access token from Fortnox. Obtain one via the [Fortnox OAuth flow](https://developer.fortnox.se/documentation/authentication/).

```typescript
import { FortnoxClient } from '@waltermedia/fortnox-client';

const client = new FortnoxClient({
  accessToken: 'your-access-token',
});

// Fetch vouchers
const vouchers = await client.getVouchers({
  fromDate: '2023-01-01',
  toDate: '2023-12-31',
  limit: 100,
  page: 1,
});

console.log(vouchers.Vouchers);
console.log(vouchers.MetaInformation['@TotalPages']);
```

## Usage

### Vouchers

```typescript
// List vouchers with filters
const vouchers = await client.getVouchers({
  fromDate: '2023-01-01',
  toDate: '2023-12-31',
  financialYear: 7,
  limit: 100,
  page: 1,
});

// Get a single voucher by series and number
const voucher = await client.getVoucherDetails({
  voucherSeries: 'A',
  voucherNumber: 1,
  financialYear: 7,
});
```

### Accounts

```typescript
// List accounts
const accounts = await client.getAccounts({
  limit: 100,
  offset: 0,
  financialYear: 7,
});

// Get account details
const account = await client.getAccountDetails({
  accountNumber: 1920,
  financialYear: 7,
});
```

### Invoices

```typescript
const invoices = await client.getInvoices({
  limit: 100,
  filter: 'unpaid',
  financialYear: 7,
});

const supplierInvoices = await client.getSupplierInvoices({
  limit: 100,
  filter: 'unpaid',
});
```

### Other

```typescript
const companyInfo = await client.getCompanyInformation();
const financialYears = await client.getFinancialYears({ date: '2023-06-01' });
const sieExport = await client.getSIE({ type: '4', financialYear: 7 });
```

## Pagination

Collection responses include `MetaInformation` with pagination metadata:

```typescript
interface MetaInformation {
  '@TotalPages': number;
  '@CurrentPage': number;
  '@TotalResources': number;
}
```

Example: fetch all vouchers across pages:

```typescript
async function fetchAllVouchers() {
  let currentPage = 1;
  const results = [];
  let hasMorePages = true;

  while (hasMorePages) {
    const response = await client.getVouchers({
      fromDate: '2023-01-01',
      toDate: '2023-12-31',
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

## Error Handling

API errors are wrapped in `FortnoxError`. Import it to check error type and access status/code:

```typescript
import { FortnoxClient, FortnoxError } from '@waltermedia/fortnox-client';

try {
  const vouchers = await client.getVouchers({ fromDate: '2023-01-01', toDate: '2023-12-31' });
} catch (error) {
  if (error instanceof FortnoxError) {
    console.error('Fortnox API Error:', error.message);
    console.error('Status:', error.statusCode);
    console.error('Code:', error.code);
    // error.response contains sanitized status/data (no auth headers)
  } else {
    throw error;
  }
}
```

## Token Management

Use `TokenManager` to handle OAuth token refresh:

```typescript
import { TokenManager } from '@waltermedia/fortnox-client';

const tokenManager = new TokenManager(
  'initial-access-token',
  'initial-refresh-token',
  new Date(/* expiration timestamp */),
  'your-client-id',
  'your-client-secret'
);

const { accessToken, refreshToken, expiresIn, expiresAt } = await tokenManager.getToken();
```

**Security:** Store client credentials in environment variables. Never expose them in client-side code.

## TypeScript Types

All response and parameter types are exported:

```typescript
import type {
  VoucherCollection,
  DetailedVoucher,
  AccountCollection,
  DetailedAccount,
  InvoiceCollection,
  SupplierInvoicesCollection,
  GetVouchersParams,
  GetAccountParams,
  // ... and more
} from '@waltermedia/fortnox-client';
```

## API Reference

| Method | Description |
|--------|-------------|
| `getVouchers(params)` | List vouchers with filters |
| `getVoucherDetails(params)` | Get single voucher by series/number |
| `getAccounts(params)` | List accounts |
| `getAccountDetails(params)` | Get single account |
| `getInvoices(params)` | List customer invoices |
| `getSupplierInvoices(params)` | List supplier invoices |
| `getCompanyInformation()` | Company info |
| `getFinancialYears(params)` | Financial years |
| `getSIE(params)` | SIE export (type `"3"` or `"4"`) |

## Security

This client includes:

- **Path parameter validation** — Voucher series, numbers, and account IDs are validated to prevent path injection
- **Sanitized error logging** — Tokens and credentials are never logged
- **Safe error storage** — `FortnoxError.response` excludes auth headers

## Publishing to npm

For maintainers. Ensure you're logged in (`npm login`) and have publish access to `@waltermedia`:

```bash
npm run release       # patch: build → version → publish → push
npm run release-minor # minor: build → version → publish → push
```

Or manually:

```bash
npm run build
npm version patch   # or minor/major
npm publish
git push && git push --tags
```

## License

MIT © [Walter Media AB](https://waltermedia.se)
