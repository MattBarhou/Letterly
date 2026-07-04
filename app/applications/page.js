import ApplicationsList from "@/components/ApplicationsList";
import Navbar from "@/components/Navbar";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Your Applications — Letterly",
  description:
    "View saved application materials, track your job search pipeline, and manage your tech job applications in one place.",
  path: "/applications",
});

export default function ApplicationsPage() {
  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />

      <main className="py-16 px-4 lg:px-8 max-w-6xl mx-auto">
        <div className="mb-10">
          <p className="text-primary font-semibold text-sm uppercase tracking-wide mb-2">
            Application hub
          </p>
          <h1 className="text-3xl font-bold mb-2">Your applications</h1>
          <p className="text-base-content/80 max-w-2xl">
            Every generation is saved here. Track status, revisit materials, and
            generate follow-ups from one place.
          </p>
        </div>

        <ApplicationsList />
      </main>
    </div>
  );
}
