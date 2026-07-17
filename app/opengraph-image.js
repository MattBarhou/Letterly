import { ImageResponse } from "next/og";
import { DEFAULT_DESCRIPTION, SITE_NAME } from "@/lib/seo";

export const alt = `${SITE_NAME} — Upload a resume, paste a job, get 5 tailored application documents`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px",
          background: "linear-gradient(135deg, #eef2ff 0%, #ffffff 45%, #f0fdf4 100%)",
          color: "#111827",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
            fontSize: 28,
            fontWeight: 700,
            color: "#4f46e5",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "#4f46e5",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
            }}
          >
            ✉
          </div>
          {SITE_NAME}
        </div>
        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            maxWidth: 960,
            marginBottom: 24,
          }}
        >
          Upload one resume. Get 5 tailored application documents.
        </div>
        <div
          style={{
            fontSize: 26,
            lineHeight: 1.4,
            color: "#4b5563",
            maxWidth: 900,
          }}
        >
          {DEFAULT_DESCRIPTION}
        </div>
      </div>
    ),
    { ...size }
  );
}
