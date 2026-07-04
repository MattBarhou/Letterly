import ApplicationDetail from "@/components/ApplicationDetail";
import Navbar from "@/components/Navbar";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Application Details — Letterly",
  description: "View saved cover letters, emails, and application materials.",
  path: "/applications",
  noIndex: true,
});

export default async function ApplicationDetailPage({ params }) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />

      <main className="py-16 px-4 lg:px-8 max-w-4xl mx-auto">
        <ApplicationDetail applicationId={id} />
      </main>
    </div>
  );
}
