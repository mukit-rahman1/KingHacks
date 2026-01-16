"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { supabase } from "@/lib/supabase/client"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setIsSubmitting(false)
      return
    }

    const { data } = await supabase.auth.getSession()
    const accessToken = data.session?.access_token

    if (accessToken) {
      const orgResponse = await fetch("/api/organizations", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (orgResponse.ok) {
        const payload = (await orgResponse.json()) as {
          organization: { id: string } | null
        }
        if (payload.organization) {
          router.push("/discover")
          setIsSubmitting(false)
          return
        }
      }

      const profileResponse = await fetch("/api/individuals", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (profileResponse.ok) {
        const payload = (await profileResponse.json()) as {
          profile: { username: string } | null
        }
        if (payload.profile?.username) {
          router.push("/discover")
        } else {
          router.push("/onboarding/select")
        }
      } else {
        router.push("/onboarding/select")
      }
    } else {
      router.push("/onboarding/select")
    }

    setIsSubmitting(false)
  }

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-4">
      <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
        <h1 className="font-header text-3xl font-bold text-foreground">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to discover events and communities.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-foreground">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              required
            />
          </label>

          <label className="block text-sm font-medium text-foreground">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              required
            />
          </label>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-4 text-sm text-muted-foreground">
          New here?{" "}
          <Link href="/signup" className="font-semibold text-primary">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}
