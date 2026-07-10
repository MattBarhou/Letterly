export function buildResumeOptimizerPrompt({ resume }) {
  return `You are a resume coach helping early-career software engineers improve their resume Projects section.

Analyze the resume below and rewrite ONLY the Projects section bullet points. Do not modify Experience, Education, Skills, or other sections.

Target audience: interns, new grads, and junior developers applying for tech roles.

Optimization rules:
- Preserve factual content from the original resume (project names, technologies, scope, team context)
- Do NOT invent employers, degrees, project names, or technologies not in the resume
- Do NOT invent metrics or fake numbers (e.g. "increased performance by 40%")
- Instead, add bracket placeholders where metrics would strengthen the bullet: [X%], [N users], [X ms], [N requests/day], [$X saved], [N commits], etc.
- Improve sentence structure using: Action verb → What you built → How/tech stack → Impact (with metric placeholder when relevant)
- Use strong action verbs: Developed, Architected, Implemented, Optimized, Deployed, Led, Built
- Keep bullets concise (1–2 lines each) and scannable
- Match the number of optimized bullets to the original bullets for each project when possible

If no Projects section is found (or it has no bullet points), set sectionsFound.projects to false, return an empty projects array, and explain in summary what sections you did find.

Return valid JSON only. No markdown, no code fences, no extra text.

Use exactly this JSON structure:

{
  "summary": "",
  "recommendations": ["", ""],
  "projects": [
    {
      "name": "",
      "originalBullets": ["", ""],
      "optimizedBullets": [
        {
          "text": "",
          "rationale": ""
        }
      ]
    }
  ],
  "sectionsFound": {
    "projects": true,
    "experience": false
  }
}

Field details:
- summary: 2–3 sentences on overall Projects section quality and what to improve
- recommendations: 3–5 actionable tips (e.g. add metrics, stronger verbs, clarify impact)
- projects: one entry per project in the Projects section
- name: project title as it appears on the resume
- originalBullets: exact or lightly normalized bullets from the original resume
- optimizedBullets: improved versions with metric placeholders where appropriate
- rationale: brief note on what changed (1 short sentence)
- sectionsFound: whether Projects and Experience sections were detected

Resume:
${resume}`;
}

export function parseResumeOptimizerResponse(content) {
  let parsed;

  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("OpenAI returned invalid JSON. Please try again.");
  }

  if (!parsed.summary || typeof parsed.summary !== "string") {
    throw new Error('OpenAI response is missing "summary". Please try again.');
  }

  if (!Array.isArray(parsed.recommendations)) {
    throw new Error(
      'OpenAI response is missing "recommendations". Please try again.'
    );
  }

  if (!Array.isArray(parsed.projects)) {
    throw new Error('OpenAI response is missing "projects". Please try again.');
  }

  const projects = parsed.projects.map((project, index) => {
    if (!project.name || typeof project.name !== "string") {
      throw new Error(
        `OpenAI response project ${index + 1} is missing "name". Please try again.`
      );
    }

    if (!Array.isArray(project.originalBullets)) {
      throw new Error(
        `OpenAI response project "${project.name}" is missing "originalBullets". Please try again.`
      );
    }

    if (!Array.isArray(project.optimizedBullets)) {
      throw new Error(
        `OpenAI response project "${project.name}" is missing "optimizedBullets". Please try again.`
      );
    }

    const optimizedBullets = project.optimizedBullets.map((bullet, bulletIndex) => {
      if (!bullet.text || typeof bullet.text !== "string") {
        throw new Error(
          `OpenAI response bullet ${bulletIndex + 1} in "${project.name}" is missing "text". Please try again.`
        );
      }

      return {
        text: bullet.text,
        rationale: typeof bullet.rationale === "string" ? bullet.rationale : "",
      };
    });

    return {
      name: project.name,
      originalBullets: project.originalBullets.filter(
        (b) => typeof b === "string" && b.trim()
      ),
      optimizedBullets,
    };
  });

  const sectionsFound = parsed.sectionsFound || {};

  return {
    summary: parsed.summary,
    recommendations: parsed.recommendations.filter(
      (r) => typeof r === "string" && r.trim()
    ),
    projects,
    sectionsFound: {
      projects: sectionsFound.projects === true,
      experience: sectionsFound.experience === true,
    },
  };
}
