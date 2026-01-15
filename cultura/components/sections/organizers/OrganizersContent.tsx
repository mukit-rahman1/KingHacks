"use client"

import { useEffect, useState } from "react"

type OrganizerItem = {
  id: string
  name: string
  description: string
  tags: string[]
}

const fallbackType = "Community Group"

export default function OrganizersPage() {
  const [organizers, setOrganizers] = useState<OrganizerItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadOrganizers = async () => {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/organizations/list")
      if (!response.ok) {
        setError("Unable to load organizers.")
        setIsLoading(false)
        return
      }

      const payload = (await response.json()) as {
        organizations: OrganizerItem[]
      }

      setOrganizers(payload.organizations ?? [])
      setIsLoading(false)
    }

    void loadOrganizers()
  }, [])

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6 lg:px-8">
      {/* Header — matches Categories */}
      <div>
        <h1 className="font-header text-4xl font-extrabold mt-5 tracking-tight text-[color:var(--foreground)]">
          Organizers
        </h1>
        <p className="mt-2 max-w-xl text-[color:var(--muted-foreground)]">
          The people and groups hosting community events.
        </p>
      </div>

      {/* States */}
      {isLoading ? (
        <p className="text-sm text-[color:var(--muted-foreground)]">
          Loading organizers…
        </p>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : organizers.length === 0 ? (
        <p className="text-sm text-[color:var(--muted-foreground)]">
          No organizers yet.
        </p>
      ) : (
        /* Grid — matches Categories */
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {organizers.map((o) => (
            <article
              key={o.id}
              className="
                group relative overflow-hidden
                rounded-2xl border border-[color:var(--border)]
                bg-[color:var(--card)]
                p-6 shadow-sm transition
                hover:-translate-y-0.5 hover:shadow-md
              "
            >
              {/* Soft accent glow — same as Categories */}
              <div
                className="
                  pointer-events-none absolute -right-24 -top-24 h-56 w-56
                  rounded-full bg-[color:var(--brand-accent)]/10 blur-2xl
                "
              />

              {/* Type pill — same scale as category pill */}
              <div
                className="
                  relative mb-3 w-fit rounded-full
                  border border-[color:var(--border)]
                  bg-[color:var(--secondary)]
                  px-3 py-1 text-sm font-semibold
                  text-[color:var(--secondary-foreground)]
                "
              >
                {fallbackType}
              </div>

              {/* Organizer name — same typography as category title */}
              <h3 className="relative font-header text-xl font-bold text-[color:var(--foreground)]">
                {o.name}
              </h3>

              {/* Description — same muted style */}
              <p className="relative mt-2 text-[color:var(--muted-foreground)]">
                {o.description || "No description yet."}
              </p>

              {/* Communities */}
              <div className="relative mt-4 flex flex-wrap gap-2">
                {o.tags.length === 0 ? (
                  <span
                    className="
                      rounded-full border border-[color:var(--border)]
                      bg-[color:var(--background)]
                      px-3 py-1 text-sm
                      text-[color:var(--muted-foreground)]
                    "
                  >
                    No tags yet
                  </span>
                ) : (
                  o.tags.map((c) => (
                    <span
                      key={c}
                      className="
                        rounded-full border border-[color:var(--border)]
                        bg-[color:var(--background)]
                        px-3 py-1 text-sm
                        text-[color:var(--foreground)]
                      "
                    >
                      <span className="mr-1 text-[color:var(--accent)]">•</span>
                      {c}
                    </span>
                  ))
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
