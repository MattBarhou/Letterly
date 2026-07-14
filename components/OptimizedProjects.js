"use client";

import { useState } from "react";

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

function CopyButton({ copied, onClick, label = "Copy" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={copied ? "Copied to clipboard" : "Copy to clipboard"}
      className={`inline-flex items-center justify-center gap-1.5 h-8 min-h-8 px-3 rounded-lg text-xs font-medium border transition-all duration-200 shrink-0 ${
        copied
          ? "bg-success text-success-content border-success"
          : "bg-base-100 text-base-content border-base-300 hover:bg-base-200"
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
          <span>{label}</span>
        </>
      )}
    </button>
  );
}

function buildAllOptimizedText(projects) {
  return projects
    .map((project) => {
      const bullets = project.optimizedBullets.map((b) => `• ${b.text}`).join("\n");
      return `${project.name}\n${bullets}`;
    })
    .join("\n\n");
}

export default function OptimizedProjects({ results }) {
  const [copiedKey, setCopiedKey] = useState(null);

  async function handleCopy(key, text) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      setCopiedKey(null);
    }
  }

  const allOptimizedText = buildAllOptimizedText(results.projects);

  return (
    <div id="results" className="mt-10">
      <div className="border border-base-300 rounded-2xl bg-base-100 overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-base-300 flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-base-content/40 mb-0.5">
              Optimization results
            </p>
            <h3 className="text-base font-semibold text-base-content">
              Projects section
            </h3>
          </div>
          {results.projects.length > 0 && (
            <CopyButton
              copied={copiedKey === "all"}
              onClick={() => handleCopy("all", allOptimizedText)}
              label="Copy all"
            />
          )}
        </div>

        <div className="px-5 sm:px-6 py-5 border-b border-base-300 bg-base-200/20">
          <p className="text-sm leading-relaxed text-base-content/85">
            {results.summary}
          </p>
          {results.recommendations.length > 0 && (
            <ul className="mt-4 space-y-2">
              {results.recommendations.map((rec, index) => (
                <li
                  key={index}
                  className="flex gap-2 text-sm text-base-content/75"
                >
                  <span className="text-primary shrink-0">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {results.projects.length === 0 ? (
          <div className="px-5 sm:px-6 py-8 text-center">
            <p className="text-sm text-base-content/70">
              No Projects section with bullet points was found in your resume.
              {results.sectionsFound?.experience && (
                <> An Experience section was detected — try adding a Projects section, or check back for Experience optimization in a future update.</>
              )}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-base-300">
            {results.projects.map((project, projectIndex) => (
              <div key={projectIndex} className="px-5 sm:px-6 py-6">
                <h4 className="text-sm font-semibold text-base-content mb-4">
                  {project.name}
                </h4>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="rounded-lg border border-base-300 bg-base-200/30 p-4">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-base-content/45 mb-3">
                      Original
                    </p>
                    <ul className="space-y-2">
                      {project.originalBullets.map((bullet, index) => (
                        <li
                          key={index}
                          className="text-sm text-base-content/75 leading-relaxed"
                        >
                          • {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-primary/70 mb-3">
                      Optimized
                    </p>
                    <ul className="space-y-3">
                      {project.optimizedBullets.map((bullet, index) => {
                        const copyKey = `${projectIndex}-${index}`;
                        return (
                          <li key={index} className="group">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm text-base-content leading-relaxed flex-1">
                                • {bullet.text}
                              </p>
                              <CopyButton
                                copied={copiedKey === copyKey}
                                onClick={() => handleCopy(copyKey, bullet.text)}
                              />
                            </div>
                            {bullet.rationale && (
                              <p className="text-xs text-base-content/50 mt-1 ml-3">
                                {bullet.rationale}
                              </p>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
