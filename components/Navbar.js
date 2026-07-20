"use client";

import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import LetterlyLogo from "@/components/LetterlyLogo";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-base-100/80 backdrop-blur-md border-b border-base-300">
      <nav
        aria-label="Main navigation"
        className="navbar px-4 lg:px-8 max-w-6xl mx-auto"
      >
        <div className="flex-1">
          <Link href="/" className="btn btn-ghost text-xl font-bold gap-2 px-2">
            <LetterlyLogo />
            Letterly
          </Link>
        </div>
        <div className="flex-none hidden sm:flex gap-1 items-center">
          <Link href="/#how-it-works" className="btn btn-ghost btn-sm">
            How it works
          </Link>
          <Link href="/pricing" className="btn btn-ghost btn-sm">
            Pricing
          </Link>
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button type="button" className="btn btn-ghost btn-sm">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal" forceRedirectUrl="/#generate">
              <button type="button" className="btn btn-primary btn-sm">
                Get Started
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <Link href="/applications" className="btn btn-ghost btn-sm">
              Applications
            </Link>
            <Link href="/resume" className="btn btn-ghost btn-sm">
              Resume
            </Link>
            <Link href="/#generate" className="btn btn-primary btn-sm">
              Generate
            </Link>
            <div className="ml-3">
              <UserButton afterSignOutUrl="/" />
            </div>
          </Show>
        </div>
        <div className="flex-none sm:hidden">
          <details className="dropdown dropdown-end">
            <summary
              aria-label="Open navigation menu"
              className="btn btn-ghost btn-square list-none [&::-webkit-details-marker]:hidden"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6"
                aria-hidden="true"
              >
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            </summary>
            <ul className="menu dropdown-content z-[1] mt-3 w-64 rounded-box bg-base-100 p-2 shadow-xl border border-base-300">
              <li>
                <Link href="/#how-it-works">How it works</Link>
              </li>
              <li>
                <Link href="/pricing">Pricing</Link>
              </li>
              <Show when="signed-out">
                <li>
                  <SignInButton mode="modal">
                    <button type="button">Sign in</button>
                  </SignInButton>
                </li>
                <li>
                  <SignUpButton mode="modal" forceRedirectUrl="/#generate">
                    <button
                      type="button"
                      className="btn btn-primary btn-sm mt-1"
                    >
                      Get Started
                    </button>
                  </SignUpButton>
                </li>
              </Show>
              <Show when="signed-in">
                <li>
                  <Link href="/applications">Applications</Link>
                </li>
                <li>
                  <Link href="/resume">Resume</Link>
                </li>
                <li>
                  <Link
                    href="/#generate"
                    className="font-semibold text-primary"
                  >
                    Generate
                  </Link>
                </li>
                <li className="mt-2 px-3 py-2">
                  <div className="flex items-center justify-between p-0">
                    <span className="text-sm text-base-content/60">
                      Account
                    </span>
                    <UserButton afterSignOutUrl="/" />
                  </div>
                </li>
              </Show>
            </ul>
          </details>
        </div>
      </nav>
    </header>
  );
}
