import { SignUp } from "@clerk/nextjs";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Sign Up",
  description:
    "Create a free Letterly account and generate tailored application documents. No credit card required.",
  path: "/sign-up",
  noIndex: true,
});

const ALLOWED_REDIRECTS = new Set(["/pricing", "/#generate"]);
const DEFAULT_REDIRECT = "/#generate";

function resolveRedirectUrl(raw) {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (typeof value !== "string") {
    return DEFAULT_REDIRECT;
  }

  const trimmed = value.trim();
  if (ALLOWED_REDIRECTS.has(trimmed)) {
    return trimmed;
  }

  return DEFAULT_REDIRECT;
}

export default async function SignUpPage({ searchParams }) {
  const params = await searchParams;
  const redirectUrl = resolveRedirectUrl(params?.redirect_url);

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <SignUp
        forceRedirectUrl={redirectUrl}
        fallbackRedirectUrl={redirectUrl}
      />
    </div>
  );
}
