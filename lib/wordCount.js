export function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export const COVER_LETTER_250_RANGE = { min: 245, max: 255, target: 250 };
export const COVER_LETTER_400_RANGE = { min: 395, max: 405, target: 400 };

export function isWithinRange(wordCount, range) {
  return wordCount >= range.min && wordCount <= range.max;
}

export function getCoverLetterWordCountIssues(result) {
  const issues = [];

  const words250 = countWords(result.coverLetter250);
  if (!isWithinRange(words250, COVER_LETTER_250_RANGE)) {
    issues.push({
      field: "coverLetter250",
      current: words250,
      range: COVER_LETTER_250_RANGE,
    });
  }

  const words400 = countWords(result.coverLetter400);
  if (!isWithinRange(words400, COVER_LETTER_400_RANGE)) {
    issues.push({
      field: "coverLetter400",
      current: words400,
      range: COVER_LETTER_400_RANGE,
    });
  }

  return issues;
}

export function buildWordCountRevisionPrompt(result, issues) {
  const issueLines = issues
    .map(
      (issue) =>
        `- ${issue.field}: currently ${issue.current} words, must be ${issue.range.min}-${issue.range.max} words (target ${issue.range.target})`
    )
    .join("\n");

  return `The cover letters below have incorrect word counts. Rewrite ONLY the fields that need fixing.

Word count rules:
- Count words by splitting on whitespace (same as Microsoft Word).
- coverLetter250 MUST be ${COVER_LETTER_250_RANGE.min}-${COVER_LETTER_250_RANGE.max} words.
- coverLetter400 MUST be ${COVER_LETTER_400_RANGE.min}-${COVER_LETTER_400_RANGE.max} words.
- Count the full letter including the business header, salutation, body, and sign-off.
- Preserve the business letter header format with bracket placeholders (sender info, date, recipient info, company name, salutation, and "Sincerely, [Your Full Name]").
- Do not change meaning, facts, or tone — only adjust length to hit the word count.
- If too short, add relevant detail from the resume in the body paragraphs. If too long, trim filler — never invent experience.

Issues to fix:
${issueLines}

Return valid JSON only with these keys (include both even if only one needs changes):
{
  "coverLetter250": "",
  "coverLetter400": ""
}

Current coverLetter250 (${countWords(result.coverLetter250)} words):
${result.coverLetter250}

Current coverLetter400 (${countWords(result.coverLetter400)} words):
${result.coverLetter400}`;
}
