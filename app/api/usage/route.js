import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getUsageInfo } from "@/lib/usage";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Sign in to view usage." },
      { status: 401 }
    );
  }

  const usage = await getUsageInfo(userId);
  return NextResponse.json(usage);
}
