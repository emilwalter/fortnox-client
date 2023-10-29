# @waltermedia/fortnox-client

A client library for interacting with the Fortnox API, designed to help developers easily fetch data from Fortnox and integrate it into their applications.

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
import FortnoxClient from '@waltermedia/fortnox-client';

const fortnoxClient = new FortnoxClient({
  accessToken: 'your-access-token',
  clientSecret: 'your-client-secret',
});

// Fetch account data
async function fetchAccounts() {
  const accounts = await fortnoxClient.getAccounts(1000, 1999);
  console.log(accounts);
}

fetchAccounts();
```

## Methods

```
getAccounts(accountNumberFrom: number, accountNumberTo: number, financialYear?: number): Promise<Account[]>
getActiveAccounts(accountNumberFrom: number, accountNumberTo: number, financialYear?: number): Promise<Account[]>
getVoucherSeries(): Promise<VoucherSeriesCollection>
getVouchers(): Promise<Voucher>
getFinancialYears(): Promise<FinancialYearsCollection>
```
