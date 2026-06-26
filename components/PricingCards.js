"use client";

import { useAuth } from "@clerk/nextjs";
import { useState } from "react";

const PLANS = [
  {
    id: "free",
    name: "Free",
    priceMonthly: 0,
    priceAnnual: 0,
    limit: "3 generations",
    limitDetail: "lifetime",
    features: [
      "All 5 output types",
      "PDF resume upload",
      "Company research",
    ],
    cta: "Get started free",
    priceId: null,
    highlighted: false,
  },
  {
    id: "starter",
    name: "Starter",
    priceMonthly: 9,
    priceAnnual: 70,
    limit: "20 generations",
    limitDetail: "per month",
    features: [
      "Everything in Free",
      "Enough for steady applying",
      "Cancel anytime",
    ],
    cta: "Subscribe",
    highlighted: true,
  },
  {
    id: "premium",
    name: "Premium",
    priceMonthly: 20,
    priceAnnual: 180,
    limit: "50 generations",
    limitDetail: "per month",
    features: [
      "Everything in Starter",
      "ZIP export (PDF cover letters)",
      "For recruiting season",
    ],
    cta: "Subscribe",
    highlighted: false,
  },
];

export default function PricingCards() {
  const { isSignedIn } = useAuth();
  const [billing, setBilling] = useState("monthly");
  const [loadingId, setLoadingId] = useState(null);
  const [error, setError] = useState("");

  async function handleCheckout(planId) {
    if (!isSignedIn) {
      setError("Sign in first, then choose a plan.");
      return;
    }

    setError("");
    setLoadingId(planId);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, billing }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Checkout failed.");
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div>
      <div className="flex justify-center mb-10">
        <div className="inline-flex rounded-lg border border-base-300 p-1 bg-base-200">
          <button
            type="button"
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${billing === "monthly" ? "bg-base-100 shadow-sm text-base-content" : "text-base-content/60"}`}
            onClick={() => setBilling("monthly")}
          >
            Monthly
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${billing === "annual" ? "bg-base-100 shadow-sm text-base-content" : "text-base-content/60"}`}
            onClick={() => setBilling("annual")}
          >
            Annual
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="alert alert-error mb-6 max-w-2xl mx-auto">
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {PLANS.map((plan) => {
          const isAnnual = billing === "annual";
          const price = isAnnual ? plan.priceAnnual : plan.priceMonthly;
          const isPaid = plan.id !== "free";

          return (
            <div
              key={plan.id}
              className={`card bg-base-100 border ${plan.highlighted ? "border-primary shadow-lg ring-1 ring-primary/20" : "border-base-300 shadow-sm"}`}
            >
              <div className="card-body">
                {plan.highlighted && (
                  <span className="badge badge-primary badge-outline w-fit text-xs">
                    Most popular
                  </span>
                )}
                <h3 className="card-title text-xl">{plan.name}</h3>
                <div className="mt-2 mb-4">
                  <span className="text-4xl font-bold">${price}</span>
                  {isPaid && (
                    <span className="text-base-content/60 text-sm ml-1">
                      /{isAnnual ? "year" : "month"}
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-base-content/85">
                  {plan.limit}{" "}
                  <span className="text-base-content/60">{plan.limitDetail}</span>
                </p>
                <ul className="mt-4 space-y-2 text-sm text-base-content/80">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <span className="text-success shrink-0">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="card-actions mt-6">
                  {isPaid ? (
                    <button
                      type="button"
                      className={`btn w-full ${plan.highlighted ? "btn-primary" : "btn-outline btn-primary"}`}
                      disabled={loadingId === plan.id}
                      onClick={() => handleCheckout(plan.id)}
                    >
                      {loadingId === plan.id ? (
                        <span className="loading loading-spinner loading-sm" />
                      ) : (
                        plan.cta
                      )}
                    </button>
                  ) : (
                    <a href="/#generate" className="btn btn-outline w-full">
                      {plan.cta}
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
