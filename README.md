# @waltermedia/fortnox-client

A opinionated client library for interacting with the Fortnox API, designed to help developers easily fetch data from Fortnox and integrate it into their applications.

## Installation

Install the package using npm:

```bash
npm install @waltermedia/fortnox-client
```

Or using Yarn:

```bash
yarn add @waltermedia/fortnox-client
```

## Usage

Import the FortnoxClient class from the package and create a new instance with your Fortnox API credentials:

```
import { FortnoxClient } from '@waltermedia/fortnox-client';

const fortnoxClient = new FortnoxClient({
  accessToken: 'your-access-token',
});

// Fetch account data
async function fetchAccounts() {
  const accounts = await fortnoxClient.getAccounts(1000, 1999);
  console.log(accounts);
}

async function fetchVouchers() {
  const fromDate = '2023-01-01';
  const toDate = '2023-12-31';
  const vouchers = await fortnoxClient.getVouchers(fromDate, toDate, 500, true);
  console.log(vouchers);
}

fetchVouchers();
fetchAccounts();
```

## Methods

Below are some of the primary methods available with the FortnoxClient:

```
getAccounts(accountNumberFrom: number, accountNumberTo: number, financialYear?: number, limit?: number, paginate?: boolean): Promise<AccountCollection>
getVoucherDetails(voucherSeries: string, voucherNumber: number): Promise<Voucher>
getVoucherSeries(paginate?: boolean): Promise<VoucherSeriesCollection>
getVouchers(fromDate?: string, toDate?: string, limit?: number, paginate?: boolean): Promise<VoucherCollection>
getFinancialYears(paginate?: boolean): Promise<FinancialYearsCollection>
getCompanyInformation(): Promise<CompanyInformationWrapper>
```

Note: The paginate parameter in the methods above, when set to true, fetches all pages of data. When set to false (default), it fetches only the first page.
