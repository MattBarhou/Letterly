export const PLANS = {
  free: {
    id: "free",
    name: "Free",
    limit: 3,
    lifetime: true,
    priceMonthly: 0,
    priceAnnual: 0,
  },
  starter: {
    id: "starter",
    name: "Starter",
    limit: 20,
    lifetime: false,
    priceMonthly: 9,
    priceAnnual: 70,
  },
  premium: {
    id: "premium",
    name: "Premium",
    limit: 50,
    lifetime: false,
    priceMonthly: 20,
    priceAnnual: 180,
  },
};

export const PRICE_TO_TIER = {
  [process.env.STRIPE_PRICE_STARTER_MONTHLY]: "starter",
  [process.env.STRIPE_PRICE_STARTER_ANNUAL]: "starter",
  [process.env.STRIPE_PRICE_PREMIUM_MONTHLY]: "premium",
  [process.env.STRIPE_PRICE_PREMIUM_ANNUAL]: "premium",
};

export function getTierFromPriceId(priceId) {
  return PRICE_TO_TIER[priceId] || null;
}

export function getPlan(tier) {
  return PLANS[tier] || PLANS.free;
}
