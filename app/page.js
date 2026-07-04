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
  title: "AI Cover Letter Generator for Internships & Tech Jobs",
  description:
    "Generate tailored cover letters, recruiter emails, LinkedIn messages, and ATS-friendly application materials for internships, co-ops, and new grad tech roles. Free to start.",
  path: "/",
});

const OUTPUTS = [
  {
    index: "01",
    label: "Basic cover letter",
    format: "Concise",
    description: "Short cover letter for application portals and quick submissions.",
  },
  {
    index: "02",
    label: "Detailed cover letter",
    format: "Extended",
    description: "Longer cover letter when recruiters expect more context.",
  },
  {
    index: "03",
    label: "Recruiter email",
    format: "Email",
    description: "Direct outreach to hiring managers or campus recruiters.",
  },
  {
    index: "04",
    label: "LinkedIn message",
    format: "Message",
    description: "Connection request or follow-up within platform limits.",
  },
  {
    index: "05",
    label: "ATS version",
    format: "Plain text",
    description: "Keyword-aligned copy for applicant tracking systems.",
  },
];

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Upload or paste your resume",
    desc: "Drop in a PDF or paste your resume text — education, projects, skills, and experience.",
  },
  {
    step: "2",
    title: "Add the job details",
    desc: "Paste the internship or job posting, company name, and title. Pick a tone that fits the company.",
  },
  {
    step: "3",
    title: "Copy & apply",
    desc: "Review five tailored outputs, copy the ones you need, and send your application.",
  },
];

const BENEFITS = [
  {
    title: "Resume-accurate cover letters",
    desc: "Content is based on your real experience — no invented skills or fake metrics.",
  },
  {
    title: "Role-specific for each application",
    desc: "Every cover letter and email is tailored to the company and job description you provide.",
  },
  {
    title: "Built for internships & new grads",
    desc: "Written for interns, co-ops, and junior developers applying to software engineering and tech roles.",
  },
];

const USE_CASES = [
  {
    title: "Software engineering internships",
    desc: "Turn one resume into a custom cover letter for each SWE, backend, frontend, or full-stack internship posting.",
  },
  {
    title: "New grad and junior developer roles",
    desc: "Generate professional cover letters that highlight projects, coursework, and early-career experience.",
  },
  {
    title: "Campus recruiting & referrals",
    desc: "Pair a strong cover letter with a recruiter email and LinkedIn message for the same opportunity.",
  },
];

