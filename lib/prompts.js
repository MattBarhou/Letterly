export function getCoverLetterFormatInstructions(company) {
  return `Cover letter format (REQUIRED for coverLetter250 and coverLetter400):
Use a standard business letter layout. Include blank lines between sections exactly like this template:

[Your Full Name]
[Your Street Address]
[City, State, Zip Code]
[Your Phone Number]
[Your Email Address]

[Date]

[Hiring Manager Name]
[Recipient Job Title]
${company}
[City, State]

Dear [Hiring Manager Name or Hiring Team],

[Opening, body, and closing paragraphs here — tailored to the role]

Sincerely,
[Your Full Name]

Cover letter rules:
- Always include the full header block above before the salutation.
- Use bracket placeholders for sender contact info, date, hiring manager name, recipient job title, and city/state — the candidate will replace these manually.
- Use the actual company name "${company}" in the recipient address block (not a placeholder).
- Do not skip the header or sign-off.`;
}

export function buildApplicationPrompt({
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

  return `You are a career assistant helping software engineers apply to tech companies.

Your job is to write tailored job application materials for an early-career candidate — an intern, new grad, or junior developer.

Generate content based on the candidate's resume and the job posting below.

Writing guidelines:
- Sound natural and human. Avoid robotic or overly formal phrasing.
- Be specific to ${company} and the ${jobTitle} role. Reference details from the job description.
- Use only skills, projects, education, and experience found in the resume.
- Do NOT invent experience, employers, degrees, or achievements.
- Do NOT include fake metrics or made-up numbers (e.g. "increased performance by 40%").
- Write for someone with ${yearsExperience} year(s) of professional experience.
- Use a "${tone}" tone:
  - Professional: polished and confident, suitable for most companies
  - Big Tech: concise, impact-focused, structured like FAANG applications
  - Startup: energetic, scrappy, shows willingness to wear many hats
  - Internship: eager, humble, emphasizes learning and potential
- Mention Canada when relevant (e.g. Canadian work authorization, Toronto/Vancouver tech hubs, Canadian co-op programs).
- Keep language accessible — this is for early-career developers, not senior engineers.

Output requirements:
- Return valid JSON only. No markdown, no code fences, no extra text.
- Use exactly this JSON structure:

{
  "coverLetter250": "",
  "coverLetter400": "",
  "recruiterEmail": "",
  "linkedinMessage": "",
  "atsVersion": ""
}

Field details:
- coverLetter250: A cover letter of exactly 250 words (acceptable range: 245-255 words). Count every word in the full letter, including the header, salutation, body, and sign-off. This is a hard requirement — do not submit fewer than 245 words. Expand with resume-specific detail in the body if needed to reach the target.
- coverLetter400: A cover letter of exactly 400 words (acceptable range: 395-405 words). Count every word in the full letter, including the header, salutation, body, and sign-off. This is a hard requirement — do not submit fewer than 395 words. Include more depth than the 250-word version while staying factual.
- recruiterEmail: A short, professional email to a recruiter (subject line not required).
- linkedinMessage: A LinkedIn connection request or outreach message (under 300 characters).
- atsVersion: An ATS-friendly paragraph highlighting relevant keywords and skills from the job description, written in plain text without special formatting.

${getCoverLetterFormatInstructions(company)}

Before returning JSON, verify coverLetter250 is 245-255 words and coverLetter400 is 395-405 words. Revise if needed.

Company: ${company}
Job Title: ${jobTitle}
Years of Experience: ${yearsExperience}
Tone: ${tone}
${researchSection}
Resume:
${resume}

Job Description:
${jobDescription}`;
}
