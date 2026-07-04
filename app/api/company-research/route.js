import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { NextResponse } from "next/server";
import { getCachedCompanyResearch } from "@/lib/companyCache";
import { getCompanyResearch } from "@/lib/companyResearch";
import { checkGenerateRateLimit, getRateLimitErrorMessage } from "@/lib/rateLimit";

export async function POST(request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Sign in to prefetch company research." },
      { status: 401 }
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

  const company = body.company?.trim();
  if (!company) {
    return NextResponse.json(
      { error: "Company name is required." },
      { status: 400 }
    );
  }

  const cached = await getCachedCompanyResearch(company);
  if (cached) {
    return NextResponse.json({ status: "cached", company: cached.company });
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const research = await getCompanyResearch(openai, company);

    return NextResponse.json({ status: "ready", company: research.company });
  } catch (error) {
    console.error("Company research prefetch error:", error);
    return NextResponse.json(
      { error: "Could not prefetch company research." },
      { status: 502 }
    );
  }
}