export default function Home() {
  return (
    <>
      <JsonLd data={createOrganizationJsonLd()} />
      <JsonLd data={createWebApplicationJsonLd()} />
      <JsonLd data={createFaqJsonLd(HOME_FAQS)} />

      <div className="min-h-screen bg-base-200">
        <Navbar />

        <main>
          {/* Hero */}
          <section
            aria-labelledby="hero-heading"
            className="relative overflow-hidden bg-linear-to-br from-primary/5 via-base-100 to-secondary/10 py-20 lg:py-28"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
            <div className="relative max-w-4xl px-4 mx-auto text-center">
              <div className="badge badge-primary badge-outline mb-6 font-medium">
                AI cover letter generator for interns & new grads
              </div>
              <h1
                id="hero-heading"
                className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight"
              >
                Generate cover letters for{" "}
                <span className="text-primary">internships & tech jobs</span>
              </h1>
              <p className="py-6 text-lg text-base-content/70 max-w-2xl mx-auto leading-relaxed">
                Letterly is an AI cover letter generator that creates five
                tailored application materials from your resume and a job
                posting — cover letters, recruiter emails, LinkedIn messages,
                and ATS-ready text in under a minute.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="#generate"
                  className="btn btn-primary btn-lg shadow-lg shadow-primary/20"
                >
                  Generate Cover Letters Free
                </a>
                <a href="#how-it-works" className="btn btn-ghost btn-lg">
                  See how it works →
                </a>
              </div>
              <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mt-10 text-sm text-base-content/50">
                <span className="flex items-center gap-1.5">
                  <span className="text-success font-bold" aria-hidden="true">
                    ✓
                  </span>
                  5 outputs per run
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-success font-bold" aria-hidden="true">
                    ✓
                  </span>
                  3 free generations & ZIP exports
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-success font-bold" aria-hidden="true">
                    ✓
                  </span>
                  Ready in ~30 seconds
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-success font-bold" aria-hidden="true">
                    ✓
                  </span>
                  Built for tech roles
                </span>
              </div>
            </div>
          </section>

          {/* How it works */}
          <section
            id="how-it-works"
            aria-labelledby="how-it-works-heading"
            className="py-20 px-4 lg:px-8 max-w-5xl mx-auto"
          >
            <div className="text-center mb-12">
              <p className="text-primary font-semibold text-sm uppercase tracking-wide mb-2">
                How it works
              </p>
              <h2 id="how-it-works-heading" className="text-3xl font-bold mb-3">
                Three steps to better cover letters
              </h2>
              <p className="text-base-content/70 max-w-xl mx-auto">
                Upload your resume PDF or paste your info, add an internship or
                job posting, and get ready-to-send application materials.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {HOW_IT_WORKS.map((item) => (
                <article
                  key={item.step}
                  className="card bg-base-100 shadow-sm border border-base-300"
                >
                  <div className="card-body items-center text-center">
                    <div className="badge badge-primary badge-lg font-bold mb-2">
                      {item.step}
                    </div>
                    <h3 className="card-title text-lg">{item.title}</h3>
                    <p className="text-sm text-base-content/70">{item.desc}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Benefits */}
          <section
            aria-labelledby="benefits-heading"
            className="py-16 px-4 lg:px-8 bg-base-100 border-y border-base-300"
          >
            <div className="max-w-5xl mx-auto">
              <h2 id="benefits-heading" className="sr-only">
                Why use Letterly for cover letters
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {BENEFITS.map((item) => (
                  <article key={item.title} className="text-center md:text-left">
                    <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                    <p className="text-sm text-base-content/70 leading-relaxed">
                      {item.desc}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Use cases */}
          <section
            aria-labelledby="use-cases-heading"
            className="py-20 px-4 lg:px-8 max-w-5xl mx-auto"
          >
            <div className="text-center mb-12">
              <p className="text-primary font-semibold text-sm uppercase tracking-wide mb-2">
                Use cases
              </p>
              <h2 id="use-cases-heading" className="text-3xl font-bold mb-3">
                Cover letters for internships, co-ops, and early-career roles
              </h2>
              <p className="text-base-content/70 max-w-2xl mx-auto">
                Applying to multiple companies means rewriting the same story
                every time. Letterly helps you ship personalized cover letters
                faster without sounding generic or AI-written.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {USE_CASES.map((item) => (
                <article
                  key={item.title}
                  className="card bg-base-100 shadow-sm border border-base-300"
                >
                  <div className="card-body">
                    <h3 className="card-title text-lg">{item.title}</h3>
                    <p className="text-sm text-base-content/70 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* What you get */}
          <section
            id="features"
            aria-labelledby="features-heading"
            className="py-20 px-4 lg:px-8 max-w-5xl mx-auto"
          >
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-10 lg:gap-16 items-start">
              <div className="lg:sticky lg:top-24">
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-base-content/40 mb-3">
                  What you get
                </p>
                <h2
                  id="features-heading"
                  className="text-2xl sm:text-3xl font-semibold tracking-tight text-base-content mb-4 leading-snug"
                >
                  One submission.
                  <br />
                  Five application documents.
                </h2>
                <p className="text-sm text-base-content/55 leading-relaxed max-w-sm">
                  Every internship and job application asks for something
                  different. Letterly produces cover letters, emails, and ATS
                  text in one run — pick what you need for each company.
                </p>
                <a
                  href="#generate"
                  className="inline-flex items-center gap-1.5 mt-8 text-sm font-medium text-base-content/70 hover:text-base-content transition-colors"
                >
                  Start generating cover letters
                  <span aria-hidden="true">→</span>
                </a>
              </div>

              <div className="border border-base-300 rounded-2xl bg-base-100 overflow-hidden divide-y divide-base-300">
                {OUTPUTS.map((item) => (
                  <article
                    key={item.index}
                    className="group px-5 sm:px-6 py-4 sm:py-5 flex gap-4 sm:gap-5 hover:bg-base-200/30 transition-colors"
                  >
                    <span className="text-[11px] font-medium text-base-content/30 tabular-nums pt-0.5 w-5 shrink-0">
                      {item.index}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-3 mb-1">
                        <h3 className="text-sm font-medium text-base-content">
                          {item.label}
                        </h3>
                        <span className="text-[11px] text-base-content/35 tabular-nums shrink-0">
                          {item.format}
                        </span>
                      </div>
                      <p className="text-sm text-base-content/50 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <ApplicationForm />

          {/* FAQ */}
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
                Cover letter generator questions
              </h2>
              <p className="text-base-content/70">
                Common questions about AI cover letters, internships, and tech
                job applications.
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

        {/* Footer */}
        <footer className="footer footer-center p-10 bg-base-200 text-base-content/50 border-t border-base-300">
          <div className="flex flex-col items-center gap-2">
            <p className="font-bold text-base-content/70 text-lg flex items-center gap-2">
              <LetterlyLogo />
              Letterly
            </p>
            <p className="text-sm max-w-md">
              AI cover letter generator and job application assistant for
              internships, co-ops, and early-career developers.
            </p>
            <nav aria-label="Footer navigation" className="flex gap-4 mt-2 text-sm">
              <a href="#how-it-works" className="link link-hover">
                How it works
              </a>
              <a href="#features" className="link link-hover">
                Features
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
