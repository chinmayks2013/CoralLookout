import Stripe from "stripe";

export function isStripeConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY?.trim() &&
      process.env.STRIPE_SCHOOL_PRICE_ID?.trim()
  );
}

/** Annual billing is optional — present only when its price id is set. */
export function isAnnualBillingConfigured(): boolean {
  return Boolean(
    isStripeConfigured() && process.env.STRIPE_SCHOOL_ANNUAL_PRICE_ID?.trim()
  );
}

export type BillingInterval = "month" | "year";

export function priceIdForInterval(interval: BillingInterval): string {
  const priceId =
    interval === "year"
      ? process.env.STRIPE_SCHOOL_ANNUAL_PRICE_ID?.trim()
      : process.env.STRIPE_SCHOOL_PRICE_ID?.trim();
  if (!priceId) {
    throw new Error(
      interval === "year"
        ? "Annual billing is not configured. Add STRIPE_SCHOOL_ANNUAL_PRICE_ID."
        : "STRIPE_SCHOOL_PRICE_ID is not configured."
    );
  }
  return priceId;
}

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  return new Stripe(key);
}

export function getAppBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}
