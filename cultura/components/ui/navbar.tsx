"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

type Role = "guest" | "user" | "organizer"

export default function Navbar({
  role = "guest",
  userName,
}: {
  role?: Role
  userName?: string
}) {
  const [open, setOpen] = useState(false)

  const navLinks = [
    { href: "/discover", label: "Discover" },
    { href: "/categories", label: "Categories" },
    { href: "/organizers", label: "Organizers" },
    { href: "/about", label: "About" },
  ]

  // Lock scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  // Escape to close
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    if (open) window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open])

  return (
    <header
      className={[
        "sticky top-0 z-50 border-b border-border transition-colors duration-300",
        open
          ? "bg-background shadow-sm"
          : "bg-background/80 backdrop-blur",
      ].join(" ")}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div
            className="
              grid h-9 w-9 place-items-center rounded-xl
              bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-accent)]
              shadow-sm
            "
          >
            <Image
              src="/images/calendar.png"
              alt="Cultura calendar logo"
              width={30}
              height={20}
              priority
            />
          </div>
          <span className="font-header text-lg font-bold text-foreground">
            Cultura
          </span>
        </Link>

        {/* Desktop links */}
        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 md:flex">
          {role === "guest" && (
            <>
              <Link
                href="/organizer/signup"
                className="text-sm font-semibold text-primary hover:opacity-90"
              >
                Become an Organizer
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                Sign up
              </Link>
            </>
          )}

          {role === "user" && (
            <>
              <Link
                href="/saved"
                className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              >
                Saved
              </Link>
              <Link
                href="/profile"
                className="rounded-xl bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground hover:opacity-90"
              >
                {userName ?? "Profile"}
              </Link>
            </>
          )}

          {role === "organizer" && (
            <>
              <Link
                href="/dashboard"
                className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/events/new"
                className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                + Create Event
              </Link>
              <Link
                href="/orgProfile"
                className="rounded-xl bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground hover:opacity-90"
              >
                Org
              </Link>
            </>
          )}
        </div>

        {/* Mobile button */}
        <button
          onClick={() => setOpen(true)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-colors hover:bg-muted md:hidden"
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls="mobile-drawer"
        >
          <div className="flex flex-col gap-1">
            <span className="h-0.5 w-5 bg-foreground" />
            <span className="h-0.5 w-5 bg-foreground" />
            <span className="h-0.5 w-5 bg-foreground" />
          </div>
        </button>
      </div>

      {/* ===== Mobile RIGHT drawer ===== */}
      {/* Overlay */}
      <div
        className={[
          "fixed inset-0 z-40 md:hidden",
          "transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
        aria-hidden={!open}
      >
        <button
          aria-label="Close menu overlay"
          onClick={() => setOpen(false)}
          className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
        />
        <div
          className="
            absolute right-0 top-0 h-full w-[380px]
            bg-gradient-to-l from-[var(--brand-primary)]/15 via-transparent to-transparent
            pointer-events-none
          "
        />
      </div>

      {/* Drawer */}
      <aside
        id="mobile-drawer"
        className={[
          "fixed right-0 top-0 z-50 h-full w-[320px] md:hidden",
          "border-l border-border",
          "bg-background/95 backdrop-blur-xl shadow-2xl",
          "transform transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        {/* Drawer header */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-2">
            <div
              className="
                grid h-8 w-8 place-items-center rounded-xl
                bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-accent)]
                shadow-sm
              "
            >
              <Image
                src="/images/calendar.png"
                alt="Cultura logo"
                width={20}
                height={30}
              />
            </div>
            <span className="font-header text-lg font-bold text-foreground">
              Menu
            </span>
          </div>

          <button
            onClick={() => setOpen(false)}
            className="rounded-xl border border-border bg-card px-3 py-2 text-sm font-semibold transition-colors hover:bg-muted"
            aria-label="Close menu"
          >
            Close
          </button>
        </div>

        {/* Drawer content */}
        <div className="flex h-[calc(100%-4rem)] flex-col px-4 py-4">
          {/* NAV SECTION (clean + aligned) */}
          <div className="rounded-2xl border border-border bg-card/60 p-2">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="
                  group flex w-full items-center justify-between
                  rounded-xl px-3 py-2.5
                  text-sm font-semibold text-foreground
                  transition-colors hover:bg-muted
                "
              >
                <span className="truncate">{item.label}</span>
                <span
                  className="
                    ml-3 inline-flex h-7 w-7 items-center justify-center
                    rounded-lg border border-border bg-background
                    text-muted-foreground
                    transition-transform group-hover:translate-x-0.5
                  "
                >
                  →
                </span>
              </Link>
            ))}
          </div>

          {/* ROLE ACTIONS SECTION */}
          <div className="mt-4 rounded-2xl border border-border bg-card/60 p-3">
            {role === "guest" && (
              <div className="space-y-2">
                <Link
                  href="/signup"
                  onClick={() => setOpen(false)}
                  className="block w-full rounded-xl bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground hover:opacity-90"
                >
                  Sign up
                </Link>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="block w-full rounded-xl border border-border bg-background px-4 py-2.5 text-center text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  Sign in
                </Link>
                <Link
                  href="/organizer/signup"
                  onClick={() => setOpen(false)}
                  className="block w-full rounded-xl px-4 py-2.5 text-center text-sm font-semibold text-primary transition-colors hover:bg-muted"
                >
                  Become an Organizer
                </Link>
              </div>
            )}

            {role === "user" && (
              <div className="space-y-2">
                <div className="rounded-xl border border-border bg-background px-4 py-3">
                  <p className="text-xs text-muted-foreground">Signed in as</p>
                  <p className="mt-0.5 truncate text-sm font-semibold text-foreground">
                    {userName ?? "User"}
                  </p>
                </div>

                <Link
                  href="/saved"
                  onClick={() => setOpen(false)}
                  className="block w-full rounded-xl border border-border bg-background px-4 py-2.5 text-center text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  Saved
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setOpen(false)}
                  className="block w-full rounded-xl bg-secondary px-4 py-2.5 text-center text-sm font-semibold text-secondary-foreground hover:opacity-90"
                >
                  {userName ?? "Profile"}
                </Link>
              </div>
            )}

            {role === "organizer" && (
              <div className="space-y-2">
                <div className="rounded-xl border border-border bg-background px-4 py-3">
                  <p className="text-xs text-muted-foreground">Organizer</p>
                  <p className="mt-0.5 truncate text-sm font-semibold text-foreground">
                    {userName ?? "Org Account"}
                  </p>
                </div>

                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="block w-full rounded-xl border border-border bg-background px-4 py-2.5 text-center text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/events/new"
                  onClick={() => setOpen(false)}
                  className="block w-full rounded-xl bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground hover:opacity-90"
                >
                  + Create Event
                </Link>
                <Link
                  href="/orgProfile"
                  onClick={() => setOpen(false)}
                  className="block w-full rounded-xl bg-secondary px-4 py-2.5 text-center text-sm font-semibold text-secondary-foreground hover:opacity-90"
                >
                  Org Profile
                </Link>
              </div>
            )}
          </div>

          {/* Bottom helper */}
          <div className="mt-auto pt-4">
            <div className="rounded-2xl border border-border bg-card/60 p-4">
              <p className="text-sm font-semibold text-foreground">Tip</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Tap outside the drawer or press <span className="font-mono">Esc</span> to close.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </header>
  )
}
