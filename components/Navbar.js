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
        <Link href="/#features" className="btn btn-ghost btn-sm">
          Features
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
          <SignUpButton mode="modal">
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
      <div className="flex-none sm:hidden flex items-center gap-1">
        <Show when="signed-out">
          <SignUpButton mode="modal">
            <button type="button" className="btn btn-primary btn-sm">
              Start
            </button>
          </SignUpButton>
        </Show>
        <Show when="signed-in">
          <Link href="/applications" className="btn btn-ghost btn-sm">
            Apps
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
      </nav>
    </header>
  );
}
