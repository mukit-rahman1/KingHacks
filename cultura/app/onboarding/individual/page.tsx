"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"

import { supabase } from "@/lib/supabase/client"

const parseTags = (value: string) =>
  value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)

export default function IndividualOnboardingPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [tags, setTags] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const { data } = await supabase.auth.getSession()
    const accessToken = data.session?.access_token

    if (!accessToken) {
      setError("Please sign in to continue.")
      setIsSubmitting(false)
      return
    }

    const response = await fetch("/api/individuals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        username,
        tags: parseTags(tags),
      }),
    })

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string }
      setError(payload.error ?? "Unable to save profile.")
      setIsSubmitting(false)
      return
    }

    router.push("/events")
  }

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-xl flex-col justify-center px-4">
      <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
        <h1 className="font-header text-3xl font-bold text-foreground">
          Complete your profile
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose a username and add a few interests to personalize events.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-foreground">
            Username
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              placeholder="e.g. kingstonrunner"
              required
            />
          </label>

          <label className="block text-sm font-medium text-foreground">
            Interests (comma-separated)
            <input
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              placeholder="running, dance, volunteering"
            />
          </label>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {isSubmitting ? "Saving..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  )
}
