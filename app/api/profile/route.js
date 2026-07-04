import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getUserProfile, mapProfileToClient } from "@/lib/applications";
import { isSupabaseConfigured } from "@/lib/supabase";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Sign in to view your profile." },
      { status: 401 }
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ profile: null });
  }

  try {
    const profile = await getUserProfile(userId);
    return NextResponse.json({ profile: mapProfileToClient(profile) });
  } catch (error) {
    console.error("GET /api/profile error:", error);
    return NextResponse.json(
      { error: "Failed to load profile." },
      { status: 500 }
    );
  }
}
