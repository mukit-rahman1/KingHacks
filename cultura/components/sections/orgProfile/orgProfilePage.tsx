"use client"

import { FormEvent, useEffect, useState } from "react"

import { supabase } from "@/lib/supabase/client"

type OrgEvent = {
  id: string
  title?: string
  description?: string
  date?: string
  tags?: string[]
}

type OrgProfile = {
  id: string
  name: string
  description: string
  tags: string[]
  events?: OrgEvent[]
  logo_url?: string
}

const parseTags = (value: string) =>
  value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)

export default function OrgProfilePage() {
  const [orgProfile, setOrgProfile] = useState<OrgProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState("")
  const [logoUrl, setLogoUrl] = useState("")
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  const [eventTitle, setEventTitle] = useState("")
  const [eventDescription, setEventDescription] = useState("")
  const [eventDate, setEventDate] = useState("")
  const [eventTags, setEventTags] = useState("")
  const [eventImageUrl, setEventImageUrl] = useState("")
  const [isUploadingEventImage, setIsUploadingEventImage] = useState(false)
  const [isSavingEvent, setIsSavingEvent] = useState(false)

  const orgEvents = Array.isArray(orgProfile?.events) ? orgProfile?.events ?? [] : []

  const loadOrgProfile = async () => {
    setIsLoading(true)
    setError(null)

    const { data } = await supabase.auth.getSession()
    const accessToken = data.session?.access_token
    if (!accessToken) {
      setError("Please sign in as an organization.")
      setIsLoading(false)
      return
    }

    const response = await fetch("/api/organizations", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      setError("Unable to load organization profile.")
      setIsLoading(false)
      return
    }

    const payload = (await response.json()) as {
      organization: OrgProfile | null
    }

    if (!payload.organization) {
      setError("Organization profile not found.")
      setIsLoading(false)
      return
    }

    setOrgProfile(payload.organization)
    setName(payload.organization.name ?? "")
    setDescription(payload.organization.description ?? "")
    setTags((payload.organization.tags ?? []).join(", "))
    setLogoUrl(payload.organization.logo_url ?? "")
    setIsLoading(false)
  }

  useEffect(() => {
    void loadOrgProfile()
  }, [])

  const handleSaveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsSavingProfile(true)

    const { data } = await supabase.auth.getSession()
    const accessToken = data.session?.access_token
    if (!accessToken) {
      setError("Please sign in again.")
      setIsSavingProfile(false)
      return
    }

    const response = await fetch("/api/organizations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        name,
        description,
        tags: parseTags(tags),
        logoUrl,
      }),
    })

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string }
      setError(payload.error ?? "Unable to update organization.")
      setIsSavingProfile(false)
      return
    }

    await loadOrgProfile()
    setIsSavingProfile(false)
  }

  const handleCreateEvent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsSavingEvent(true)

    const { data } = await supabase.auth.getSession()
    const accessToken = data.session?.access_token
    if (!accessToken) {
      setError("Please sign in again.")
      setIsSavingEvent(false)
      return
    }

    const response = await fetch("/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        title: eventTitle,
        description: eventDescription,
        date: eventDate,
        tags: parseTags(eventTags),
        imageUrl: eventImageUrl,
      }),
    })

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string }
      setError(payload.error ?? "Unable to create event.")
      setIsSavingEvent(false)
      return
    }

    setEventTitle("")
    setEventDescription("")
    setEventDate("")
    setEventTags("")
    setEventImageUrl("")
    await loadOrgProfile()
    setIsSavingEvent(false)
  }

  const uploadAsset = async (file: File, type: "org" | "event") => {
    const { data } = await supabase.auth.getSession()
    const accessToken = data.session?.access_token
    if (!accessToken) {
      throw new Error("Please sign in again.")
    }

    const formData = new FormData()
    formData.append("file", file)
    formData.append("type", type)

    const response = await fetch("/api/uploads", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Upload failed.")
    }

    const payload = (await response.json()) as { url?: string }
    if (!payload.url) {
      throw new Error("Upload failed.")
    }

    return payload.url
  }

  const handleRemoveEvent = async (eventId: string) => {
    setError(null)
    const { data } = await supabase.auth.getSession()
    const accessToken = data.session?.access_token
    if (!accessToken) {
      setError("Please sign in again.")
      return
    }

    const response = await fetch("/api/events", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ eventId }),
    })

    if (!response.ok) {
      setError("Unable to remove event.")
      return
    }

    await loadOrgProfile()
  }

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-4xl items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">Loading profile...</p>
      </div>
    )
  }

  if (error && !orgProfile) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-4xl items-center justify-center px-4">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
      <header>
        <h1 className="font-header text-4xl font-extrabold tracking-tight text-[color:var(--foreground)]">
          Organization dashboard
        </h1>
        <p className="mt-2 text-[color:var(--muted-foreground)]">
          Manage your organization profile and events.
        </p>
      </header>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <section className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[color:var(--foreground)]">
          Organization profile
        </h2>
        <form onSubmit={handleSaveProfile} className="mt-4 grid gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <p className="text-sm font-medium text-[color:var(--foreground)]">
                Logo
              </p>
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Organization logo"
                  className="mt-2 h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <p className="mt-2 text-xs text-[color:var(--muted-foreground)]">
                  No logo yet.
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={async (event) => {
                  const file = event.target.files?.[0]
                  if (!file) return
                  setIsUploadingLogo(true)
                  try {
                    const url = await uploadAsset(file, "org")
                    setLogoUrl(url)
                  } catch (err) {
                    setError(
                      err instanceof Error ? err.message : "Upload failed."
                    )
                  } finally {
                    setIsUploadingLogo(false)
                  }
                }}
                className="text-sm text-muted-foreground"
              />
              <span className="text-xs text-muted-foreground">
                {isUploadingLogo ? "Uploading..." : "Upload logo"}
              </span>
            </div>
          </div>
          <label className="text-sm font-medium text-[color:var(--foreground)]">
            Name
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--background)] px-3 py-2 text-sm"
              required
            />
          </label>

          <label className="text-sm font-medium text-[color:var(--foreground)]">
            Description
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="mt-2 w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--background)] px-3 py-2 text-sm"
              rows={3}
            />
          </label>

          <label className="text-sm font-medium text-[color:var(--foreground)]">
            Tags
            <input
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              className="mt-2 w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--background)] px-3 py-2 text-sm"
              placeholder="sports, rugby, expert"
            />
          </label>

          <button
            type="submit"
            disabled={isSavingProfile}
            className="w-full rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60 sm:w-fit"
          >
            {isSavingProfile ? "Saving..." : "Save changes"}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[color:var(--foreground)]">
          Create a new event
        </h2>
        <form onSubmit={handleCreateEvent} className="mt-4 grid gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <p className="text-sm font-medium text-[color:var(--foreground)]">
                Event image
              </p>
              {eventImageUrl ? (
                <img
                  src={eventImageUrl}
                  alt="Event"
                  className="mt-2 h-16 w-16 rounded-2xl object-cover"
                />
              ) : (
                <p className="mt-2 text-xs text-[color:var(--muted-foreground)]">
                  No image yet.
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={async (event) => {
                  const file = event.target.files?.[0]
                  if (!file) return
                  setIsUploadingEventImage(true)
                  try {
                    const url = await uploadAsset(file, "event")
                    setEventImageUrl(url)
                  } catch (err) {
                    setError(
                      err instanceof Error ? err.message : "Upload failed."
                    )
                  } finally {
                    setIsUploadingEventImage(false)
                  }
                }}
                className="text-sm text-muted-foreground"
              />
              <span className="text-xs text-muted-foreground">
                {isUploadingEventImage ? "Uploading..." : "Upload image"}
              </span>
            </div>
          </div>
          <label className="text-sm font-medium text-[color:var(--foreground)]">
            Title
            <input
              value={eventTitle}
              onChange={(event) => setEventTitle(event.target.value)}
              className="mt-2 w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--background)] px-3 py-2 text-sm"
              required
            />
          </label>

          <label className="text-sm font-medium text-[color:var(--foreground)]">
            Description
            <textarea
              value={eventDescription}
              onChange={(event) => setEventDescription(event.target.value)}
              className="mt-2 w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--background)] px-3 py-2 text-sm"
              rows={3}
            />
          </label>

          <label className="text-sm font-medium text-[color:var(--foreground)]">
            Date
            <input
              type="date"
              value={eventDate}
              onChange={(event) => setEventDate(event.target.value)}
              className="mt-2 w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--background)] px-3 py-2 text-sm"
            />
          </label>

          <label className="text-sm font-medium text-[color:var(--foreground)]">
            Tags
            <input
              value={eventTags}
              onChange={(event) => setEventTags(event.target.value)}
              className="mt-2 w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--background)] px-3 py-2 text-sm"
              placeholder="tryhard, rugby, sports"
            />
          </label>

          <button
            type="submit"
            disabled={isSavingEvent}
            className="w-full rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60 sm:w-fit"
          >
            {isSavingEvent ? "Creating..." : "Create event"}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[color:var(--foreground)]">
          My events
        </h2>
        {orgEvents.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            No events yet.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {orgEvents.map((event) => (
              <div
                key={event.id}
                className="flex flex-col gap-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--background)] p-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-[color:var(--foreground)]">
                    {event.title ?? "Event"}
                  </p>
                  <p className="mt-1 text-xs text-[color:var(--muted-foreground)]">
                    {event.description ?? "No description"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveEvent(event.id)}
                  className="self-start rounded-full border border-[color:var(--border)] px-3 py-1 text-xs font-semibold text-red-600 hover:bg-[color:var(--muted)]"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
