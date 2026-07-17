import Navbar from "@/components/Navbar";
import PricingCards from "@/components/PricingCards";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Pricing — Cover Letter Generator Plans",
  description:
    "Simple pricing for AI job application documents. Start with 3 free generations and 3 ZIP exports — no credit card required. Then choose Starter or Premium for unlimited history, tracking, and interview prep.",
  path: "/pricing",
  keywords: [
    "cover letter generator pricing",
    "AI cover letter cost",
    "job application tools pricing",
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
              Plans for every job search
            </h1>
            <p className="text-base-content/80 max-w-xl mx-auto">
              Start with 3 free generations and 3 ZIP exports — no credit card
              required. Upgrade for unlimited history, job URL import,
              application tracking, and Premium interview prep. Cancel anytime.
            </p>
          </div>

          <PricingCards />
        </section>
      </main>
    </div>
  );
}
