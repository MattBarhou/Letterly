import Navbar from "@/components/Navbar";
import PricingCards from "@/components/PricingCards";

export const metadata = {
  title: "Pricing — Letterly",
  description:
    "Simple pricing for AI-generated cover letters and application materials.",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />

      <section className="py-20 px-4 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-primary font-semibold text-sm uppercase tracking-wide mb-2">
            Pricing
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            Simple plans for every job search
          </h1>
          <p className="text-base-content/80 max-w-xl mx-auto">
            Start with 3 free generations. Upgrade when you&apos;re applying in
            earnest — cancel anytime.
          </p>
        </div>

        <PricingCards />
      </section>
    </div>
  );
}
