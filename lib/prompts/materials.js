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
- Subject line should be clear and professional
- Body should be ready to send with bracket placeholders only for [Your Full Name] if needed

Resume:
${resume}

Job description:
${jobDescription}`;
}

export function buildThankYouPrompt({ company, jobTitle, jobDescription, resume }) {
  return `Write a post-interview thank-you email for a software engineering job applicant.

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

  return `Create interview preparation materials for an early-career software engineering candidate interviewing for ${jobTitle} at ${company}.

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
- behavioralQuestions: 6-8 likely behavioral questions for this role
- technicalTopics: 5-7 technical topics to review based on the job description
- starOutlines: 4 STAR-method answer outlines tied to real resume experience only — do NOT invent experience, employers, or metrics
- questionsToAsk: 5 thoughtful questions the candidate can ask the interviewer
- Tailor everything to the company and role
- Use accessible language for interns and new grads
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

  return {
    behavioralQuestions: parsed.behavioralQuestions,
    technicalTopics: parsed.technicalTopics,
    starOutlines: parsed.starOutlines,
    questionsToAsk: parsed.questionsToAsk,
  };
}
