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
  priceLabel: string
  featured: boolean
  areaTag: string 
}

const toHumanDate = (value: string) => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value || "TBD"
  return parsed.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

const categoryFromEvent = (event: EventItem, activeCat: string) => {
  // if URL cat is set, use it
  const fromParam = categories.find((c) => c.id === activeCat)?.label
  if (fromParam) return fromParam

  // else try infer from tags
  const lowerTags = event.tags.map((t) => t.toLowerCase())
  return (
    categories.find((c) =>
      lowerTags.some((t) => t.includes(c.label.toLowerCase()) || t.includes(c.id.toLowerCase()))
    )?.label ?? "Community"
  )
}

// ✅ NEW: infer an "area" label from tags (fallback if none found)
const areaFromEvent = (event: EventItem) => {
  const tags = (event.tags ?? []).map((t) => t.trim())

  // try exact-ish matches first
  const areaTag =
    tags.find((t) => /^([A-Z]{2})$/.test(t)) || // ON, BC, QC...
    tags.find((t) => /, ?[A-Z]{2}$/.test(t)) || // Kingston, ON
    tags.find((t) => /(Ontario|Quebec|Alberta|British Columbia|Manitoba|Saskatchewan|Nova Scotia|New Brunswick|PEI|Prince Edward Island|Newfoundland|Labrador|Yukon|Nunavut|Northwest Territories)/i.test(t))

  return areaTag ?? "Kingston"
}

const chipActiveClass =
  "bg-[color:var(--primary)] text-[color:var(--primary-foreground)] border-transparent shadow-sm"
const chipIdleClass =
  "bg-[color:var(--background)] text-[color:var(--foreground)] border-[color:var(--border)] hover:bg-[color:var(--muted)]"

