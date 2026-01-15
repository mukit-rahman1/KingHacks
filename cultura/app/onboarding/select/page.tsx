"use client"

import Link from "next/link"

export default function OnboardingSelectPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-xl flex-col justify-center px-4">
      <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
        <h1 className="font-header text-3xl font-bold text-foreground">
          Tell us about yourself
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Are you joining as an individual or an organization?
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Link
            href="/onboarding/individual"
            className="rounded-2xl border border-border bg-background p-4 text-left transition hover:bg-muted"
          >
            <p className="text-sm font-semibold text-foreground">Individual</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Discover events that match your interests.
            </p>
          </Link>
          <Link
            href="/onboarding/organization"
            className="rounded-2xl border border-border bg-background p-4 text-left transition hover:bg-muted"
          >
            <p className="text-sm font-semibold text-foreground">
              Organization
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Create a profile and share your events.
            </p>
          </Link>
        </div>
      </div>
    </div>
  )
}
