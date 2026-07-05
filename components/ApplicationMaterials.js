"use client";

import Link from "next/link";
import { useState } from "react";

function CopyButton({ text, label }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="btn btn-outline btn-sm"
    >
      {copied ? "Copied" : label}
    </button>
  );
}

function EmailMaterial({ content }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-base-content/40 mb-1">
          Subject
        </p>
        <p className="text-sm font-medium">{content.subject}</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-base-content/40 mb-1">
          Body
        </p>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-base-content/85">
          {content.body}
        </p>
      </div>
      <CopyButton
        text={`Subject: ${content.subject}\n\n${content.body}`}
        label="Copy email"
      />
    </div>
  );
}

function StarOutlineContent({ outline }) {
  if (typeof outline === "string") {
    return (
      <p className="whitespace-pre-wrap text-sm text-base-content/80">
        {outline}
      </p>
    );
  }

  if (outline && typeof outline === "object") {
    const starKeys = ["Situation", "Task", "Action", "Result"];

    return (
      <div className="space-y-2 text-sm text-base-content/80">
        {starKeys.map((key) =>
          outline[key] ? (
            <p key={key}>
              <span className="font-medium">{key}: </span>
              {outline[key]}
            </p>
          ) : null
        )}
      </div>
    );
  }

  return null;
}

function InterviewPrepMaterial({ content }) {
  return (
    <div className="space-y-6">
      <section>
        <h4 className="font-semibold mb-2">Likely behavioral questions</h4>
        <ul className="list-disc pl-5 space-y-1 text-sm text-base-content/85">
          {content.behavioralQuestions.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section>
        <h4 className="font-semibold mb-2">Technical topics to review</h4>
        <ul className="list-disc pl-5 space-y-1 text-sm text-base-content/85">
          {content.technicalTopics.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section>
        <h4 className="font-semibold mb-2">STAR answer outlines</h4>
        <div className="space-y-3">
          {content.starOutlines.map((item) => (
            <div
              key={item.question}
              className="rounded-lg border border-base-300 p-4 bg-base-200/40"
            >
              <p className="font-medium text-sm mb-2">{item.question}</p>
              <StarOutlineContent outline={item.outline} />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h4 className="font-semibold mb-2">Questions to ask the interviewer</h4>
        <ul className="list-disc pl-5 space-y-1 text-sm text-base-content/85">
          {content.questionsToAsk.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

const MATERIAL_SECTIONS = [
  {
    type: "follow_up",
    title: "Follow-up email",
    description: "A polite one-week follow-up after applying.",
  },
  {
    type: "thank_you",
    title: "Thank-you email",
    description: "Post-interview thank-you note tailored to the role.",
  },
  {
    type: "interview_prep",
    title: "Interview prep",
    description: "Questions, topics, STAR outlines, and questions to ask.",
  },
];

export default function ApplicationMaterials({
  applicationId,
  materials,
  features,
  onMaterialSaved,
}) {
  const [activeType, setActiveType] = useState(MATERIAL_SECTIONS[0].type);
  const [generatingType, setGeneratingType] = useState(null);
  const [error, setError] = useState("");

  const materialMap = Object.fromEntries(
    materials.map((material) => [material.type, material.content])
  );

  async function handleGenerate(type) {
    setError("");
    setGeneratingType(type);

    try {
      const response = await fetch(
        `/api/applications/${applicationId}/materials`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to generate material.");
        return;
      }

      await onMaterialSaved();
      setActiveType(type);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setGeneratingType(null);
    }
  }

  if (!features?.extraMaterials) {
    return (
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body">
          <h2 className="card-title text-lg">Premium materials</h2>
          <p className="text-sm text-base-content/70">
            Generate follow-up emails, thank-you notes, and interview prep from
            this application on Premium.
          </p>
          <div className="card-actions justify-end">
            <Link href="/pricing" className="btn btn-primary btn-sm">
              Upgrade to Premium
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const activeSection = MATERIAL_SECTIONS.find((s) => s.type === activeType);
  const activeContent = materialMap[activeType];

  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body gap-4">
        <div>
          <h2 className="card-title text-lg">Premium materials</h2>
          <p className="text-sm text-base-content/70">
            Generate follow-ups, thank-you notes, and interview prep without
            using your monthly generation limit.
          </p>
        </div>

        {error && (
          <div role="alert" className="alert alert-error">
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {MATERIAL_SECTIONS.map((section) => (
            <button
              key={section.type}
              type="button"
              className={`btn btn-sm ${activeType === section.type ? "btn-primary" : "btn-outline"}`}
              onClick={() => setActiveType(section.type)}
            >
              {section.title}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-base-300 p-5">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
            <div>
              <h3 className="font-semibold">{activeSection.title}</h3>
              <p className="text-sm text-base-content/60 mt-1">
                {activeSection.description}
              </p>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-sm shrink-0"
              disabled={generatingType === activeType}
              onClick={() => handleGenerate(activeType)}
            >
              {generatingType === activeType ? (
                <>
                  <span className="loading loading-spinner loading-sm" />
                  Generating…
                </>
              ) : activeContent ? (
                "Regenerate"
              ) : (
                "Generate"
              )}
            </button>
          </div>

          {activeContent ? (
            activeType === "interview_prep" ? (
              <InterviewPrepMaterial content={activeContent} />
            ) : (
              <EmailMaterial content={activeContent} />
            )
          ) : (
            <p className="text-sm text-base-content/50">
              No {activeSection.title.toLowerCase()} generated yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
