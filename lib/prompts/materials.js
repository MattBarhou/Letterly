export function buildFollowUpPrompt({ company, jobTitle, jobDescription, resume }) {
  return `Write a professional follow-up email for a job applicant who applied about one week ago and has not heard back.

Return valid JSON only:
{
  "subject": "",
  "body": ""
}

Rules:
- Keep it brief, polite, and not pushy
- Reference the ${jobTitle} role at ${company}
- Use only experience from the resume — do not invent credentials
- Tailor tone and wording to the industry and role in the job description (tech, healthcare, education, finance, marketing, trades, etc.)
- Subject line should be clear and professional
- Body should be ready to send with bracket placeholders only for [Your Full Name] if needed

Resume:
${resume}

Job description:
${jobDescription}`;
}

export function buildThankYouPrompt({ company, jobTitle, jobDescription, resume }) {
  return `Write a post-interview thank-you email for a job applicant.

Return valid JSON only:
{
  "subject": "",
  "body": ""
}

Rules:
- Thank the interviewer/hiring team for their time
- Reference the ${jobTitle} role at ${company}
- Mention one specific topic from the job or company that aligns with the candidate's background
- Use only experience from the resume — do not invent interview details or credentials
- Match the industry and seniority implied by the posting (works for tech, healthcare, education, business, creative, and other fields)
- Keep it concise and genuine

Resume:
${resume}

Job description:
${jobDescription}`;
}

export function buildInterviewPrepPrompt({
  company,
  jobTitle,
  jobDescription,
  resume,
  companyResearch,
}) {
  const researchSection = companyResearch
    ? `\nCompany research:\n${companyResearch}\n`
    : "";

  return `Create interview preparation materials for a candidate interviewing for ${jobTitle} at ${company}.

Return valid JSON only:
{
  "behavioralQuestions": ["", ""],
  "technicalTopics": ["", ""],
  "starOutlines": [
    { "question": "", "outline": "" }
  ],
  "questionsToAsk": ["", ""]
}

Rules:
- Tailor everything to this specific company, role, and industry (tech, healthcare, education, finance, marketing, operations, creative, trades, etc.)
- behavioralQuestions: 6-8 likely behavioral questions for this role and career stage
- technicalTopics: 5-7 role-specific topics to review based on the job description. For technical roles, include domain/tech skills. For non-technical roles, include domain knowledge, tools, regulations, case topics, or job-specific competencies instead of coding topics.
- starOutlines: 4 STAR-method answer outlines tied to real resume experience only — do NOT invent experience, employers, or metrics
- questionsToAsk: 5 thoughtful questions the candidate can ask the interviewer
- Use accessible, professional language appropriate to the role — equally strong for interns, new grads, and experienced professionals
- Do not assume the candidate is a software engineer unless the job description clearly indicates that
${researchSection}
Resume:
${resume}

Job description:
${jobDescription}`;
}

export function parseEmailMaterial(content) {
  const parsed = JSON.parse(content);

  if (!parsed.subject?.trim() || !parsed.body?.trim()) {
    throw new Error("Generated email is missing subject or body.");
  }

  return {
    subject: parsed.subject.trim(),
    body: parsed.body.trim(),
  };
}

function normalizeStarOutline(outline) {
  if (typeof outline === "string") {
    return outline.trim();
  }

  if (!outline || typeof outline !== "object") {
    return "";
  }

  const starKeys = ["Situation", "Task", "Action", "Result"];
  const parts = starKeys
    .filter((key) => outline[key]?.trim?.())
    .map((key) => `${key}: ${outline[key].trim()}`);

  return parts.join("\n\n");
}

export function parseInterviewPrepMaterial(content) {
  const parsed = JSON.parse(content);

  const requiredArrays = [
    "behavioralQuestions",
    "technicalTopics",
    "starOutlines",
    "questionsToAsk",
  ];

  for (const key of requiredArrays) {
    if (!Array.isArray(parsed[key]) || parsed[key].length === 0) {
      throw new Error(`Interview prep is missing "${key}".`);
    }
  }

  const starOutlines = parsed.starOutlines.map((item) => ({
    question: String(item.question || "").trim(),
    outline: normalizeStarOutline(item.outline),
  }));

  return {
    behavioralQuestions: parsed.behavioralQuestions,
    technicalTopics: parsed.technicalTopics,
    starOutlines,
    questionsToAsk: parsed.questionsToAsk,
  };
}
