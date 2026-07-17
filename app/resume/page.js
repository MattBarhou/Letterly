import Navbar from "@/components/Navbar";
import ResumeOptimizer from "@/components/ResumeOptimizer";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Resume Optimizer — Letterly",
  description:
    "Improve your resume project bullet points with AI. Get stronger action verbs, metric placeholders, and actionable recommendations for any career.",
  path: "/resume",
});

export default function ResumePage() {
  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />

      <main className="py-16 px-4 lg:px-8 max-w-6xl mx-auto">
        <div className="mb-10">
          <p className="text-primary font-semibold text-sm uppercase tracking-wide mb-2">
            Resume optimizer
          </p>
          <h1 className="text-3xl font-bold mb-2">Improve your Projects section</h1>
          <p className="text-base-content/80 max-w-2xl">
            Upload your resume or paste the text, and get optimized project
            bullet points with metric placeholders and stronger structure.
          </p>
        </div>

        <ResumeOptimizer />
      </main>
    </div>
  );
}
