"use client";

import { SignInButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export default function UsageBanner({ refreshKey = 0 }) {
  const { isSignedIn } = useAuth();
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUsage = useCallback(async () => {
    if (!isSignedIn) {
      setUsage(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/usage");
      if (response.ok) {
        const data = await response.json();
        setUsage(data);
      }
    } catch {
      setUsage(null);
    } finally {
      setLoading(false);
    }
  }, [isSignedIn]);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage, refreshKey]);

  if (!isSignedIn) {
    return (
      <div className="alert bg-base-200 border border-base-300 mb-4">
        <span className="text-sm text-base-content/85">
          <SignInButton mode="modal">
            <button type="button" className="link link-primary font-medium">
              Sign in
            </button>
          </SignInButton>{" "}
          to get 3 free generations and 3 ZIP exports, then{" "}
          <Link href="/pricing" className="link link-primary font-medium">
            choose a plan
          </Link>{" "}
          when you need more.
        </span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="alert bg-base-200 border border-base-300 mb-4">
        <span className="loading loading-spinner loading-sm" />
        <span className="text-sm text-base-content/80">Loading usage…</span>
      </div>
    );
  }

  if (!usage) {
    return null;
  }

  const isLow = usage.remaining <= 1;

  return (
    <div
      className={`alert mb-4 border ${isLow ? "alert-warning border-warning/30" : "bg-base-200 border-base-300"}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 w-full">
        <span className="text-sm text-base-content/90">
          <span className="font-semibold capitalize">{usage.planName}</span> plan
          —{" "}
          <span className="font-medium">
            {usage.remaining} of {usage.limit}
          </span>{" "}
          generations {usage.lifetime ? "remaining" : "left this month"}
          {usage.tier === "free" && usage.exportLimit != null && (
            <>
              {" "}
              ·{" "}
              <span className="font-medium">
                {usage.exportRemaining} of {usage.exportLimit}
              </span>{" "}
              ZIP exports remaining
            </>
          )}
        </span>
        {usage.remaining === 0 ? (
          <Link href="/pricing" className="btn btn-primary btn-xs sm:btn-sm">
            Upgrade plan
          </Link>
        ) : usage.tier === "free" ? (
          <Link href="/pricing" className="btn btn-outline btn-xs sm:btn-sm">
            View plans
          </Link>
        ) : (
          <button
            type="button"
            className="btn btn-ghost btn-xs sm:btn-sm"
            onClick={async () => {
              const res = await fetch("/api/stripe/portal", { method: "POST" });
              const data = await res.json();
              if (data.url) window.location.href = data.url;
            }}
          >
            Manage billing
          </button>
        )}
      </div>
    </div>
  );
}
