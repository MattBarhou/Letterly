import Navbar from "@/components/Navbar";
import PricingCards from "@/components/PricingCards";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Pricing — Cover Letter Generator Plans",
  description:
    "Simple pricing for AI cover letter generation. Start with 3 free generations and 3 ZIP exports, then choose Starter or Premium for internships, co-ops, and new grad tech job applications.",
  path: "/pricing",
  keywords: [
    "cover letter generator pricing",
    "AI cover letter cost",
    "internship application tools",
    "Letterly pricing",
  ],
});

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />

      <main>
        <section className="py-20 px-4 lg:px-8 max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-primary font-semibold text-sm uppercase tracking-wide mb-2">
              Pricing
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">
              Cover letter generator plans for every job search
            </h1>
            <p className="text-base-content/80 max-w-xl mx-auto">
              Start with 3 free cover letter generations and 3 ZIP exports.
              Upgrade when you&apos;re applying to internships and new grad roles
              in earnest — cancel anytime.
            </p>
          </div>

          <PricingCards />
        </section>
      </main>
    </div>
  );
}
