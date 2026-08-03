import dayjs from "dayjs";
const DEFAULT_CURRENCY = "USD";
const DEFAULT_LOCALE = "en-US";

/**
 * Hand-rolled grouping used when `Intl` is unavailable or rejects the currency
 * code. Unknown currencies get a trailing code rather than a guessed symbol, so
 * the output is never misleading.
 */
const formatFallback = (value: number, currency: string): string => {
  const safe = Number.isFinite(value) ? value : 0;
  const [whole, decimals] = Math.abs(safe).toFixed(2).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const sign = safe < 0 ? "-" : "";

  return currency === DEFAULT_CURRENCY
    ? `${sign}$${grouped}.${decimals}`
    : `${sign}${grouped}.${decimals} ${currency}`;
};

/**
 * Formats an amount as U.S.-style currency with exactly two decimal places.
 *
 * @param value - Amount to format. Non-finite input renders as zero rather
 * than the literal `$NaN` that `Intl` would otherwise produce.
 * @param currency - ISO 4217 code, defaults to `USD`.
 *
 * Wrapped in try-catch because React Native's Hermes engine ships a partial
 * `Intl` implementation — an unrecognised currency code or a build without full
 * ICU data throws, and a price label must never crash a screen.
 */
export const formatCurrency = (
  value: number,
  currency: string = DEFAULT_CURRENCY,
): string => {
  if (!Number.isFinite(value)) {
    return formatFallback(0, currency);
  }

  try {
    return new Intl.NumberFormat(DEFAULT_LOCALE, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch (error) {
    if (typeof __DEV__ !== "undefined" && __DEV__) {
      console.warn(
        `formatCurrency: Intl failed for currency "${currency}", using fallback.`,
        error,
      );
    }

    return formatFallback(value, currency);
  }
};

export const formatSubscriptionDateTime = (value?: string): string => {
  if (!value) return "Not provided";
  const parsedDate = dayjs(value);
  return parsedDate.isValid()
    ? parsedDate.format("MM/DD/YYYY")
    : "Not provided";
};

export const formatStatusLabel = (value?: string): string => {
  if (!value) return "Unknown";
  return value.charAt(0).toUpperCase() + value.slice(1);
};
