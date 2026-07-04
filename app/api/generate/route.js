import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { NextResponse } from "next/server";
import {
  formatCompanyResearchForPrompt,
  getCompanyResearch,
} from "@/lib/companyResearch";
import { callOpenAI } from "@/lib/openai";
import { buildApplicationPrompt } from "@/lib/prompts";
import { checkGenerateRateLimit, getRateLimitErrorMessage } from "@/lib/rateLimit";
import {
  canGenerate,
  getUsageLimitMessage,
  incrementUsage,
} from "@/lib/usage";

const REQUIRED_FIELDS = [
  "resume",
  "jobDescription",
  "company",
  "jobTitle",
  "yearsExperience",
  "tone",
];

const OUTPUT_FIELDS = [
  "coverLetterBasic",
  "coverLetterDetailed",
  "recruiterEmail",
  "linkedinMessage",
  "atsVersion",
];

function validateInput(body) {
  const missing = [];

  for (const field of REQUIRED_FIELDS) {
    const value = body[field];
    if (value === undefined || value === null || String(value).trim() === "") {
      missing.push(field);
    }
  }

  if (missing.length > 0) {
    return `Missing required fields: ${missing.join(", ")}`;
  }

  return null;
}

function parseGeneratedContent(content) {
  let parsed;

  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("OpenAI returned invalid JSON. Please try again.");
  }

  for (const field of OUTPUT_FIELDS) {
    if (!parsed[field] || typeof parsed[field] !== "string") {
      throw new Error(`OpenAI response is missing "${field}". Please try again.`);
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

function getOpenAIErrorMessage(error) {
  if (error.status === 429) {
    return "Your OpenAI account has no remaining quota. Add billing or credits at platform.openai.com/account/billing, then try again.";
  }
  if (error.status === 401) {
    return "Invalid OpenAI API key. Check OPENAI_API_KEY in .env.local and restart the dev server.";
  }
  if (error.status === 403) {
    return "OpenAI access denied for this API key. Verify the key is active and has permission to use the API.";
  }
  return error.message || "OpenAI request failed. Please try again later.";
}

export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Sign in to generate application materials." },
        { status: 401 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Server is missing OPENAI_API_KEY. Add it to .env.local." },
        { status: 500 }
      );
    }

    const usageCheck = await canGenerate(userId);
    if (!usageCheck.allowed) {
      return NextResponse.json(
        {
          error: getUsageLimitMessage(usageCheck),
          code: "USAGE_LIMIT",
          usage: usageCheck,
        },
        { status: 402 }
      );
    }

    const rateLimit = await checkGenerateRateLimit(request);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: getRateLimitErrorMessage(rateLimit.reset) },
        { status: 429 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body." },
        { status: 400 }
      );
    }

    const validationError = validateInput(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const { resume, jobDescription, company, jobTitle, yearsExperience, tone } =
      body;

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const research = await getCompanyResearch(openai, company);
    const companyResearch = formatCompanyResearchForPrompt(research);

    const content = await callOpenAI(openai, [
      {
        role: "system",
        content:
          "You are a helpful career assistant for early-career software engineers. Always respond with valid JSON only. Cover letters must use standard business letter format with bracket placeholders in the header.",
      },
      {
        role: "user",
        content: buildApplicationPrompt({
          resume,
          jobDescription,
          company,
          jobTitle,
          yearsExperience,
          tone,
          companyResearch,
        }),
      },
    ]);

    const result = parseGeneratedContent(content);

    await incrementUsage(userId);

    const updatedUsage = await canGenerate(userId);

    return NextResponse.json({
      ...result,
      usage: updatedUsage,
    });
  } catch (error) {
    console.error("Generate API error:", error);

    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: getOpenAIErrorMessage(error) },
        { status: error.status || 502 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
