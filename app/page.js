import ApplicationForm from "@/components/ApplicationForm";
import LetterlyLogo from "@/components/LetterlyLogo";
import Navbar from "@/components/Navbar";

const OUTPUTS = [
  {
    index: "01",
    label: "Cover letter",
    format: "250 words",
    description: "Short form for application portals with word limits.",
  },
  {
    index: "02",
    label: "Cover letter",
    format: "400 words",
    description: "Extended version when a fuller narrative is expected.",
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
    desc: "Paste the job posting, company name, and title. Pick a tone that fits the company.",
  },
  {
    step: "3",
    title: "Copy & apply",
    desc: "Review five tailored outputs, copy the ones you need, and send your application.",
  },
];

const BENEFITS = [
  {
    title: "Resume-accurate",
    desc: "Content is based on your real experience — no invented skills or fake metrics.",
  },
  {
    title: "Role-specific",
    desc: "Every output is tailored to the company and job description you provide.",
  },
  {
    title: "Early-career focused",
    desc: "Written for interns, new grads, and junior developers applying in Canada and beyond.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-linear-to-br from-primary/5 via-base-100 to-secondary/10 py-20 lg:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-4xl px-4 mx-auto text-center">
          <div className="badge badge-primary badge-outline mb-6 font-medium">
            Built for interns, new grads & junior devs
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
            Land your next{" "}
            <span className="text-primary">tech role</span>, faster
          </h1>
          <p className="py-6 text-lg text-base-content/70 max-w-2xl mx-auto leading-relaxed">
            Stop spending hours rewriting cover letters for every application.
            Letterly generates five tailored materials from your resume and a
            job posting — in under a minute.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="#generate"
              className="btn btn-primary btn-lg shadow-lg shadow-primary/20"
            >
              Generate Application Materials
            </a>
            <a href="#how-it-works" className="btn btn-ghost btn-lg">
              See how it works →
            </a>
          </div>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mt-10 text-sm text-base-content/50">
            <span className="flex items-center gap-1.5">
              <span className="text-success font-bold">✓</span> 5 outputs per run
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-success font-bold">✓</span> No account needed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-success font-bold">✓</span> Ready in ~30 seconds
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-success font-bold">✓</span> Free to use
            </span>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="py-20 px-4 lg:px-8 max-w-5xl mx-auto"
      >
        <div className="text-center mb-12">
          <p className="text-primary font-semibold text-sm uppercase tracking-wide mb-2">
            How it works
          </p>
          <h2 className="text-3xl font-bold mb-3">Three steps to apply smarter</h2>
          <p className="text-base-content/70 max-w-xl mx-auto">
            No sign-up required. Upload your resume PDF or paste your info, then
            get ready-to-send application materials.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {HOW_IT_WORKS.map((item) => (
            <div
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
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-4 lg:px-8 bg-base-100 border-y border-base-300">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {BENEFITS.map((item) => (
            <div key={item.title} className="text-center md:text-left">
              <h3 className="font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-sm text-base-content/70 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* What you get */}
      <section id="features" className="py-20 px-4 lg:px-8 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-10 lg:gap-16 items-start">
          <div className="lg:sticky lg:top-24">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-base-content/40 mb-3">
              What you get
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-base-content mb-4 leading-snug">
              One submission.
              <br />
              Five documents.
            </h2>
            <p className="text-sm text-base-content/55 leading-relaxed max-w-sm">
              Every application asks for something different. Letterly produces
              the full set at once — pick what you need for each company.
            </p>
            <a
              href="#generate"
              className="inline-flex items-center gap-1.5 mt-8 text-sm font-medium text-base-content/70 hover:text-base-content transition-colors"
            >
              Start generating
              <span aria-hidden="true">→</span>
            </a>
          </div>

          <div className="border border-base-300 rounded-2xl bg-base-100 overflow-hidden divide-y divide-base-300">
            {OUTPUTS.map((item) => (
              <div
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
              </div>
            ))}
          </div>
        </div>
      </section>

      <ApplicationForm />

      {/* Footer */}
      <footer className="footer footer-center p-10 bg-base-200 text-base-content/50 border-t border-base-300">
        <div className="flex flex-col items-center gap-2">
          <p className="font-bold text-base-content/70 text-lg flex items-center gap-2">
            <LetterlyLogo />
            Letterly
          </p>
          <p className="text-sm">
            AI Job Application Assistant for early-career developers
          </p>
          <div className="flex gap-4 mt-2 text-sm">
            <a href="#how-it-works" className="link link-hover">
              How it works
            </a>
            <a href="#features" className="link link-hover">
              Features
            </a>
            <a href="/pricing" className="link link-hover">
              Pricing
            </a>
            <a href="#generate" className="link link-hover">
              Generate
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
