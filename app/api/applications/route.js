import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  createApplication,
  listApplications,
  mapApplicationToClient,
  upsertUserProfile,
} from "@/lib/applications";
import { getUserFeatures } from "@/lib/features";
import { isSupabaseConfigured } from "@/lib/supabase";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Sign in to view your applications." },
      { status: 401 }
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Application history is not configured." },
      { status: 503 }
    );
  }

  try {
    const features = await getUserFeatures(userId);
    const rows = await listApplications(userId, {
      limit: features.historyLimit ?? undefined,
    });

    return NextResponse.json({
      applications: rows.map((row) => mapApplicationToClient(row)),
      features,
      totalShown: rows.length,
      historyLimited: features.historyLimit !== null,
    });
  } catch (error) {
    console.error("GET /api/applications error:", error);
    return NextResponse.json(
      { error: "Failed to load applications." },
      { status: 500 }
    );
  }
}
