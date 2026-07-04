import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  deleteApplication,
  getApplication,
  isValidStatus,
  listApplicationMaterials,
  mapApplicationToClient,
  updateApplicationStatus,
} from "@/lib/applications";
import { canUseTracker, getUserFeatures } from "@/lib/features";
import { isSupabaseConfigured } from "@/lib/supabase";

export async function GET(_request, { params }) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Sign in to view this application." },
      { status: 401 }
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Application history is not configured." },
      { status: 503 }
    );
  }

  const { id } = await params;

  try {
    const application = await getApplication(userId, id);

    if (!application) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    const materials = await listApplicationMaterials(userId, id);
    const features = await getUserFeatures(userId);

    return NextResponse.json({
      application: mapApplicationToClient(application),
      materials,
      features,
    });
  } catch (error) {
    console.error("GET /api/applications/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to load application." },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Sign in to update this application." },
      { status: 401 }
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Application history is not configured." },
      { status: 503 }
    );
  }

  const canTrack = await canUseTracker(userId);
  if (!canTrack) {
    return NextResponse.json(
      { error: "Application tracking is available on Starter and Premium plans." },
      { status: 403 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { status } = body;
  if (!status || !isValidStatus(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const { id } = await params;

  try {
    const updated = await updateApplicationStatus(userId, id, status, body.appliedAt);

    if (!updated) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    return NextResponse.json({
      application: mapApplicationToClient(updated),
    });
  } catch (error) {
    console.error("PATCH /api/applications/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update application." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request, { params }) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Sign in to delete this application." },
      { status: 401 }
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Application history is not configured." },
      { status: 503 }
    );
  }

  const features = await getUserFeatures(userId);
  if (!features.canDeleteApplications) {
    return NextResponse.json(
      { error: "Deleting applications is available on paid plans." },
      { status: 403 }
    );
  }

  const { id } = await params;

  try {
    const existing = await getApplication(userId, id);
    if (!existing) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    await deleteApplication(userId, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/applications/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete application." },
      { status: 500 }
    );
  }
}
