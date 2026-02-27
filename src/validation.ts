/**
 * Input validation utilities to prevent path injection and ensure safe URL construction.
 * Fortnox API uses alphanumeric voucher series (e.g. A, B, K) and numeric IDs.
 */

const VOUCHER_SERIES_PATTERN = /^[a-zA-Z0-9_-]{1,10}$/;
const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;

/**
 * Validates and returns a safe voucher series string for URL path.
 * Rejects path traversal, special chars, and overly long strings.
 */
export function validateVoucherSeries(value: string): string {
  const trimmed = String(value).trim();
  if (!trimmed || trimmed.includes("/") || trimmed.includes("..")) {
    throw new Error("Invalid voucher series: contains invalid characters");
  }
  if (!VOUCHER_SERIES_PATTERN.test(trimmed)) {
    throw new Error("Invalid voucher series: must be alphanumeric (max 10 chars)");
  }
  return trimmed;
}

/**
 * Validates a numeric path parameter (voucher number, account number).
 */
export function validateNumericPathParam(value: number, paramName: string): number {
  const num = Number(value);
  if (!Number.isInteger(num) || num < 0 || num > MAX_SAFE_INTEGER) {
    throw new Error(`Invalid ${paramName}: must be a non-negative integer`);
  }
  return num;
}

/**
 * Validates SIE type parameter (only "3" or "4" are valid).
 */
export function validateSIEType(value: "3" | "4"): "3" | "4" {
  if (value !== "3" && value !== "4") {
    throw new Error("Invalid SIE type: must be '3' or '4'");
  }
  return value;
}