export default function DiscoverPage() {
  const searchParams = useSearchParams()
  const qParam = searchParams.get("q") ?? ""
  const q = qParam.toLowerCase()
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

      const mapped: UiEvent[] = (payload.events ?? []).map((event, idx) => ({
        ...event,
        dateHuman: toHumanDate(event.date),
        timeHuman: "6:00 PM",
        location: "Community venue",
        // dummy, but gives you the mock UI
        priceLabel: idx % 3 === 0 ? "$45" : idx % 3 === 1 ? "Free" : "$25",
        featured: idx % 2 === 0,

        // ✅ NEW: computed area label from tags
        areaTag: areaFromEvent(event),
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
        event.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery))

      const matchesCategory =
        !cat || event.tags.some((tag) => tag.toLowerCase().includes(label))

      return matchesQuery && matchesCategory
    })
  }, [events, cat, q])

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      {/* ===== HERO HEADER (centered like mock) ===== */}
      <div className="mx-auto flex max-w-4xl flex-col items-center text-center pt-10 pb-10">
        <h1 className="font-header text-5xl font-extrabold tracking-tight text-[color:var(--foreground)] md:text-6xl">
          Discover{" "}
          <span className="text-heritage">Cultural Events</span>
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-[color:var(--muted-foreground)]">
          Explore events that celebrate heritage, art, music, and community
        </p>

        {/* Search pill */}
        <form action="/discover" method="get" className="mt-10 w-full">
          <input type="hidden" name="cat" value={cat} />
          <div
            className="
              mx-auto flex w-full max-w-3xl items-center
              rounded-full border border-[color:var(--border)]
              bg-[color:var(--card)]
              px-6 py-4 shadow-sm
              focus-within:ring-2 focus-within:ring-[color:var(--ring)]
              focus-within:ring-offset-2 focus-within:ring-offset-[color:var(--background)]
            "
          >
            <input
              name="q"
              defaultValue={qParam}
              placeholder="Search events, locations, or organizers..."
              className="
                w-full bg-transparent text-base text-[color:var(--foreground)]
                placeholder:text-[color:var(--muted-foreground)]
                focus:outline-none
              "
            />
            <button
              type="submit"
              className="
                ml-4 rounded-full bg-[color:var(--primary)]
                px-6 py-2 text-sm font-semibold text-[color:var(--primary-foreground)]
                shadow-sm transition hover:brightness-105 active:scale-[0.99]
              "
            >
              Search
            </button>
          </div>

          {/* Clear link */}
          {(qParam || cat) && (
            <div className="mt-3 text-sm">
              <Link
                href="/discover"
                className="font-semibold text-[color:var(--primary)] hover:opacity-90"
              >
                Clear filters
              </Link>
            </div>
          )}
        </form>
      </div>

      {/* ===== FILTER CHIPS (centered) ===== */}
      <div className="flex flex-wrap items-center justify-center gap-3 pb-6">
        <Link
          href="/discover"
          className={[
            "rounded-full border px-4 py-2 text-sm font-semibold transition",
            !cat ? chipActiveClass : chipIdleClass,
          ].join(" ")}
        >
          All
        </Link>

        {categories.map((c) => {
          const active = cat === c.id
          return (
            <Link
              key={c.id}
              href={`/discover?cat=${encodeURIComponent(c.id)}${
                qParam ? `&q=${encodeURIComponent(qParam)}` : ""
              }`}
              className={[
                "rounded-full border px-4 py-2 text-sm font-semibold transition",
                active ? chipActiveClass : chipIdleClass,
              ].join(" ")}
            >
              {c.label}
            </Link>
          )
        })}
      </div>

      {/* ===== COUNT ===== */}
      <p className="pb-8 text-center text-[color:var(--muted-foreground)]">
        Showing{" "}
        <span className="font-semibold text-[color:var(--foreground)]">
          {isLoading ? "…" : filtered.length}
        </span>{" "}
        events
      </p>

      {/* ===== GRID (3 per row on desktop) ===== */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((e) => {
          const catLabel = categoryFromEvent(e, cat)

          return (
            <article
              key={e.id}
              className="
                overflow-hidden rounded-3xl
                border border-[color:var(--border)]
                bg-[color:var(--card)]
                shadow-sm transition
                hover:-translate-y-0.5 hover:shadow-md
              "
            >
              {/* Image header */}
              <div className="relative h-52 w-full bg-[color:var(--muted)]">
                {e.imageUrl ? (
                  <>
                    <img
                      src={e.imageUrl}
                      alt={e.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                    <div
                      className="
                        pointer-events-none absolute inset-0
                        bg-gradient-to-t
                        from-black/80 via-black/25 to-transparent
                      "
                    />
                  </>
                ) : (
                  <div className="h-full w-full bg-[color:var(--accent)]/10" />
                )}

                {/* Category badge (top-left) */}
                <div className="absolute left-4 top-4">
                  <span
                    className="
                      rounded-full bg-[color:var(--primary)]
                      px-3 py-1 text-xs font-semibold
                      text-[color:var(--primary-foreground)]
                      shadow-sm
                    "
                  >
                    {catLabel}
                  </span>
                </div>

                {/* ✅ NEW: Area badge (top-right, replaces/alongside Featured) */}
                <div className="absolute right-4 top-4">
                  <span
                    className="
                      rounded-full bg-black/70
                      px-3 py-1 text-xs font-semibold
                      text-white
                      shadow-sm
                      backdrop-blur
                    "
                  >
                    {e.areaTag}
                  </span>
                </div>

                {/* Price pill (bottom-right) */}
                <div className="absolute bottom-4 right-4">
                  <span className="rounded-full bg-white/90 px-4 py-1 text-sm font-semibold text-black shadow-sm">
                    {e.priceLabel}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-6">
                <h3 className="font-header text-2xl font-extrabold text-[color:var(--foreground)]">
                  {e.title}
                </h3>

                {/* Details rows */}
                <div className="mt-4 space-y-3 text-[color:var(--muted-foreground)]">
                  <div className="flex items-center gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-full border border-[color:var(--border)] bg-[color:var(--background)] text-xs">
                      📅
                    </span>
                    <span>{e.dateHuman}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-full border border-[color:var(--border)] bg-[color:var(--background)] text-xs">
                      ⏰
                    </span>
                    <span>{e.timeHuman}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-full border border-[color:var(--border)] bg-[color:var(--background)] text-xs">
                      📍
                    </span>
                    <span>{e.location}</span>
                  </div>
                </div>

                <div className="my-5 h-px w-full bg-[color:var(--border)]" />

                <p className="text-sm text-[color:var(--muted-foreground)]">
                  By{" "}
                  <span className="font-semibold text-[color:var(--foreground)]">
                    {e.orgName}
                  </span>
                </p>
              </div>
            </article>
          )
        })}
      </div>

      {/* ===== STATES ===== */}
      <div className="mt-10">
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

      <div className="h-20" />
    </div>
  )
}
