import ApplicationForm from "@/components/ApplicationForm";
import JsonLd from "@/components/JsonLd";
import LetterlyLogo from "@/components/LetterlyLogo";
import Navbar from "@/components/Navbar";
import {
  HOME_FAQS,
  createFaqJsonLd,
  createOrganizationJsonLd,
  createPageMetadata,
  createWebApplicationJsonLd,
} from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "AI Job Application Documents in Under a Minute",
  description:
    "Upload your resume, paste a job posting, and get five tailored application documents instantly — cover letters, recruiter email, LinkedIn outreach, and ATS text. Free to start. No credit card required.",
  path: "/",
});

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Upload your resume",
    desc: "Drop in a PDF or paste your experience once. Letterly uses only what you provide — never invents skills.",
  },
  {
    step: "2",
    title: "Paste the job posting",
    desc: "Company and role are detected automatically. Override them in Advanced options if you want.",
  },
  {
    step: "3",
    title: "Get 5 tailored documents",
    desc: "Concise and detailed cover letters, recruiter email, LinkedIn message, and ATS text — ready to copy, export, and send.",
  },
];

function HeroDemoVideo() {
  return (
    <div className="relative w-full max-w-5xl mx-auto">
      <div className="absolute -inset-3 sm:-inset-5 bg-primary/10 blur-3xl rounded-full pointer-events-none" />
      <figure className="relative rounded-2xl border border-base-300 shadow-xl shadow-primary/10 overflow-hidden ring-1 ring-base-content/5">
        <video
          className="block w-full h-auto"
          src="/hero_demo.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label="Product demo: upload a resume, paste a job posting, and generate five tailored application documents"
        >
          Your browser does not support the video tag.
        </video>
      </figure>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <JsonLd data={createOrganizationJsonLd()} />
      <JsonLd data={createWebApplicationJsonLd()} />
      <JsonLd data={createFaqJsonLd(HOME_FAQS)} />

      <div className="min-h-screen bg-base-200">
        <Navbar />

        <main>
          <section
            aria-labelledby="hero-heading"
            className="relative overflow-hidden bg-linear-to-br from-primary/5 via-base-100 to-secondary/10 py-16 lg:py-24"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
            <div className="relative max-w-6xl px-4 lg:px-8 mx-auto">
              <div className="text-center max-w-3xl mx-auto">
                <div className="badge badge-primary badge-outline mb-6 font-medium">
                  AI that tailors every application
                </div>
                <h1
                  id="hero-heading"
                  className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold tracking-tight leading-[1.1]"
                >
                  One resume.{" "}
                  <span className="text-primary">
                    Five tailored application documents.
                  </span>
                </h1>
                <p className="py-6 text-lg text-base-content/70 max-w-xl mx-auto leading-relaxed">
                  Paste any job posting and get a tailored cover letter,
                  recruiter email, LinkedIn message and ATS-ready resume text in
                  seconds.
                </p>
                <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center">
                  <a
                    href="/sign-up"
                    className="btn btn-primary btn-lg shadow-lg shadow-primary/20"
                  >
                    Start Free — Get 3 Application Packages
                  </a>
                  <a href="#how-it-works" className="btn btn-ghost btn-lg">
                    See how it works →
                  </a>
                </div>
                <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mt-6 text-sm text-base-content/55">
                  <span className="flex items-center gap-1.5">
                    <span className="text-success font-bold" aria-hidden="true">
                      ✓
                    </span>
                    Free to start
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="text-success font-bold" aria-hidden="true">
                      ✓
                    </span>
                    No credit card required
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="text-success font-bold" aria-hidden="true">
                      ✓
                    </span>
                    3 free generations
                  </span>
                </div>
              </div>

              <div className="mt-12 lg:mt-14">
                <HeroDemoVideo />
              </div>
            </div>
          </section>

          <section
            id="how-it-works"
            aria-labelledby="how-it-works-heading"
            className="py-20 px-4 lg:px-8 bg-base-100 border-y border-base-300"
          >
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <p className="text-primary font-semibold text-sm uppercase tracking-wide mb-2">
                  How it works
                </p>
                <h2 id="how-it-works-heading" className="text-3xl font-bold mb-3">
                  Resume + job posting → ready-to-send documents
                </h2>
                <p className="text-base-content/70 max-w-xl mx-auto">
                  Two inputs. Five outputs. Spend minutes on each application
                  instead of hours.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {HOW_IT_WORKS.map((item, index) => (
                  <article
                    key={item.step}
                    className="card bg-base-200/50 shadow-sm border border-base-300 relative"
                  >
                    {index < HOW_IT_WORKS.length - 1 && (
                      <span
                        className="hidden sm:block absolute top-1/2 -right-3 z-10 text-base-content/25 text-xl font-light"
                        aria-hidden="true"
                      >
                        →
                      </span>
                    )}
                    <div className="card-body items-center text-center">
                      <div className="badge badge-primary badge-lg font-bold mb-2">
                        {item.step}
                      </div>
                      <h3 className="card-title text-lg justify-center">
                        {item.title}
                      </h3>
                      <p className="text-sm text-base-content/70">{item.desc}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <div className="px-4 lg:px-8 py-8 bg-base-100 border-b border-base-300">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center gap-2 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 text-base-content/45"
                  aria-hidden="true"
                >
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <h2 className="text-sm font-semibold tracking-wide text-base-content/80">
                  Your resume stays private
                </h2>
              </div>
              <div className="flex flex-col sm:flex-row sm:flex-wrap sm:justify-center gap-3 sm:gap-x-8 text-sm text-base-content/65">
                <p className="flex items-center justify-center gap-2">
                  <span className="text-success font-bold" aria-hidden="true">
                    ✓
                  </span>
                  Never sold or shared
                </p>
                <p className="flex items-center justify-center gap-2">
                  <span className="text-success font-bold" aria-hidden="true">
                    ✓
                  </span>
                  Used only to generate documents
                </p>
                <p className="flex items-center justify-center gap-2">
                  <span className="text-success font-bold" aria-hidden="true">
                    ✓
                  </span>
                  Encrypted in transit and processed securely
                </p>
              </div>
            </div>
          </div>

          <ApplicationForm />

          <section
            id="faq"
            aria-labelledby="faq-heading"
            className="py-20 px-4 lg:px-8 max-w-3xl mx-auto"
          >
            <div className="text-center mb-12">
              <p className="text-primary font-semibold text-sm uppercase tracking-wide mb-2">
                FAQ
              </p>
              <h2 id="faq-heading" className="text-3xl font-bold mb-3">
                Frequently asked questions
              </h2>
              <p className="text-base-content/70">
                Quick answers before you generate your first application.
              </p>
            </div>
            <div className="space-y-4">
              {HOME_FAQS.map((faq) => (
                <details
                  key={faq.question}
                  className="group border border-base-300 rounded-2xl bg-base-100 open:shadow-sm"
                >
                  <summary className="cursor-pointer list-none px-5 sm:px-6 py-4 font-medium text-base-content flex items-center justify-between gap-4">
                    <span>{faq.question}</span>
                    <span
                      className="text-base-content/40 group-open:rotate-45 transition-transform"
                      aria-hidden="true"
                    >
                      +
                    </span>
                  </summary>
                  <div className="px-5 sm:px-6 pb-5 text-sm text-base-content/70 leading-relaxed border-t border-base-300 pt-4">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </section>
        </main>

        <footer className="footer footer-center p-10 bg-base-200 text-base-content/50 border-t border-base-300">
          <div className="flex flex-col items-center gap-2">
            <p className="font-bold text-base-content/70 text-lg flex items-center gap-2">
              <LetterlyLogo />
              Letterly
            </p>
            <p className="text-sm max-w-md">
              Upload a resume, paste a job posting, and get five tailored
              application documents — for internships, new grads, and
              professional roles.
            </p>
            <nav aria-label="Footer navigation" className="flex gap-4 mt-2 text-sm">
              <a href="#how-it-works" className="link link-hover">
                How it works
              </a>
              <a href="#faq" className="link link-hover">
                FAQ
              </a>
              <a href="/pricing" className="link link-hover">
                Pricing
              </a>
              <a href="#generate" className="link link-hover">
                Generate
              </a>
            </nav>
          </div>
        </footer>
      </div>
    </>
  );
}
