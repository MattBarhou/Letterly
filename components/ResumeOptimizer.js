"use client";

import { SignInButton, useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import OptimizedProjects from "@/components/OptimizedProjects";
import ResumeUpload from "@/components/ResumeUpload";
import UsageBanner from "@/components/UsageBanner";

export default function ResumeOptimizer() {
  const { isSignedIn } = useAuth();
  const [resumeText, setResumeText] = useState("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [apiError, setApiError] = useState("");
  const [results, setResults] = useState(null);
  const [usageRefreshKey, setUsageRefreshKey] = useState(0);

  useEffect(() => {
    if (!isSignedIn) {
      return;
    }

    setIsLoadingProfile(true);
    fetch("/api/profile")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data?.profile?.resumeText) {
          setResumeText((prev) => prev || data.profile.resumeText);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoadingProfile(false));
  }, [isSignedIn]);

  async function handleOptimize() {
    if (!resumeText.trim()) {
      setApiError("Please upload a PDF or paste your resume text first.");
      return;
    }

    if (!isSignedIn) {
      setApiError("Sign in to optimize your resume.");
      return;
    }

    setApiError("");
    setResults(null);
    setIsOptimizing(true);

    try {
      const response = await fetch("/api/optimize-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume: resumeText }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setApiError("Sign in to optimize your resume.");
        } else if (response.status === 402) {
          setApiError(
            data.error ||
              "You've reached your generation limit. Upgrade your plan to continue."
          );
        } else {
          setApiError(data.error || "Something went wrong. Please try again.");
        }
        return;
      }

      setResults(data);
      setUsageRefreshKey((key) => key + 1);
      document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
    } catch {
      setApiError("Network error. Please try again.");
    } finally {
      setIsOptimizing(false);
    }
  }

  const canOptimize = resumeText.trim().length > 0 && !isOptimizing;

  return (
    <div className="max-w-4xl mx-auto">
      <UsageBanner refreshKey={usageRefreshKey} />

      {isLoadingProfile && (
        <div className="alert bg-base-200 border border-base-300 mb-4">
          <span className="loading loading-spinner loading-sm" />
          <span className="text-sm text-base-content/80">Loading saved resume…</span>
        </div>
      )}

      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body gap-6">
          <ResumeUpload
            resumeText={resumeText}
            onResumeTextChange={setResumeText}
            disabled={isOptimizing}
            hasError={Boolean(apiError && !resumeText.trim())}
          />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
            <div>
              {!isSignedIn ? (
                <p className="text-sm text-base-content/70">
                  <SignInButton mode="modal">
                    <button type="button" className="link link-primary font-medium">
                      Sign in
                    </button>
                  </SignInButton>{" "}
                  to optimize your resume. Uses 1 generation from your plan.
                </p>
              ) : (
                <p className="text-sm text-base-content/60">
                  Uses 1 generation from your plan
                </p>
              )}
            </div>

            {isSignedIn ? (
              <button
                type="button"
                onClick={handleOptimize}
                disabled={!canOptimize}
                className="btn btn-primary btn-lg shrink-0"
              >
                {isOptimizing ? (
                  <>
                    <span className="loading loading-spinner loading-sm" />
                    Optimizing…
                  </>
                ) : (
                  "Optimize Resume"
                )}
              </button>
            ) : (
              <SignInButton mode="modal">
                <button
                  type="button"
                  disabled={!canOptimize}
                  className="btn btn-primary btn-lg shrink-0"
                >
                  Optimize Resume
                </button>
              </SignInButton>
            )}
          </div>

          {isOptimizing && (
            <p className="text-sm text-base-content/60 text-center -mt-2">
              This usually takes 15–30 seconds…
            </p>
          )}

          {apiError && (
            <div role="alert" className="alert alert-error">
              <span className="text-sm">{apiError}</span>
            </div>
          )}
        </div>
      </div>

      {results && <OptimizedProjects results={results} />}
    </div>
  );
}
