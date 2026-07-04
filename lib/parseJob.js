const ALLOWED_HOSTS = [
  "linkedin.com",
  "www.linkedin.com",
  "jobs.lever.co",
  "boards.greenhouse.io",
  "myworkdayjobs.com",
  "indeed.com",
  "www.indeed.com",
  "careers.google.com",
  "jobs.ashbyhq.com",
  "apply.workable.com",
];

const FETCH_TIMEOUT_MS = 12000;
const MAX_HTML_LENGTH = 200000;
const MIN_EXTRACTED_TEXT_LENGTH = 200;

export function isAllowedJobUrl(urlString) {
  try {
    const url = new URL(urlString);
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return false;
    }

    const hostname = url.hostname.toLowerCase();
    return ALLOWED_HOSTS.some(
      (host) => hostname === host || hostname.endsWith(`.${host}`)
    );
  } catch {
    return false;
  }
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

export async function fetchJobPageText(urlString) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(urlString, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; LetterlyBot/1.0; +https://letterly.ca)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`Job page returned ${response.status}.`);
    }

    const html = (await response.text()).slice(0, MAX_HTML_LENGTH);
    const text = stripHtml(html);

    if (text.length < MIN_EXTRACTED_TEXT_LENGTH) {
      throw new Error(
        "Could not extract enough text from this page. Paste the job description manually."
      );
    }

    return text.slice(0, 12000);
  } finally {
    clearTimeout(timeout);
  }
}

export function buildJobParsePrompt(pageText) {
  return `Extract job application details from the following job posting page text.

Return valid JSON only with this structure:
{
  "company": "",
  "jobTitle": "",
  "jobDescription": ""
}

Rules:
- company: the hiring company name
- jobTitle: the role title
- jobDescription: the full job description text, cleaned up for use in a cover letter prompt. Include responsibilities and requirements. Do not invent details.
- If a field cannot be determined, use your best reasonable guess from context or an empty string for jobDescription only if truly unavailable.

Job posting text:
${pageText}`;
}

export function parseJobExtraction(content) {
  let parsed;

  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("Could not parse job posting. Paste the description manually.");
  }

  if (!parsed.company?.trim() || !parsed.jobTitle?.trim() || !parsed.jobDescription?.trim()) {
    throw new Error(
      "Could not extract all required fields. Paste the job description manually."
    );
  }

  return {
    company: parsed.company.trim(),
    jobTitle: parsed.jobTitle.trim(),
    jobDescription: parsed.jobDescription.trim(),
  };
}
