"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import GeneratedOutputs from "@/components/GeneratedOutputs";
import ResumeUpload from "@/components/ResumeUpload";
import UsageBanner from "@/components/UsageBanner";

const INITIAL_FORM = {
  resumeText: "",
  jobDescription: "",
  jobUrl: "",
  company: "",
  jobTitle: "",
  yearsExperience: "0",
  tone: "Professional",
};

const COMPANY_PREFETCH_DELAY_MS = 600;
const MIN_COMPANY_LENGTH = 2;

export default function ApplicationForm() {
  const { isSignedIn } = useAuth();
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [outputs, setOutputs] = useState(null);
  const [resolvedCompany, setResolvedCompany] = useState("");
  const [resolvedJobTitle, setResolvedJobTitle] = useState("");
  const [savedApplicationId, setSavedApplicationId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isImportingJob, setIsImportingJob] = useState(false);
  const [importError, setImportError] = useState("");
  const [features, setFeatures] = useState(null);
  const [usageRefreshKey, setUsageRefreshKey] = useState(0);
  const prefetchTimeoutRef = useRef(null);
  const lastPrefetchedCompanyRef = useRef("");

  function prefetchCompanyResearch(company) {
    const trimmed = company.trim();
    if (trimmed.length < MIN_COMPANY_LENGTH || trimmed === lastPrefetchedCompanyRef.current) {
      return;
    }

    lastPrefetchedCompanyRef.current = trimmed;

    fetch("/api/company-research", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company: trimmed }),
    }).catch(() => {});
  }

  useEffect(() => {
    if (!isSignedIn) {
      return;
    }

    fetch("/api/profile")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!data?.profile) {
          return;
        }

        setForm((prev) => ({
          ...prev,
          resumeText: prev.resumeText || data.profile.resumeText || "",
          tone: prev.tone || data.profile.defaultTone || "Professional",
          yearsExperience:
            prev.yearsExperience || data.profile.defaultYearsExperience || "0",
        }));
      })
      .catch(() => {});

    fetch("/api/applications")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data?.features) {
          setFeatures(data.features);
        }
      })
      .catch(() => {});
  }, [isSignedIn]);

  useEffect(() => {
    const company = form.company.trim();

    if (company.length < MIN_COMPANY_LENGTH) {
      lastPrefetchedCompanyRef.current = "";
      return;
    }

    clearTimeout(prefetchTimeoutRef.current);
    prefetchTimeoutRef.current = setTimeout(() => {
      prefetchCompanyResearch(company);
    }, COMPANY_PREFETCH_DELAY_MS);

    return () => {
      clearTimeout(prefetchTimeoutRef.current);
    };
  }, [form.company]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  }

  function handleCompanyBlur() {
    clearTimeout(prefetchTimeoutRef.current);
    prefetchCompanyResearch(form.company);
  }

  function validate() {
    const newErrors = {};
    if (!form.resumeText.trim()) {
      newErrors.resumeText = "Please upload a PDF or paste your resume text.";
    }
    if (!form.jobDescription.trim()) {
      newErrors.jobDescription = "Please paste the job description.";
    }
    return newErrors;
  }

  async function handleImportJob() {
    const jobUrl = form.jobUrl.trim();
    if (!jobUrl) {
      setImportError("Enter a job posting URL first.");
      return;
    }

    setImportError("");
    setIsImportingJob(true);

    try {
      const response = await fetch("/api/parse-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: jobUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        setImportError(data.error || "Could not import job posting.");
        return;
      }

      setForm((prev) => ({
        ...prev,
        company: data.company || prev.company,
        jobTitle: data.jobTitle || prev.jobTitle,
        jobDescription: data.jobDescription || prev.jobDescription,
      }));
    } catch {
      setImportError("Network error. Please try again.");
    } finally {
      setIsImportingJob(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setApiError("");
    setSavedApplicationId(null);
    setIsGenerating(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume: form.resumeText,
          jobDescription: form.jobDescription,
          jobUrl: form.jobUrl,
          company: form.company,
          jobTitle: form.jobTitle,
          yearsExperience: form.yearsExperience,
          tone: form.tone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setApiError("Sign in to generate application materials.");
        } else if (response.status === 402) {
          setApiError(
            data.error ||
              "You've reached your generation limit. Upgrade your plan to continue."
          );
        } else {
          setApiError(data.error || "Something went wrong. Please try again.");
        }
        setOutputs(null);
        return;
      }

      const nextCompany = data.company || form.company;
      const nextJobTitle = data.jobTitle || form.jobTitle;

      setResolvedCompany(nextCompany);
      setResolvedJobTitle(nextJobTitle);
      setForm((prev) => ({
        ...prev,
        company: prev.company.trim() ? prev.company : nextCompany,
        jobTitle: prev.jobTitle.trim() ? prev.jobTitle : nextJobTitle,
      }));
      setOutputs(data);
      setSavedApplicationId(data.applicationId || null);
      setUsageRefreshKey((key) => key + 1);
      document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
    } catch {
      setApiError("Network error. Check your connection and try again.");
      setOutputs(null);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <section
      id="generate"
      className="py-20 px-4 lg:px-8 bg-linear-to-b from-base-100 to-base-200 border-t border-base-300"
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-primary font-semibold text-sm uppercase tracking-wide mb-2">
            Get started
          </p>
          <h2 className="text-3xl font-bold mb-2">
            Generate your first application
          </h2>
          <p className="text-base-content/85 max-w-lg mx-auto">
            Upload your resume, paste the job posting, and get five tailored
            documents — company and role are detected automatically.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="card bg-base-100 shadow-xl border border-base-300"
        >
          <div className="card-body gap-2">
            <UsageBanner refreshKey={usageRefreshKey} />

            <div className="pb-2">
              <h3 className="font-semibold text-base text-base-content mb-1">
                1. Upload resume
              </h3>
              <p className="text-sm text-base-content/80 mb-4">
                PDF or paste — built from your experience, not generic AI fluff.
              </p>

              <ResumeUpload
                resumeText={form.resumeText}
                onResumeTextChange={(text) => {
                  setForm((prev) => ({ ...prev, resumeText: text }));
                  if (errors.resumeText) {
                    setErrors((prev) => ({ ...prev, resumeText: "" }));
                  }
                }}
                disabled={isGenerating}
                hasError={Boolean(errors.resumeText)}
              />
              {errors.resumeText && (
                <label className="label py-1">
                  <span className="text-sm font-medium text-error">
                    {errors.resumeText}
                  </span>
                </label>
              )}
            </div>

            <div className="divider my-2" />

            <div className="pb-2">
              <h3 className="font-semibold text-base text-base-content mb-1">
                2. Paste job description
              </h3>
              <p className="text-sm text-base-content/80 mb-4">
                Copy the full posting from LinkedIn, Indeed, or a careers page.
              </p>

              <div className="form-control">
                <label className="label py-1" htmlFor="jobDescription">
                  <span className="label-text font-semibold text-base-content">
                    Job description
                  </span>
                  <span className="text-xs font-semibold text-error">
                    Required
                  </span>
                </label>
                <textarea
                  id="jobDescription"
                  name="jobDescription"
                  className={`textarea textarea-bordered h-40 w-full text-base-content placeholder:text-base-content/45 focus:textarea-primary ${errors.jobDescription ? "textarea-error" : ""}`}
                  placeholder={`Example:\n\nMarketing Coordinator — BrightPath\n\nWe're looking for a motivated coordinator to join our growth team.\n\nRequirements:\n- Strong written communication\n- Experience with social media or email campaigns\n- Comfortable managing multiple deadlines`}
                  value={form.jobDescription}
                  onChange={handleChange}
                  disabled={isGenerating}
                />
                {errors.jobDescription && (
                  <label className="label py-1">
                    <span className="text-sm font-medium text-error">
                      {errors.jobDescription}
                    </span>
                  </label>
                )}
                <p className="text-xs text-base-content/50 mt-2">
                  Company and job title are detected automatically from the
                  posting. Override them in Advanced options if needed.
                </p>
              </div>
            </div>

            <details className="collapse collapse-arrow border border-base-300 rounded-xl bg-base-200/40 mt-2">
              <summary className="collapse-title min-h-0 py-3 text-sm font-medium text-base-content/80">
                Advanced options
              </summary>
              <div className="collapse-content space-y-4 pt-0">
                <div className="form-control">
                  <label className="label py-1" htmlFor="jobUrl">
                    <span className="label-text font-semibold text-base-content">
                      Job posting URL
                    </span>
                    <span className="text-xs text-base-content/50">Optional</span>
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      id="jobUrl"
                      name="jobUrl"
                      type="url"
                      className="input input-bordered w-full text-base-content placeholder:text-base-content/45 focus:input-primary"
                      placeholder="https://jobs.lever.co/company/role-id"
                      value={form.jobUrl}
                      onChange={handleChange}
                      disabled={isGenerating || isImportingJob}
                    />
                    <button
                      type="button"
                      className="btn btn-outline btn-primary sm:shrink-0"
                      onClick={handleImportJob}
                      disabled={
                        isGenerating ||
                        isImportingJob ||
                        !features?.jobUrlImport
                      }
                    >
                      {isImportingJob ? (
                        <>
                          <span className="loading loading-spinner loading-sm" />
                          Importing…
                        </>
                      ) : (
                        "Import"
                      )}
                    </button>
                  </div>
                  {!features?.jobUrlImport && isSignedIn && (
                    <label className="label py-1">
                      <span className="text-xs text-base-content/50">
                        Job URL import is available on Starter and Premium.{" "}
                        <Link href="/pricing" className="link link-primary">
                          Upgrade
                        </Link>
                      </span>
                    </label>
                  )}
                  {importError && (
                    <label className="label py-1">
                      <span className="text-sm font-medium text-error">
                        {importError}
                      </span>
                    </label>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label py-1" htmlFor="company">
                      <span className="label-text font-semibold text-base-content">
                        Company name
                      </span>
                      <span className="text-xs text-base-content/50">
                        Optional
                      </span>
                    </label>
                    <input
                      id="company"
                      name="company"
                      type="text"
                      className="input input-bordered w-full text-base-content placeholder:text-base-content/45 focus:input-primary"
                      placeholder="Auto-detected if left blank"
                      value={form.company}
                      onChange={handleChange}
                      onBlur={handleCompanyBlur}
                      disabled={isGenerating}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label py-1" htmlFor="jobTitle">
                      <span className="label-text font-semibold text-base-content">
                        Job title
                      </span>
                      <span className="text-xs text-base-content/50">
                        Optional
                      </span>
                    </label>
                    <input
                      id="jobTitle"
                      name="jobTitle"
                      type="text"
                      className="input input-bordered w-full text-base-content placeholder:text-base-content/45 focus:input-primary"
                      placeholder="Auto-detected if left blank"
                      value={form.jobTitle}
                      onChange={handleChange}
                      disabled={isGenerating}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label py-1" htmlFor="yearsExperience">
                      <span className="label-text font-semibold text-base-content">
                        Years of experience
                      </span>
                    </label>
                    <select
                      id="yearsExperience"
                      name="yearsExperience"
                      className="select select-bordered w-full text-base-content focus:select-primary"
                      value={form.yearsExperience}
                      onChange={handleChange}
                      disabled={isGenerating}
                    >
                      <option value="0">0 — Student / New grad</option>
                      <option value="1">1 year</option>
                      <option value="2">2 years</option>
                      <option value="3+">3+ years</option>
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label py-1" htmlFor="tone">
                      <span className="label-text font-semibold text-base-content">
                        Tone
                      </span>
                    </label>
                    <select
                      id="tone"
                      name="tone"
                      className="select select-bordered w-full text-base-content focus:select-primary"
                      value={form.tone}
                      onChange={handleChange}
                      disabled={isGenerating}
                    >
                      <option value="Professional">Professional</option>
                      <option value="Big Tech">Big Tech</option>
                      <option value="Startup">Startup</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>
                </div>
              </div>
            </details>

            <div className="card-actions justify-end pt-4">
              <button
                type="submit"
                className="btn btn-primary btn-lg w-full sm:w-auto min-w-[220px] shadow-lg shadow-primary/20"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <span className="loading loading-spinner loading-sm" />
                    Generating your materials…
                  </>
                ) : (
                  "Generate My Application"
                )}
              </button>
            </div>

            {isGenerating && (
              <div className="alert alert-info mt-2">
                <span className="loading loading-spinner loading-sm" />
                <span>
                  Detecting the role and writing your documents — usually 15–30
                  seconds.
                </span>
              </div>
            )}

            {apiError && (
              <div role="alert" className="alert alert-error mt-2">
                <span>{apiError}</span>
              </div>
            )}
          </div>
        </form>

        {outputs && (
          <>
            {savedApplicationId && (
              <div className="alert alert-success mt-6 border border-success/30">
                <span className="text-sm">
                  Saved to your applications.{" "}
                  <Link
                    href={`/applications/${savedApplicationId}`}
                    className="link link-primary font-medium"
                  >
                    View application
                  </Link>
                </span>
              </div>
            )}
            <GeneratedOutputs
              outputs={outputs}
              company={resolvedCompany || form.company}
              jobTitle={resolvedJobTitle || form.jobTitle}
            />
          </>
        )}
      </div>
    </section>
  );
}
