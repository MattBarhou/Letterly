"use client";

import { useEffect, useState } from "react";

const OUTPUT_SECTIONS = [
  {
    key: "coverLetterBasic",
    label: "Concise cover letter",
    detail: "Concise",
    description: "Short form for application portals",
  },
  {
    key: "coverLetterDetailed",
    label: "Detailed cover letter",
    detail: "Extended",
    description: "More depth and context for the role",
  },
  {
    key: "recruiterEmail",
    label: "Recruiter email",
    detail: "Email",
    description: "Direct outreach to hiring teams",
  },
  {
    key: "linkedinMessage",
    label: "LinkedIn message",
    detail: "Message",
    description: "Connection request or follow-up",
  },
  {
    key: "atsVersion",
    label: "ATS version",
    detail: "Plain text",
    description: "Keyword-optimized for tracking systems",
  },
];

function CopyIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4 shrink-0"
      aria-hidden="true"
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4 shrink-0"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4 shrink-0"
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  );
}

function CopyButton({ copied, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={copied ? "Copied to clipboard" : "Copy to clipboard"}
      className={`inline-flex items-center justify-center gap-2 h-9 min-h-9 px-4 rounded-lg text-sm font-medium border transition-all duration-200 shrink-0 ${
        copied
          ? "bg-success text-success-content border-success shadow-sm"
          : "bg-base-100 text-base-content border-base-300 hover:bg-base-200 hover:border-base-content/20"
      }`}
    >
      {copied ? (
        <>
          <CheckIcon />
          <span>Copied</span>
        </>
      ) : (
        <>
          <CopyIcon />
          <span>Copy</span>
        </>
      )}
    </button>
  );
}

export default function GeneratedOutputs({ outputs, company, jobTitle }) {
  const [activeTab, setActiveTab] = useState(OUTPUT_SECTIONS[0].key);
  const [copiedKey, setCopiedKey] = useState(null);
  const [usage, setUsage] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  const canExportZip = usage?.canExportZip === true;
  const exportRemaining = usage?.exportRemaining;

  async function fetchUsage() {
    try {
      const response = await fetch("/api/usage");
      if (response.ok) {
        const data = await response.json();
        setUsage(data);
      }
    } catch {
      setUsage(null);
    }
  }

  useEffect(() => {
    setActiveTab(OUTPUT_SECTIONS[0].key);
    setCopiedKey(null);
    setExportError("");
  }, [outputs]);

  useEffect(() => {
    fetchUsage();
  }, [outputs]);

  const activeSection = OUTPUT_SECTIONS.find((s) => s.key === activeTab);
  const activeText = outputs[activeTab];
  const charCount = activeText.length;
  const isCopied = copiedKey === activeTab;

  async function handleCopy(key, text) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      setCopiedKey(null);
    }
  }

  async function handleExportZip() {
    setExportError("");
    setIsExporting(true);

    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company, jobTitle, outputs }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setExportError(data.error || "Export failed. Please try again.");
        return;
      }

      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition");
      const filenameMatch = disposition?.match(/filename="(.+)"/);
      const filename = filenameMatch?.[1] || "Letterly_export.zip";
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      // Safari/Firefox require the anchor to be in the DOM, and revoking the
      // blob URL too early cancels the download.
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      await fetchUsage();
    } catch {
      setExportError("Network error. Check your connection and try again.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div id="results" className="mt-14">
      <div className="border border-base-300 rounded-2xl bg-base-100 overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-base-300 flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-base-content/40 mb-0.5">
              Generated output
            </p>
            <h3 className="text-base font-semibold text-base-content">
              Application materials
            </h3>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {canExportZip ? (
              <button
                type="button"
                onClick={handleExportZip}
                disabled={isExporting}
                className="inline-flex items-center justify-center gap-2 h-9 min-h-9 px-4 rounded-lg text-sm font-medium border border-primary text-primary bg-primary/5 hover:bg-primary/10 transition-colors disabled:opacity-60"
              >
                {isExporting ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  <DownloadIcon />
                )}
                <span>
                  {isExporting
                    ? "Exporting…"
                    : exportRemaining != null
                      ? `Download ZIP (${exportRemaining} left)`
                      : "Download ZIP"}
                </span>
              </button>
            ) : usage?.tier === "free" ? (
              <a
                href="/pricing"
                className="text-xs text-base-content/50 hover:text-primary transition-colors"
              >
                No ZIP exports left
              </a>
            ) : (
              <a
                href="/pricing"
                className="text-xs text-base-content/50 hover:text-primary transition-colors"
              >
                ZIP export on Premium
              </a>
            )}
            <span className="text-xs text-base-content/40 tabular-nums">
              5 documents
            </span>
          </div>
        </div>

        {exportError && (
          <div role="alert" className="px-5 sm:px-6 py-3 border-b border-base-300 bg-error/5 text-sm text-error">
            {exportError}
          </div>
        )}

        <div className="flex flex-col lg:flex-row lg:min-h-[28rem]">
          <nav
            aria-label="Output documents"
            className="lg:w-60 shrink-0 border-b lg:border-b-0 lg:border-r border-base-300 bg-base-200/40"
          >
            <ul className="flex lg:flex-col gap-0.5 p-2 overflow-x-auto lg:overflow-visible">
              {OUTPUT_SECTIONS.map((section) => {
                const isActive = activeTab === section.key;
                return (
                  <li key={section.key} className="shrink-0 lg:shrink">
                    <button
                      type="button"
                      onClick={() => setActiveTab(section.key)}
                      aria-current={isActive ? "true" : undefined}
                      className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors duration-150 lg:min-w-0 ${
                        isActive
                          ? "bg-base-100 text-base-content shadow-sm ring-1 ring-base-300/80"
                          : "text-base-content/55 hover:text-base-content hover:bg-base-100/60"
                      }`}
                    >
                      <span className="flex items-baseline justify-between gap-2">
                        <span
                          className={`text-sm leading-tight ${isActive ? "font-medium" : ""}`}
                        >
                          {section.label}
                        </span>
                        <span className="text-[11px] text-base-content/35 tabular-nums shrink-0">
                          {section.detail}
                        </span>
                      </span>
                      <span className="hidden lg:block text-xs text-base-content/40 mt-0.5 leading-snug">
                        {section.description}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex-1 flex flex-col min-w-0">
            <div className="px-5 sm:px-6 py-3.5 border-b border-base-300 flex items-center justify-between gap-4 bg-base-100">
              <div className="min-w-0">
                <h4 className="text-sm font-medium text-base-content truncate">
                  {activeSection.label}
                </h4>
                <p className="text-xs text-base-content/40 mt-0.5">
                  {activeSection.description}
                </p>
              </div>
              <CopyButton
                copied={isCopied}
                onClick={() => handleCopy(activeTab, activeText)}
              />
            </div>

            <div className="flex-1 px-5 sm:px-8 py-6 sm:py-8 overflow-y-auto max-h-[32rem] lg:max-h-none">
              <div className="max-w-prose">
                <p className="whitespace-pre-wrap text-[15px] leading-[1.75] text-base-content/85">
                  {activeText}
                </p>
              </div>
            </div>

            {activeTab === "linkedinMessage" && (
              <div className="px-5 sm:px-6 py-2.5 border-t border-base-300 flex items-center justify-end text-[11px] text-base-content/35 tabular-nums">
                <span>{charCount} characters</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
