import generated from "./heroSample.generated.json";
import input from "./heroSample.input.json";

export const HERO_SAMPLE_ROLE = input.role;
export const HERO_SAMPLE_COMPANY = input.company;
export const HERO_RESUME_SNIPPET = input.resumeSnippet;

/** Cached OpenAI outputs from `npm run generate:hero` (not called at runtime). */
export const HERO_SAMPLE_OUTPUTS = generated.outputs;

export const HERO_SAMPLE_META = {
  company: generated.company || input.company,
  jobTitle: generated.jobTitle || input.role,
  generatedAt: generated.generatedAt,
  model: generated.model,
};
