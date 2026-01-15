"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

type Organizer = {
  id: string
  name: string
  description: string
  location?: string
  eventsCount?: number
  membersCount?: number
  tags: string[]
  email?: string
  website?: string
}

export default function OrganizersPage() {
  const [organizers, setOrganizers] = useState<Organizer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/organizations/list")
        if (!res.ok) throw new Error("Failed to load organizers")
        const data = (await res.json()) as { organizations: Organizer[] }
        setOrganizers(data.organizations ?? [])
      } catch (err) {
        setError("Unable to load organizers.")
      } finally {
        setIsLoading(false)
      }
    }

    void load()
  }, [])

  return (
    <div className="w-full">
      {/* ================= HEADER ================= */}
      <section className="relative overflow-hidden">
        {/* background gradient */}
        <div className="absolute inset-0">
          {/* pink lower left */}
          <div className="absolute left-0 bottom-0 h-[380px] w-[380px] rounded-full bg-[#7e3362]/30 blur-3xl" />
          {/* gold upper right */}
          <div className="absolute right-0 top-0 h-[420px] w-[420px] rounded-full bg-[#f9a81c]/35 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 py-24 text-center">
          <h1 className="font-header text-5xl font-extrabold tracking-tight text-[color:var(--foreground)] md:text-6xl">
            Meet Our{" "}
            <span className="text-heritage">Organizers</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-[color:var(--muted-foreground)]">
            The passionate individuals and organizations bringing cultural
            experiences to life. Connect with them to discover events or
            collaborate.
          </p>

          <div className="mt-10">
            <Link
              href="/signup?role=organizer"
              className="
                inline-flex items-center justify-center rounded-xl
                bg-gradient-to-r from-[#a02237] to-[#f9a81c]
                px-8 py-3 text-sm font-semibold
                text-white shadow-sm
                transition hover:brightness-105 active:scale-[0.98]
              "
            >
              Become an Organizer
            </Link>
          </div>
        </div>
      </section>

      {/* ================= CONTENT ================= */}
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6 shadow-sm">
            <p className="font-header text-lg font-bold text-[color:var(--foreground)]">
              Loading organizers…
            </p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6 shadow-sm">
            <p className="font-header text-lg font-bold text-[color:var(--foreground)]">
              {error}
            </p>
          </div>
        ) : organizers.length === 0 ? (
          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6 shadow-sm">
            <p className="font-header text-lg font-bold text-[color:var(--foreground)]">
              No organizers yet.
            </p>
            <p className="mt-1 text-[color:var(--muted-foreground)]">
              Be the first to host cultural events on Cultura.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {organizers.map((o) => (
              <article
                key={o.id}
                className="
                  rounded-2xl border border-[color:var(--border)]
                  bg-[color:var(--card)]
                  p-6 shadow-sm
                  transition hover:shadow-md
                "
              >
                {/* Title */}
                <h3 className="font-header text-2xl font-bold text-[color:var(--foreground)]">
                  {o.name}
                </h3>

                {/* Meta */}
                <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-sm text-[color:var(--muted-foreground)]">
                  <span>📍 {o.location ?? "—"}</span>
                  <span>📅 {o.eventsCount ?? "—"} events</span>
                  <span>
                    👥 {o.membersCount ? `${o.membersCount} members` : "—"}
                  </span>
                </div>

                {/* Description */}
                <p className="mt-4 text-[color:var(--muted-foreground)]">
                  {o.description}
                </p>

                {/* Tags */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {o.tags.map((tag) => (
                    <span
                      key={tag}
                      className="
                        rounded-full bg-[color:var(--secondary)]
                        px-3 py-1 text-sm
                        text-[color:var(--secondary-foreground)]
                      "
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Links */}
                <div className="mt-5 flex flex-wrap items-center gap-6">
                  <a
                    href={`mailto:${o.email ?? "hello@cultura.app"}`}
                    className="text-sm font-semibold text-[color:var(--primary)] hover:opacity-90"
                  >
                    Email
                  </a>

                  <a
                    href={o.website ?? "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-semibold text-[color:var(--primary)] hover:opacity-90"
                  >
                    Website ↗
                  </a>

                  <Link
                    href={`/discover?q=${encodeURIComponent(o.name)}`}
                    className="ml-auto text-sm font-semibold text-[color:var(--primary)] hover:opacity-90"
                  >
                    View events →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
