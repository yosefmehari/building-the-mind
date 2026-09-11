export type Currency = {
  code: string;
  name: string;
  symbol: string;
  /** Approximate rate relative to 1 USD */
  rateFromUSD: number;
};

export const SUPPORTED_CURRENCIES: Currency[] = [
  { code: "USD", name: "United States Dollar", symbol: "$",    rateFromUSD: 1 },
  { code: "EUR", name: "Euro",                 symbol: "€",    rateFromUSD: 0.93 },
  { code: "GBP", name: "British Pound",        symbol: "£",    rateFromUSD: 0.79 },
  { code: "ETB", name: "Ethiopian Birr",       symbol: "Br",   rateFromUSD: 57.5 },
  { code: "ERN", name: "Eritrean Nakfa",       symbol: "Nfk",  rateFromUSD: 15.0 },
  { code: "CAD", name: "Canadian Dollar",      symbol: "CA$",  rateFromUSD: 1.36 },
  { code: "AUD", name: "Australian Dollar",    symbol: "AU$",  rateFromUSD: 1.53 },
  { code: "AED", name: "UAE Dirham",           symbol: "AED",  rateFromUSD: 3.67 },
  { code: "SAR", name: "Saudi Riyal",          symbol: "SAR",  rateFromUSD: 3.75 },
  { code: "KES", name: "Kenyan Shilling",      symbol: "KSh",  rateFromUSD: 130 },
  { code: "NGN", name: "Nigerian Naira",       symbol: "₦",    rateFromUSD: 1580 },
  { code: "ZAR", name: "South African Rand",   symbol: "R",    rateFromUSD: 18.7 },
  { code: "INR", name: "Indian Rupee",         symbol: "₹",    rateFromUSD: 83.5 },
  { code: "CHF", name: "Swiss Franc",          symbol: "CHF",  rateFromUSD: 0.90 },
  { code: "SEK", name: "Swedish Krona",        symbol: "kr",   rateFromUSD: 10.5 },
  { code: "NOK", name: "Norwegian Krone",      symbol: "kr",   rateFromUSD: 10.7 },
  { code: "JPY", name: "Japanese Yen",         symbol: "¥",    rateFromUSD: 149 },
  { code: "CNY", name: "Chinese Yuan",         symbol: "¥",    rateFromUSD: 7.24 },
];

/** Lookup a currency by code (case-insensitive). */
export function getCurrency(code: string | null | undefined): Currency {
  return (
    SUPPORTED_CURRENCIES.find((c) => c.code === (code ?? "").toUpperCase()) ??
    SUPPORTED_CURRENCIES[0]
  );
}

/**
 * Convert a price from one currency to another using indicative rates.
 * @param amount   The numeric price value.
 * @param fromCode The currency the price was stored in (e.g. "USD").
 * @param toCode   The target display currency (e.g. "ETB").
 */
export function convertPrice(amount: number, fromCode: string, toCode: string): number {
  const from = getCurrency(fromCode);
  const to   = getCurrency(toCode);
  // Convert to USD first, then to target
  const usd = amount / from.rateFromUSD;
  return usd * to.rateFromUSD;
}

/**
 * Format a price for display in the given currency.
 * If `displayCurrency` differs from `storedCurrency`, the amount is converted first.
 */
export function formatPrice(
  price: number | string | null | undefined,
  storedCurrency: string = "USD",
  displayCurrency?: string
): string {
  if (price === null || price === undefined || price === "") return "";
  const num = typeof price === "string" ? parseFloat(price) : Number(price);
  if (isNaN(num)) return "";

  const target = displayCurrency ?? storedCurrency;
  const amount = target !== storedCurrency ? convertPrice(num, storedCurrency, target) : num;
  const curr = getCurrency(target);

  // For currencies with large units (JPY, etc.) skip decimals
  const decimals = amount >= 100 && curr.rateFromUSD >= 100 ? 0 : 2;
  return `${curr.symbol}${amount.toFixed(decimals)} ${curr.code}`;
}
