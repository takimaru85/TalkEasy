/**
 * What Plus costs, and how that is shown.
 *
 * THE PRICES HERE ARE A PLACEHOLDER, deliberately marked as one. Apple and Google each return the
 * real localised price for the viewer's own store account — their currency, their tax, their
 * regional pricing — and that string is the only one a family should ever be charged against. So
 * every screen reads `displayPrice`, which prefers the store's string and falls back to these only
 * until billing is connected. Hard-coding "₱149" into a screen is how a family in another country
 * gets quoted a price that is not theirs.
 */
export type BillingPeriod = 'monthly' | 'yearly';

export interface PlusProduct {
  period: BillingPeriod;
  /**
   * Store product identifier. The SAME string must be created in App Store Connect and in the
   * Google Play Console, or the store returns nothing and the paywall has no prices to show.
   */
  productId: string;
  /** For a grown-up: "Monthly", "Yearly". */
  label: string;
  /** Placeholder price, used ONLY until the store supplies the real one. */
  fallbackPrice: string;
  /** Shown under the price, e.g. a yearly plan's monthly equivalent. */
  fallbackNote: string | null;
  /** Exactly one product carries this. */
  bestValue: boolean;
}

export const PLUS_PRODUCTS: readonly PlusProduct[] = [
  {
    period: 'monthly',
    productId: 'talkeasy.plus.monthly',
    label: 'Monthly',
    fallbackPrice: '₱149',
    fallbackNote: 'per month',
    bestValue: false,
  },
  {
    period: 'yearly',
    productId: 'talkeasy.plus.yearly',
    label: 'Yearly',
    fallbackPrice: '₱999',
    fallbackNote: 'per year · about ₱83 a month',
    bestValue: true,
  },
];

/** Prices as the store reports them, keyed by productId. Empty until billing is connected. */
export type StorePrices = Record<string, string>;

/**
 * The price to SHOW: the store's own localised string when there is one, otherwise the placeholder.
 *
 * Returns whether the price is real, so a screen can be honest while billing is not yet connected
 * rather than presenting a developer placeholder as a firm price.
 */
export function displayPrice(product: PlusProduct, prices: StorePrices): { text: string; real: boolean } {
  const fromStore = prices[product.productId];
  return fromStore ? { text: fromStore, real: true } : { text: product.fallbackPrice, real: false };
}

export function productFor(period: BillingPeriod): PlusProduct {
  return PLUS_PRODUCTS.find((p) => p.period === period) ?? PLUS_PRODUCTS[0];
}
