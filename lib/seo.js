export const SITE_NAME = "Letterly";

export const DEFAULT_KEYWORDS = [
  "cover letter generator",
  "AI cover letter",
  "cover letter for internship",
  "internship cover letter",
  "cover letter for software engineer",
  "tech job application",
  "new grad cover letter",
  "ATS cover letter",
  "recruiter email template",
  "LinkedIn message for job",
  "job application assistant",
  "cover letters",
  "internships",
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
  "Letterly is an AI cover letter generator for internships, co-ops, and early-career tech roles. Create tailored cover letters, recruiter emails, LinkedIn messages, and ATS-friendly application materials from your resume in under a minute.";

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
      "PDF resume upload",
      "Company research",
    ],
    audience: {
      "@type": "Audience",
      audienceType:
        "Interns, new graduates, and junior software engineers applying for tech roles",
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
    question: "What is a cover letter generator?",
    answer:
      "A cover letter generator uses AI to write personalized cover letters based on your resume and a job description. Letterly creates role-specific cover letters plus recruiter emails, LinkedIn messages, and ATS-friendly text in one run.",
  },
  {
    question: "Is Letterly good for internship and new grad applications?",
    answer:
      "Yes. Letterly is built for early-career developers applying to internships, co-ops, and new grad software engineering roles. It emphasizes real resume experience instead of inventing credentials.",
  },
  {
    question: "How many cover letters can I generate for free?",
    answer:
      "You get 3 free generations and 3 free ZIP exports when you sign up. Each generation produces five documents: a basic cover letter, a detailed cover letter, a recruiter email, a LinkedIn message, and an ATS version.",
  },
  {
    question: "Does Letterly work for software engineering and tech roles?",
    answer:
      "Letterly is designed for tech job applications. Paste a software engineering, data, or general tech internship posting and Letterly tailors outputs to the company, role, and keywords in the listing.",
  },
  {
    question: "What is the difference between cover letter and ATS versions?",
    answer:
      "Cover letters are written for human readers in a natural tone. The ATS version is plain text optimized with relevant keywords from the job description so applicant tracking systems can parse your application more reliably.",
  },
  {
    question: "Can I export my cover letters as PDF?",
    answer:
      "Free users get 3 lifetime ZIP exports with cover letters as PDFs and other materials as text files. Premium subscribers get unlimited exports, organized by company and job title.",
  },
];
