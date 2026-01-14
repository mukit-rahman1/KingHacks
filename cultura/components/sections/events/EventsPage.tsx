"use client"

import { useEffect, useState } from "react"

type EventItem = {
  id: string
  title: string
  description: string
  date: string
  tags: string[]
  orgName: string
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

export default function EventsPage() {
  const [events, setEvents] = useState<UiEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadEvents = async () => {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/events")
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
  }, [])

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      <div>
        <h1 className="font-header text-4xl font-extrabold tracking-tight text-[color:var(--foreground)]">
          Events
        </h1>
        <p className="mt-2 text-[color:var(--muted-foreground)]">
          Latest happenings across campus and city communities.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-[color:var(--muted-foreground)]">
          Loading events...
        </p>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : events.length === 0 ? (
        <p className="text-sm text-[color:var(--muted-foreground)]">
          No events yet.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {events.map((event) => (
            <article
              key={event.id}
              className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-header text-xl font-bold text-[color:var(--foreground)]">
                    {event.title}
                  </h3>
                  <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
                    {event.dateHuman} • {event.timeHuman} • {event.location}
                  </p>
                </div>
              </div>

              <p className="mt-3 text-[color:var(--muted-foreground)]">
                {event.description || "No description yet."}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {event.tags.length === 0 ? (
                  <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--background)] px-3 py-1 text-sm text-[color:var(--foreground)]">
                    No tags yet
                  </span>
                ) : (
                  event.tags.map((tag) => (
                    <span
                      key={`${event.id}-${tag}`}
                      className="rounded-full border border-[color:var(--border)] bg-[color:var(--background)] px-3 py-1 text-sm text-[color:var(--foreground)]"
                    >
                      <span className="mr-1 text-[color:var(--accent)]">•</span>
                      {tag}
                    </span>
                  ))
                )}
              </div>

              <p className="mt-4 text-sm text-[color:var(--muted-foreground)]">
                Organizer:{" "}
                <span className="font-semibold text-[color:var(--foreground)]">
                  {event.orgName}
                </span>
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
