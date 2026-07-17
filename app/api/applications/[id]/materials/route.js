import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { NextResponse } from "next/server";
import {
  getApplication,
  getUserProfile,
  saveApplicationMaterial,
} from "@/lib/applications";
import {
  formatCompanyResearchForPrompt,
  getCompanyResearch,
} from "@/lib/companyResearch";
import { canGenerateMaterials } from "@/lib/features";
import { callOpenAI } from "@/lib/openai";
import {
  buildFollowUpPrompt,
  buildInterviewPrepPrompt,
  buildThankYouPrompt,
  parseEmailMaterial,
  parseInterviewPrepMaterial,
} from "@/lib/prompts/materials";
import { checkGenerateRateLimit, getRateLimitErrorMessage } from "@/lib/rateLimit";
import { isSupabaseConfigured } from "@/lib/supabase";

const VALID_TYPES = ["follow_up", "thank_you", "interview_prep"];

export async function POST(request, { params }) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Sign in to generate materials." },
      { status: 401 }
    );
  }

  const allowed = await canGenerateMaterials(userId);
  if (!allowed) {
    return NextResponse.json(
      { error: "Follow-ups, thank-you notes, and interview prep are Premium features." },
      { status: 403 }
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Application history is not configured." },
      { status: 503 }
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "Server is missing OPENAI_API_KEY." },
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
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { type } = body;
  if (!type || !VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: "Invalid material type." }, { status: 400 });
  }

  const { id } = await params;

  try {
    const application = await getApplication(userId, id);
    if (!application) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    const profile = await getUserProfile(userId);
    const resume = profile?.resume_text || "";

    if (!resume.trim()) {
      return NextResponse.json(
        { error: "No saved resume found. Generate application materials first." },
        { status: 400 }
      );
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    let userPrompt;
    let systemPrompt =
      "You help job applicants with follow-ups, thank-you notes, and interview prep across any industry. Always respond with valid JSON only.";

    if (type === "follow_up") {
      userPrompt = buildFollowUpPrompt({
        company: application.company,
        jobTitle: application.job_title,
        jobDescription: application.job_description,
        resume,
      });
    } else if (type === "thank_you") {
      userPrompt = buildThankYouPrompt({
        company: application.company,
        jobTitle: application.job_title,
        jobDescription: application.job_description,
        resume,
      });
    } else {
      const research = await getCompanyResearch(openai, application.company);
      const companyResearch = formatCompanyResearchForPrompt(research);
      userPrompt = buildInterviewPrepPrompt({
        company: application.company,
        jobTitle: application.job_title,
        jobDescription: application.job_description,
        resume,
        companyResearch,
      });
      systemPrompt =
        "You create interview prep for job candidates in any industry. Use only resume facts in STAR outlines. Always respond with valid JSON only.";
    }

    const content = await callOpenAI(openai, [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]);

    const parsedContent =
      type === "interview_prep"
        ? parseInterviewPrepMaterial(content)
        : parseEmailMaterial(content);

    const saved = await saveApplicationMaterial(userId, id, type, parsedContent);

    return NextResponse.json({
      type,
      content: parsedContent,
      material: saved,
    });
  } catch (error) {
    console.error("POST /api/applications/[id]/materials error:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }

    return NextResponse.json(
      { error: "Failed to generate material." },
      { status: 500 }
    );
  }
}
