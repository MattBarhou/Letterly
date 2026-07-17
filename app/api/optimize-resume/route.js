import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { NextResponse } from "next/server";
import { getUserProfile, upsertUserProfile } from "@/lib/applications";
import { callOpenAI } from "@/lib/openai";
import {
  buildResumeOptimizerPrompt,
  parseResumeOptimizerResponse,
} from "@/lib/prompts/resumeOptimizer";
import { checkGenerateRateLimit, getRateLimitErrorMessage } from "@/lib/rateLimit";
import {
  canGenerate,
  getUsageLimitMessage,
  incrementUsage,
} from "@/lib/usage";
import { isSupabaseConfigured } from "@/lib/supabase";

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
        { error: "Sign in to optimize your resume." },
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

    const resume = body.resume;
    if (!resume || typeof resume !== "string" || !resume.trim()) {
      return NextResponse.json(
        { error: "Missing required field: resume" },
        { status: 400 }
      );
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const content = await callOpenAI(openai, [
      {
        role: "system",
        content:
          "You are a resume coach for job seekers in any industry. Always respond with valid JSON only. Never invent metrics — use bracket placeholders like [X%], [N users], [N patients], or [N students] instead.",
      },
      {
        role: "user",
        content: buildResumeOptimizerPrompt({ resume: resume.trim() }),
      },
    ]);

    const result = parseResumeOptimizerResponse(content);

    await incrementUsage(userId);

    if (isSupabaseConfigured()) {
      try {
        const existing = await getUserProfile(userId);
        await upsertUserProfile(userId, {
          resumeText: resume.trim(),
          defaultTone: existing?.default_tone || "Professional",
          defaultYearsExperience: existing?.default_years_experience || "0",
        });
      } catch (saveError) {
        console.error("Failed to save resume to profile:", saveError);
      }
    }

    const updatedUsage = await canGenerate(userId);

    return NextResponse.json({
      ...result,
      usage: updatedUsage,
    });
  } catch (error) {
    console.error("Optimize resume API error:", error);

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
