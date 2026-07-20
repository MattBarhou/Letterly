/**
 * One-shot script: generate homepage hero sample docs via OpenAI, then cache to disk.
 *
 * Usage: npm run generate:hero
 * Requires OPENAI_API_KEY in .env.local (or the environment).
 *
 * Matches production generate settings: gpt-4o-mini + application prompt shape.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import OpenAI from "openai";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const inputPath = join(root, "lib", "heroSample.input.json");
const outPath = join(root, "lib", "heroSample.generated.json");

const OUTPUT_FIELDS = [
  "coverLetterBasic",
  "coverLetterDetailed",
  "recruiterEmail",
  "linkedinMessage",
  "atsVersion",
];

function loadEnvLocal() {
  try {
    const raw = readFileSync(join(root, ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // .env.local optional if env already set
  }
}

function getCoverLetterFormatInstructions(company) {
  const companyLine = company?.trim() ? company.trim() : "[Company Name]";
  const companyRule = company?.trim()
    ? `- Use the actual company name "${company.trim()}" in the recipient address block (not a placeholder).`
    : `- Company name is unknown — use the bracket placeholder [Company Name] in the recipient address block and anywhere else the company would appear.`;

  return `Cover letter format (REQUIRED for coverLetterBasic and coverLetterDetailed):
Use a standard business letter layout. Include blank lines between sections exactly like this template:

[Your Full Name]
[Your Street Address]
[City, State, Zip Code]
[Your Phone Number]
[Your Email Address]

[Date]

[Hiring Manager Name]
[Recipient Job Title]
${companyLine}
[City, State]

Dear [Hiring Manager Name or Hiring Team],

[Opening, body, and closing paragraphs here — tailored to the role]

Sincerely,
[Your Full Name]

Cover letter rules:
- Always include the full header block above before the salutation.
- Use bracket placeholders for sender contact info, date, hiring manager name, recipient job title, and city/state — the candidate will replace these manually.
${companyRule}
- Do not skip the header or sign-off.`;
}

function buildApplicationPrompt({
  resume,
  jobDescription,
  company,
  jobTitle,
  yearsExperience,
  tone,
  companyResearch,
}) {
  const researchSection = companyResearch
    ? `

${companyResearch}
`
    : "";

  const companyLabel = company?.trim() || "[Company Name]";
  const jobTitleLabel = jobTitle?.trim() || "this role";

  return `You are a career assistant helping candidates write tailored job application materials.

Generate content based on the candidate's resume and the job posting below.

Writing guidelines:
- Sound natural and human. Avoid robotic or overly formal phrasing.
- Be specific to ${companyLabel} and the ${jobTitleLabel} role. Reference details from the job description.
- If the company is shown as [Company Name], keep using that placeholder — do not invent a company name.
- Use only skills, projects, education, and experience found in the resume.
- Do NOT invent experience, employers, degrees, or achievements.
- Do NOT include fake metrics or made-up numbers (e.g. "increased performance by 40%").
- Write for someone with ${yearsExperience} year(s) of professional experience.
- Use a "${tone}" tone:
  - Professional: polished and confident, suitable for most companies
  - Big Tech: concise, impact-focused, structured like FAANG applications
  - Startup: energetic, scrappy, shows willingness to wear many hats
  - Internship: eager, humble, emphasizes learning and potential
- Keep language accessible and role-appropriate.

Output requirements:
- Return valid JSON only. No markdown, no code fences, no extra text.
- Use exactly this JSON structure:

{
  "coverLetterBasic": "",
  "coverLetterDetailed": "",
  "recruiterEmail": "",
  "linkedinMessage": "",
  "atsVersion": ""
}

Field details:
- coverLetterBasic: A concise cover letter suitable for application portals. Keep it focused and direct — roughly 3–4 short body paragraphs after the header.
- coverLetterDetailed: A longer cover letter with more depth and context than the basic version. Expand on relevant resume experience while staying factual.
- recruiterEmail: A short, professional email to a recruiter (subject line not required).
- linkedinMessage: A LinkedIn connection request or outreach message (under 300 characters).
- atsVersion: An ATS-friendly paragraph highlighting relevant keywords and skills from the job description, written in plain text without special formatting.

${getCoverLetterFormatInstructions(company)}

Company: ${companyLabel}
Job Title: ${jobTitleLabel}
Years of Experience: ${yearsExperience}
Tone: ${tone}
${researchSection}
Resume:
${resume}

Job Description:
${jobDescription}`;
}

async function callOpenAI(openai, messages) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI returned an empty response. Please try again.");
  }
  return content;
}

function parseGeneratedContent(content) {
  const parsed = JSON.parse(content);
  for (const field of OUTPUT_FIELDS) {
    if (!parsed[field] || typeof parsed[field] !== "string") {
      throw new Error(`OpenAI response is missing "${field}".`);
    }
  }
  return {
    coverLetterBasic: parsed.coverLetterBasic,
    coverLetterDetailed: parsed.coverLetterDetailed,
    recruiterEmail: parsed.recruiterEmail,
    linkedinMessage: parsed.linkedinMessage,
    atsVersion: parsed.atsVersion,
  };
}

async function main() {
  loadEnvLocal();

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing. Add it to .env.local.");
  }

  const input = JSON.parse(readFileSync(inputPath, "utf8"));
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  console.log("Generating hero sample via OpenAI (gpt-4o-mini)…");

  const content = await callOpenAI(openai, [
    {
      role: "system",
      content:
        "You are a helpful career assistant for job applicants. Always respond with valid JSON only. Cover letters must use standard business letter format with bracket placeholders in the header.",
    },
    {
      role: "user",
      content: buildApplicationPrompt({
        resume: input.resume,
        jobDescription: input.jobDescription,
        company: input.company,
        jobTitle: input.role,
        yearsExperience: "0",
        tone: "Internship",
        companyResearch: "",
      }),
    },
  ]);

  const outputs = parseGeneratedContent(content);

  const payload = {
    generatedAt: new Date().toISOString(),
    model: "gpt-4o-mini",
    company: input.company,
    jobTitle: input.role,
    outputs,
  };

  writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`Wrote cached sample to ${outPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
