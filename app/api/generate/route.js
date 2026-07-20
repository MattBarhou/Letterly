import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { NextResponse } from "next/server";
import {
  formatCompanyResearchForPrompt,
  getCompanyResearch,
} from "@/lib/companyResearch";
import { createApplication, upsertUserProfile } from "@/lib/applications";
import { resolveJobFields } from "@/lib/extractJobFields";
import {
  canGuestGenerate,
  consumeGuestGenerateQuota,
  toGuestPreviewOutputs,
} from "@/lib/guestGenerate";
import { callOpenAI } from "@/lib/openai";
import { buildApplicationPrompt } from "@/lib/prompts";
import { checkGenerateRateLimit, getRateLimitErrorMessage } from "@/lib/rateLimit";
import {
  canGenerate,
  getUsageLimitMessage,
  incrementUsage,
} from "@/lib/usage";
import { isSupabaseConfigured } from "@/lib/supabase";

const REQUIRED_FIELDS = ["resume", "jobDescription"];

const DEFAULT_YEARS_EXPERIENCE = "0";
const DEFAULT_TONE = "Professional";

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
    const isGuest = !userId;

    if (isGuest) {
      const guestCheck = await canGuestGenerate(request);
      if (!guestCheck.allowed) {
        const status = guestCheck.code === "GUEST_LIMIT" ? 429 : 401;
        return NextResponse.json(
          {
            error: guestCheck.error,
            code: guestCheck.code,
            signupUrl: "/sign-up?redirect_url=/pricing",
          },
          { status }
        );
      }
    } else {
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
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Server is missing OPENAI_API_KEY. Add it to .env.local." },
        { status: 500 }
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

    const resume = String(body.resume).trim();
    const jobDescription = String(body.jobDescription).trim();
    const jobUrl = typeof body.jobUrl === "string" ? body.jobUrl.trim() : "";
    const yearsExperience =
      typeof body.yearsExperience === "string" && body.yearsExperience.trim()
        ? body.yearsExperience.trim()
        : DEFAULT_YEARS_EXPERIENCE;
    const tone =
      typeof body.tone === "string" && body.tone.trim()
        ? body.tone.trim()
        : DEFAULT_TONE;

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const { company, jobTitle } = await resolveJobFields(openai, {
      company: body.company,
      jobTitle: body.jobTitle,
      jobDescription,
    });

    let companyResearch = "";
    if (company) {
      try {
        const research = await getCompanyResearch(openai, company);
        companyResearch = formatCompanyResearchForPrompt(research);
      } catch (researchError) {
        console.error("Company research failed:", researchError);
      }
    }

    const content = await callOpenAI(openai, [
      {
        role: "system",
        content:
          "You are a helpful career assistant for job applicants. Always respond with valid JSON only. Cover letters must use standard business letter format with bracket placeholders in the header.",
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

    if (isGuest) {
      await consumeGuestGenerateQuota(request);
      const preview = toGuestPreviewOutputs(result);
      return NextResponse.json({
        ...preview,
        company,
        jobTitle,
        applicationId: null,
      });
    }

    await incrementUsage(userId);

    let applicationId = null;

    if (isSupabaseConfigured()) {
      try {
        await upsertUserProfile(userId, {
          resumeText: resume,
          defaultTone: tone,
          defaultYearsExperience: yearsExperience,
        });

        const saved = await createApplication(userId, {
          company: company || "[Company Name]",
          jobTitle,
          jobDescription,
          jobUrl,
          tone,
          yearsExperience,
          outputs: result,
        });

        applicationId = saved?.id ?? null;
      } catch (saveError) {
        console.error("Failed to save application:", saveError);
      }
    }

    const updatedUsage = await canGenerate(userId);

    return NextResponse.json({
      ...result,
      guestPreview: false,
      company,
      jobTitle,
      applicationId,
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
