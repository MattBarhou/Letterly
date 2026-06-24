"use client";

import { useState } from "react";
import GeneratedOutputs from "@/components/GeneratedOutputs";
import ResumeUpload from "@/components/ResumeUpload";
import UsageBanner from "@/components/UsageBanner";

const INITIAL_FORM = {
  resumeText: "",
  jobDescription: "",
  company: "",
  jobTitle: "",
  yearsExperience: "0",
  tone: "Professional",
};

export default function ApplicationForm() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [outputs, setOutputs] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [usageRefreshKey, setUsageRefreshKey] = useState(0);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  }

  function validate() {
    const newErrors = {};
    if (!form.resumeText.trim()) {
      newErrors.resumeText = "Please upload a PDF or paste your resume text.";
    }
    if (!form.jobDescription.trim()) {
      newErrors.jobDescription = "Please paste the job description.";
    }
    if (!form.company.trim()) {
      newErrors.company = "Company name is required.";
    }
    if (!form.jobTitle.trim()) {
      newErrors.jobTitle = "Job title is required.";
    }
    return newErrors;
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
    setIsGenerating(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume: form.resumeText,
          jobDescription: form.jobDescription,
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

      setOutputs(data);
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
            Generate your application materials
          </h2>
          <p className="text-base-content/85 max-w-lg mx-auto">
            Upload your resume PDF or paste the text, then add the job posting.
            The more detail you provide, the better the results.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="card bg-base-100 shadow-xl border border-base-300"
        >
          <div className="card-body gap-2">
            <UsageBanner refreshKey={usageRefreshKey} />

            {/* Section: Your background */}
            <div className="pb-2">
              <h3 className="font-semibold text-base text-base-content mb-1">
                Your background
              </h3>
              <p className="text-sm text-base-content/80 mb-4">
                Include education, projects, skills, internships, and any work
                experience.
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

            {/* Section: The role */}
            <div className="pb-2">
              <h3 className="font-semibold text-base text-base-content mb-1">
                The role
              </h3>
              <p className="text-sm text-base-content/80 mb-4">
                Copy the full job posting from LinkedIn, the company careers
                page, or WaterlooWorks.
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
                  placeholder={`Example:\n\nSoftware Engineer Intern — Shopify\n\nWe're looking for a motivated intern to join our Backend team in Toronto.\n\nRequirements:\n- Currently enrolled in a CS or related program\n- Experience with Ruby, Python, or Go\n- Familiarity with REST APIs and databases\n\nNice to have: Open source contributions, prior internship experience`}
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="form-control">
                  <label className="label py-1" htmlFor="company">
                    <span className="label-text font-semibold text-base-content">
                      Company name
                    </span>
                    <span className="text-xs font-semibold text-error">
                      Required
                    </span>
                  </label>
                  <input
                    id="company"
                    name="company"
                    type="text"
                    className={`input input-bordered w-full text-base-content placeholder:text-base-content/45 focus:input-primary ${errors.company ? "input-error" : ""}`}
                    placeholder="e.g. Shopify, Google, Wealthsimple"
                    value={form.company}
                    onChange={handleChange}
                    disabled={isGenerating}
                  />
                  {errors.company && (
                    <label className="label py-1">
                      <span className="text-sm font-medium text-error">
                        {errors.company}
                      </span>
                    </label>
                  )}
                </div>

                <div className="form-control">
                  <label className="label py-1" htmlFor="jobTitle">
                    <span className="label-text font-semibold text-base-content">
                      Job title
                    </span>
                    <span className="text-xs font-semibold text-error">
                      Required
                    </span>
                  </label>
                  <input
                    id="jobTitle"
                    name="jobTitle"
                    type="text"
                    className={`input input-bordered w-full text-base-content placeholder:text-base-content/45 focus:input-primary ${errors.jobTitle ? "input-error" : ""}`}
                    placeholder="e.g. Software Engineer Intern, New Grad SWE"
                    value={form.jobTitle}
                    onChange={handleChange}
                    disabled={isGenerating}
                  />
                  {errors.jobTitle && (
                    <label className="label py-1">
                      <span className="text-sm font-medium text-error">
                        {errors.jobTitle}
                      </span>
                    </label>
                  )}
                </div>
              </div>
            </div>

            <div className="divider my-2" />

            {/* Section: Preferences */}
            <div className="pb-2">
              <h3 className="font-semibold text-base text-base-content mb-1">
                Preferences
              </h3>
              <p className="text-sm text-base-content/80 mb-4">
                Match the tone to the company culture — Big Tech for FAANG-style
                apps, Startup for early-stage companies.
              </p>

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
                  "Generate Application Materials"
                )}
              </button>
            </div>

            {isGenerating && (
              <div className="alert alert-info mt-2">
                <span className="loading loading-spinner loading-sm" />
                <span>
                  This usually takes 20–40 seconds. Hang tight while we tailor
                  your content.
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
          <GeneratedOutputs
            outputs={outputs}
            company={form.company}
            jobTitle={form.jobTitle}
          />
        )}
      </div>
    </section>
  );
}
