import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { buildApplicationZip } from "@/lib/exportZip";
import { canExportZip, getExportLimitMessage, incrementExportUsage } from "@/lib/usage";

const OUTPUT_FIELDS = [
  "coverLetterBasic",
  "coverLetterDetailed",
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

  const exportCheck = await canExportZip(userId);
  if (!exportCheck.allowed) {
    return NextResponse.json(
      { error: getExportLimitMessage(exportCheck) },
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

    await incrementExportUsage(userId);

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
