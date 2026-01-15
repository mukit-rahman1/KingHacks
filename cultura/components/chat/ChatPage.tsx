"use client"

import { useEffect, useState } from "react"

declare global {
  interface Window {
    chatbase?: (...args: unknown[]) => void
  }
}

const loadChatbaseScript = (chatbotId: string, domain: string) =>
  new Promise<void>((resolve, reject) => {
    if (typeof window === "undefined") return resolve()
    if (document.getElementById(chatbotId)) return resolve()

    const script = document.createElement("script")
    script.src = "https://www.chatbase.co/embed.min.js"
    script.id = chatbotId
    script.setAttribute("domain", domain)
    script.onload = () => resolve()
    script.onerror = () => reject(new Error("Chatbase script failed to load."))
    document.body.appendChild(script)
  })

export default function ChatPage() {
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const chatbotId = process.env.NEXT_PUBLIC_CHATBASE_CHATBOT_ID
    const domain = process.env.NEXT_PUBLIC_CHATBASE_DOMAIN || "www.chatbase.co"

    if (!chatbotId) {
      setError("Chatbot is not configured.")
      return
    }

    let canceled = false

    const initChatbase = async () => {
      try {
        if (
          !window.chatbase ||
          window.chatbase("getState") !== "initialized"
        ) {
          window.chatbase = ((...args: unknown[]) => {
            ;(window.chatbase as { q?: unknown[] }).q =
              (window.chatbase as { q?: unknown[] }).q ?? []
            ;(window.chatbase as { q?: unknown[] }).q?.push(args)
          }) as typeof window.chatbase
        }

        await loadChatbaseScript(chatbotId, domain)

        const response = await fetch("/api/chatbase/token", {
          method: "POST",
        })

        if (!response.ok) return
        const payload = (await response.json()) as { token?: string }
        if (payload.token && !canceled) {
          window.chatbase?.("identify", { token: payload.token })
        }
      } catch (err) {
        if (!canceled) {
          setError(err instanceof Error ? err.message : "Chatbase failed.")
        }
      }
    }

    void initChatbase()

    return () => {
      canceled = true
    }
  }, [])

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-4xl flex-col gap-6 px-4 sm:px-6 lg:px-8">
      <header>
        <h1 className="font-header text-4xl font-extrabold tracking-tight text-[color:var(--foreground)]">
          Community chat
        </h1>
        <p className="mt-2 text-[color:var(--muted-foreground)]">
          Ask about clubs, tags, and upcoming events.
        </p>
      </header>

      <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-4 text-sm text-[color:var(--muted-foreground)]">
        The chat widget should appear in the bottom-right corner.
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  )
}
