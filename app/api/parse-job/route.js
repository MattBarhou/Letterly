import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { NextResponse } from "next/server";
import { canImportJobUrl } from "@/lib/features";
import { callOpenAI } from "@/lib/openai";
import {
  buildJobParsePrompt,
  fetchJobPageText,
  isAllowedJobUrl,
  parseJobExtraction,
} from "@/lib/parseJob";
import { checkGenerateRateLimit, getRateLimitErrorMessage } from "@/lib/rateLimit";

export async function POST(request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Sign in to import job postings." },
      { status: 401 }
    );
  }

  const allowed = await canImportJobUrl(userId);
  if (!allowed) {
    return NextResponse.json(
      { error: "Job URL import is available on Starter and Premium plans." },
      { status: 403 }
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

  const url = body.url?.trim();
  if (!url) {
    return NextResponse.json({ error: "Job URL is required." }, { status: 400 });
  }

  if (!isAllowedJobUrl(url)) {
    return NextResponse.json(
      {
        error:
          "Unsupported job board URL. Try LinkedIn, Lever, Greenhouse, Indeed, or paste the description manually.",
      },
      { status: 400 }
    );
  }

  try {
    const pageText = await fetchJobPageText(url);
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const content = await callOpenAI(openai, [
      {
        role: "system",
        content:
          "You extract structured job posting data for job applicants. Always respond with valid JSON only.",
      },
      {
        role: "user",
        content: buildJobParsePrompt(pageText),
      },
    ]);

    const result = parseJobExtraction(content);

    return NextResponse.json(result);
  } catch (error) {
    console.error("parse-job error:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }

    return NextResponse.json(
      { error: "Could not import job posting. Paste the description manually." },
      { status: 502 }
    );
  }
}
