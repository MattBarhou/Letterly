export const SITE_NAME = "Letterly";

export const DEFAULT_KEYWORDS = [
  "cover letter generator",
  "AI cover letter",
  "AI job application",
  "tailored cover letter",
  "ATS cover letter",
  "recruiter email template",
  "LinkedIn message for job",
  "job application assistant",
  "cover letters",
  "internship cover letter",
  "new grad cover letter",
  "resume and job posting",
  "application documents",
];

export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (configured) {
    return configured;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

export function absoluteUrl(path = "/") {
  const base = getSiteUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

export const DEFAULT_DESCRIPTION =
  "Upload your resume, paste a job posting, and get five tailored application documents instantly — cover letters, recruiter email, LinkedIn outreach, and ATS text. Free to start. No credit card required.";

export function createPageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  keywords = DEFAULT_KEYWORDS,
  noIndex = false,
}) {
  const url = absoluteUrl(path);

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: url,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    openGraph: {
      type: "website",
      locale: "en_US",
      url,
      siteName: SITE_NAME,
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export function createOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: getSiteUrl(),
    description: DEFAULT_DESCRIPTION,
    logo: absoluteUrl("/favicon.ico"),
  };
}

export function createWebApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_NAME,
    url: getSiteUrl(),
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: DEFAULT_DESCRIPTION,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "3 free generations and 3 ZIP exports, paid plans from $9/month",
    },
    featureList: [
      "AI cover letter generator",
      "Basic and detailed cover letters",
      "Recruiter email drafts",
      "LinkedIn outreach messages",
      "ATS-optimized application text",
      "Application history and tracker",
      "Job URL import",
      "Interview prep and follow-up emails",
      "PDF resume upload",
      "Company research",
    ],
    audience: {
      "@type": "Audience",
      audienceType:
        "Interns, new graduates, career changers, and professionals applying to any role",
    },
  };
}

export function createFaqJsonLd(faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export const HOME_FAQS = [
  {
    question: "What is Letterly?",
    answer:
      "Letterly turns your resume and a job posting into five tailored application documents in one run: a basic cover letter, a detailed cover letter, a recruiter email, a LinkedIn message, and ATS-friendly text.",
  },
  {
    question: "Who is Letterly for?",
    answer:
      "Anyone applying to jobs — internships, new grad roles, and professional positions across industries. Outputs are based on your real resume experience instead of inventing credentials.",
  },
  {
    question: "How many applications can I generate for free?",
    answer:
      "You get 3 free generations and 3 free ZIP exports when you sign up. No credit card is required to start. Each generation produces five documents ready to copy or export.",
  },
  {
    question: "Does Letterly only work for tech jobs?",
    answer:
      "No. Paste any job posting — marketing, finance, healthcare, education, design, HR, and more — and Letterly tailors outputs to the company, role, and keywords in the listing.",
  },
  {
    question: "Can I save and track my applications?",
    answer:
      "Yes. Every generation can be saved. Tracking is a supporting feature — Starter and Premium plans include unlimited history and pipeline tracking. Premium adds follow-up emails, thank-you notes, and interview prep for each saved application.",
  },
];
