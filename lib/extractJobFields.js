import { callOpenAI } from "@/lib/openai";

const FALLBACK_JOB_TITLE = "this role";

export function buildJobFieldExtractionPrompt(jobDescription) {
  return `Extract the hiring company name and job title from this job posting.

Return valid JSON only with this structure:
{
  "company": "",
  "jobTitle": ""
}

Rules:
- company: the hiring company or organization name only. Empty string if truly unknown.
- jobTitle: the role title (e.g. "Marketing Coordinator", "Software Engineer Intern"). Empty string if truly unknown.
- Do not invent a company that is not mentioned or clearly implied.
- Prefer the most specific title in the posting.

Job posting:
${jobDescription}`;
}

export function parseJobFieldExtraction(content) {
  let parsed;

  try {
    parsed = JSON.parse(content);
  } catch {
    return { company: "", jobTitle: "" };
  }

  const company =
    typeof parsed.company === "string" ? parsed.company.trim() : "";
  const jobTitle =
    typeof parsed.jobTitle === "string" ? parsed.jobTitle.trim() : "";

  return { company, jobTitle };
}

/**
 * Resolve company and job title from explicit form values and/or the job description.
 * Never throws — always returns usable strings for generation.
 */
export async function resolveJobFields(openai, { company, jobTitle, jobDescription }) {
  let resolvedCompany = typeof company === "string" ? company.trim() : "";
  let resolvedJobTitle = typeof jobTitle === "string" ? jobTitle.trim() : "";

  if (resolvedCompany && resolvedJobTitle) {
    return { company: resolvedCompany, jobTitle: resolvedJobTitle };
  }

  try {
    const content = await callOpenAI(openai, [
      {
        role: "system",
        content:
          "You extract company name and job title from job postings. Always respond with valid JSON only.",
      },
      {
        role: "user",
        content: buildJobFieldExtractionPrompt(jobDescription),
      },
    ]);

    const extracted = parseJobFieldExtraction(content);
    if (!resolvedCompany) {
      resolvedCompany = extracted.company;
    }
    if (!resolvedJobTitle) {
      resolvedJobTitle = extracted.jobTitle;
    }
  } catch (error) {
    console.error("Job field extraction failed:", error);
  }

  if (!resolvedJobTitle) {
    resolvedJobTitle = FALLBACK_JOB_TITLE;
  }

  return {
    company: resolvedCompany,
    jobTitle: resolvedJobTitle,
  };
}
