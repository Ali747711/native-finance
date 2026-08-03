import dayjs from "dayjs";

export const ALL_CATEGORIES = "All";

/**
 * Turns a display name into an id-safe slug. Paired with a timestamp this is
 * unique enough for a local list without pulling in a uuid dependency. Falls
 * back to a constant when the name has no alphanumerics at all (e.g. "!!!"),
 * so an id is never left as a bare timestamp.
 */
export const toSubscriptionSlug = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "subscription";

/**
 * Next billing date for a given cadence, as an ISO string.
 *
 * dayjs clamps overflowing days rather than rolling into the next month, so a
 * Jan 31 monthly subscription renews Feb 28 instead of Mar 3.
 */
export const nextRenewalIso = (
  from: string | number | Date,
  frequency: SubscriptionFrequency
): string => {
  const start = dayjs(from);

  return (
    frequency === "Yearly" ? start.add(1, "year") : start.add(1, "month")
  ).toISOString();
};

const normalize = (value: string): string => value.trim().toLowerCase();

/**
 * Builds the chip row: `All` first, then every distinct category present in the
 * data, alphabetically. Derived from the list rather than hardcoded so a new
 * fixture or a future API response can't drift out of sync with the filters.
 */
export const listCategories = (subscriptions: Subscription[]): string[] => {
  const present = subscriptions
    .map((subscription) => subscription.category?.trim())
    .filter((category): category is string => Boolean(category));

  return [ALL_CATEGORIES, ...Array.from(new Set(present)).sort()];
};

/**
 * Narrows the list by category chip and free-text query.
 *
 * The query matches name, plan and category — searching "design" should surface
 * the Design-category items even though that word never appears in their names.
 * Comparison is trimmed and case-insensitive on both sides.
 */
export const filterSubscriptions = (
  subscriptions: Subscription[],
  query: string,
  category: string
): Subscription[] => {
  const needle = normalize(query);

  return subscriptions.filter((subscription) => {
    if (
      category !== ALL_CATEGORIES &&
      subscription.category?.trim() !== category
    ) {
      return false;
    }

    if (!needle) {
      return true;
    }

    return [subscription.name, subscription.plan, subscription.category].some(
      (field) => Boolean(field) && normalize(field as string).includes(needle)
    );
  });
};
