"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

import { categories } from "@/lib/data"

type EventItem = {
  id: string
  title: string
  description: string
  date: string
  tags: string[]
  orgName: string
  imageUrl?: string
}

type UiEvent = EventItem & {
  dateHuman: string
  timeHuman: string
  location: string
}

const toHumanDate = (value: string) => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value || "TBD"
  }
  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export default function DiscoverPage() {
  const searchParams = useSearchParams()
  const q = (searchParams.get("q") ?? "").toLowerCase()
  const cat = searchParams.get("cat") ?? ""
  const [events, setEvents] = useState<UiEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadEvents = async () => {
      setIsLoading(true)
      setError(null)

      const queryString = q ? `?q=${encodeURIComponent(q)}` : ""
      const response = await fetch(`/api/events${queryString}`)
      if (!response.ok) {
        setError("Unable to load events.")
        setIsLoading(false)
        return
      }

      const payload = (await response.json()) as { events: EventItem[] }
      const mapped = (payload.events ?? []).map((event) => ({
        ...event,
        dateHuman: toHumanDate(event.date),
        timeHuman: "TBD",
        location: "Community venue",
      }))
      setEvents(mapped)
      setIsLoading(false)
    }

    void loadEvents()
  }, [q])

  const filtered = useMemo(() => {
    const normalizedQuery = q.trim().toLowerCase()
    const label =
      categories.find((category) => category.id === cat)?.label.toLowerCase() ??
      cat.toLowerCase()

    return events.filter((event) => {
      const matchesQuery =
        !normalizedQuery ||
        event.title.toLowerCase().includes(normalizedQuery) ||
        event.description.toLowerCase().includes(normalizedQuery) ||
        event.orgName.toLowerCase().includes(normalizedQuery) ||
        event.tags.some((tag) =>
          tag.toLowerCase().includes(normalizedQuery)
        )

      const matchesCategory =
        !cat ||
        event.tags.some((tag) => tag.toLowerCase().includes(label))

      return matchesQuery && matchesCategory
    })
  }, [events, cat, q])

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-header text-4xl font-extrabold tracking-tight text-[color:var(--foreground)]">
            Discover
          </h1>
          <p className="mt-2 text-[color:var(--muted-foreground)]">
            Search + filter events across communities.
          </p>
        </div>

        {/* Search */}
        <form
          className="
            flex w-full max-w-xl gap-2
            rounded-2xl border border-[color:var(--border)]
            bg-[color:var(--card)]
            p-2 shadow-sm
          "
          action="/discover"
          method="get"
        >
          <input type="hidden" name="cat" value={cat} />
          <input
            name="q"
            defaultValue={q}
            className="
              w-full rounded-xl border border-[color:var(--input)]
              bg-[color:var(--background)]
              px-3 py-2 text-sm text-[color:var(--foreground)]
              placeholder:text-[color:var(--muted-foreground)]
              focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)] focus:ring-offset-2 focus:ring-offset-[color:var(--background)]
            "
            placeholder="Search: potluck, language, dance..."
          />
          <button
            className="
              rounded-xl bg-[color:var(--primary)] px-4 py-2
              text-sm font-semibold text-[color:var(--primary-foreground)]
              shadow-sm transition hover:brightness-105 active:scale-[0.99]
            "
            type="submit"
          >
            Search
          </button>
          <Link
            className="
              rounded-xl border border-[color:var(--border)]
              bg-[color:var(--background)]
              px-4 py-2 text-sm font-semibold text-[color:var(--foreground)]
              transition hover:bg-[color:var(--muted)]
            "
            href="/discover"
          >
            Clear
          </Link>
        </form>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/discover"
          className={[
            "rounded-full border px-3 py-1 text-sm font-semibold transition",
            !cat
              ? "border-[color:var(--primary)] bg-[color:var(--secondary)] text-[color:var(--secondary-foreground)] shadow-sm"
              : "border-[color:var(--border)] bg-[color:var(--background)] text-[color:var(--muted-foreground)] hover:bg-[color:var(--muted)]",
          ].join(" ")}
        >
          All
        </Link>

        {categories.map((c) => {
          const active = cat === c.id
          return (
            <Link
              key={c.id}
              href={`/discover?cat=${encodeURIComponent(c.id)}`}
              className={[
                "rounded-full border px-3 py-1 text-sm font-semibold transition",
                active
                  ? "border-[color:var(--accent)] bg-[color:var(--accent)] text-[color:var(--accent-foreground)] shadow-sm"
                  : "border-[color:var(--border)] bg-[color:var(--background)] text-[color:var(--muted-foreground)] hover:bg-[color:var(--muted)]",
              ].join(" ")}
            >
              {c.label}
            </Link>
          )
        })}
      </div>

      {/* Event grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((e) => {
          const catLabel =
            categories.find((c) =>
              e.tags.some((tag) => tag.toLowerCase().includes(c.label.toLowerCase()))
            )?.label ?? "Category"
          return (
            <article
              key={e.id}
              className="
                relative overflow-hidden rounded-2xl
                border border-[color:var(--border)]
                bg-[color:var(--card)]
                p-5 shadow-sm
              "
            >
              <div className="h-70 w-full overflow-hidden rounded-xl bg-[color:var(--accent)]/60 mb-4">
                {e.imageUrl ? (
                  <img
                    src={e.imageUrl}
                    alt={e.title}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              {/* subtle corner glow */}
              <div
                className="
                  pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full
                  bg-[color:var(--brand-accent)]/10 blur-2xl
                "
              />

              <div className="relative flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-header text-xl font-bold text-[color:var(--foreground)]">
                    {e.title}
                  </h3>
                  <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
                    {e.dateHuman} • {e.timeHuman} • {e.location}
                  </p>
                </div>

                <span
                  className="
                    shrink-0 rounded-full
                    border border-[color:var(--border)]
                    bg-[color:var(--secondary)]
                    px-3 py-1 text-sm font-semibold
                    text-[color:var(--secondary-foreground)]
                  "
                >
                  {catLabel}
                </span>
              </div>

              <p className="mt-3 text-[color:var(--muted-foreground)]">
                {e.description}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {e.tags.map((t) => (
                  <span
                    key={t}
                    className="
                      rounded-full border border-[color:var(--border)]
                      bg-[color:var(--background)]
                      px-3 py-1 text-sm
                      text-[color:var(--foreground)]
                    "
                  >
                    <span className="mr-1 text-[color:var(--accent)]">•</span>
                    {t}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-sm text-[color:var(--muted-foreground)]">
                  Organizer:{" "}
                  <span className="font-semibold text-[color:var(--foreground)]">
                    {e.orgName}
                  </span>
                </p>

                <button
                  className="
                    rounded-xl bg-[color:var(--primary)]
                    px-4 py-2 text-sm font-semibold
                    text-[color:var(--primary-foreground)]
                    shadow-sm transition hover:brightness-105 active:scale-[0.99]
                  "
                  type="button"
                >
                  RSVP
                </button>
              </div>
            </article>
          )
        })}
      </div>

      {/* Empty state */}
      {isLoading ? (
        <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6 shadow-sm">
          <p className="font-header text-lg font-bold text-[color:var(--foreground)]">
            Loading events...
          </p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6 shadow-sm">
          <p className="font-header text-lg font-bold text-[color:var(--foreground)]">
            {error}
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6 shadow-sm">
          <p className="font-header text-lg font-bold text-[color:var(--foreground)]">
            No events match your search.
          </p>
          <p className="mt-1 text-[color:var(--muted-foreground)]">
            Try a different keyword or clear filters.
          </p>
        </div>
      ) : null}
    </div>
  )
}
