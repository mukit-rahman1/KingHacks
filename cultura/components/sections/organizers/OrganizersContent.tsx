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

      const payload = (await response.json()) as { organizations: OrganizerItem[] }
      setOrganizers(payload.organizations ?? [])
      setIsLoading(false)
    }

    void loadOrganizers()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Organizers</h1>
        <p className="mt-2 text-zinc-600">
          The people & groups hosting community events.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-zinc-500">Loading organizers...</p>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : organizers.length === 0 ? (
        <p className="text-sm text-zinc-500">No organizers yet.</p>
      ) : (
      <div className="grid gap-4 md:grid-cols-2">
        {organizers.map((o) => (
          <article key={o.id} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">{o.name}</h3>
                <p className="mt-1 text-sm text-zinc-600">
                  {o.description || "No description yet."}
                </p>
              </div>
              <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-sm">
                {fallbackType}
              </span>
            </div>

            <div className="mt-4">
              <p className="text-sm font-medium">Communities served</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {o.tags.length === 0 ? (
                  <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-sm">
                    No tags yet
                  </span>
                ) : (
                  o.tags.map((c) => (
                    <span key={c} className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-sm">
                      {c}
                    </span>
                  ))
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
      )}
    </div>
  )
}
