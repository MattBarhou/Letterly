"use client";

import { useState } from "react";
import {
  HERO_RESUME_SNIPPET,
  HERO_SAMPLE_COMPANY,
  HERO_SAMPLE_OUTPUTS,
  HERO_SAMPLE_ROLE,
} from "@/lib/heroSample";

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

export default function HeroSampleOutput() {
  const [activeTab, setActiveTab] = useState("coverLetterDetailed");
  const activeSection = OUTPUT_SECTIONS.find((s) => s.key === activeTab);
  const activeText = HERO_SAMPLE_OUTPUTS[activeTab];

  return (
    <div className="relative w-full max-w-5xl mx-auto">
      <div className="absolute -inset-3 sm:-inset-5 bg-primary/10 blur-3xl rounded-full pointer-events-none" />

      <div className="relative space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 px-0.5">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-base-content/45">
              Sample output
            </p>
            <p className="text-sm text-base-content/70 mt-0.5">
              <span className="font-medium text-base-content/80">Before:</span>{" "}
              {HERO_RESUME_SNIPPET.name}&apos;s resume →{" "}
              <span className="font-medium text-base-content/80">After:</span>{" "}
              5 documents for {HERO_SAMPLE_ROLE} at {HERO_SAMPLE_COMPANY}
            </p>
          </div>
        </div>

        <div className="border border-base-300 rounded-2xl bg-base-100 overflow-hidden shadow-xl shadow-primary/10 ring-1 ring-base-content/5">
          <div className="px-5 sm:px-6 py-4 border-b border-base-300 flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-base-content/40 mb-0.5">
                Generated output
              </p>
              <h3 className="text-base font-semibold text-base-content">
                Application materials
              </h3>
            </div>
            <span className="text-xs text-base-content/40 tabular-nums shrink-0">
              5 documents
            </span>
          </div>

          <div className="flex flex-col lg:flex-row lg:min-h-88">
            <nav
              aria-label="Sample output documents"
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
                        className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors duration-150 lg:min-w-0 min-h-11 ${
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
                <span className="text-[11px] font-medium uppercase tracking-wide text-primary/70 shrink-0 hidden sm:inline">
                  Sample
                </span>
              </div>

              <div className="flex-1 px-5 sm:px-8 py-6 sm:py-8 overflow-y-auto max-h-72 sm:max-h-80 lg:max-h-96">
                <div className="max-w-prose">
                  <p className="whitespace-pre-wrap text-[15px] leading-[1.75] text-base-content/85">
                    {activeText}
                  </p>
                </div>
              </div>

              {activeTab === "linkedinMessage" && (
                <div className="px-5 sm:px-6 py-2.5 border-t border-base-300 flex items-center justify-end text-[11px] text-base-content/35 tabular-nums">
                  <span>{activeText.length} characters</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
