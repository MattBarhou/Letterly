import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { buildApplicationZip } from "@/lib/exportZip";
import { getSubscription } from "@/lib/subscription";

const OUTPUT_FIELDS = [
  "coverLetter250",
  "coverLetter400",
  "recruiterEmail",
  "linkedinMessage",
  "atsVersion",
];

export async function POST(request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Sign in to export your application materials." },
      { status: 401 }
    );
  }

  const subscription = await getSubscription(userId);
  const tier =
    subscription.status === "active" ? subscription.tier : "free";

  if (tier !== "premium") {
    return NextResponse.json(
      { error: "ZIP export is available on the Premium plan." },
      { status: 403 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { company, jobTitle, outputs } = body;

  if (!company?.trim() || !jobTitle?.trim() || !outputs) {
    return NextResponse.json(
      { error: "Company, job title, and outputs are required." },
      { status: 400 }
    );
  }

  const missing = OUTPUT_FIELDS.filter((field) => !outputs[field]?.trim());
  if (missing.length > 0) {
    return NextResponse.json(
      { error: "All five application materials are required for export." },
      { status: 400 }
    );
  }

  try {
    const { zipBuffer, zipFilename } = await buildApplicationZip({
      company: company.trim(),
      jobTitle: jobTitle.trim(),
      outputs,
    });

    return new Response(zipBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${zipFilename}"`,
        "Content-Length": String(zipBuffer.length),
      },
    });
  } catch (error) {
    console.error("Export failed:", error);
    return NextResponse.json(
      { error: "Failed to create export. Please try again." },
      { status: 500 }
    );
  }
}
