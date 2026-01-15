"use client"

import { FormEvent, useEffect, useRef, useState } from "react"

type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)

  const scrollToBottom = () => {
    const el = listRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
  }

  useEffect(() => {
    // keep view pinned when messages update
    scrollToBottom()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const message = input.trim()
    if (!message || isSending) return

    setInput("")
    setError(null)
    setIsSending(true)
    setMessages((prev) => [...prev, { role: "user", content: message }])

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      })

      if (!response.ok) {
        const payload = (await response.json()) as {
          error?: string
          detail?: string | null
        }
        throw new Error(payload.detail ?? payload.error ?? "Unable to reach chat.")
      }

      const payload = (await response.json()) as { reply?: string }
      const reply = payload.reply?.trim() || "I don't have that information yet."
      setMessages((prev) => [...prev, { role: "assistant", content: reply }])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to reach chat.")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6 lg:px-8">
      {/* Header (matches Categories rhythm) */}
      <div>
        <h1 className="font-header text-4xl font-extrabold mt-5 tracking-tight text-[color:var(--foreground)]">
          Community chat
        </h1>
        <p className="mt-2 max-w-xl text-[color:var(--muted-foreground)]">
          Ask about clubs, tags, and upcoming events.
        </p>
      </div>

      {/* Chat container */}
      <section
        className="
          relative overflow-hidden
          rounded-2xl border border-[color:var(--border)]
          bg-[color:var(--card)]
          p-6 shadow-sm
        "
      >
        {/* Soft accent glow (same system) */}
        <div
          className="
            pointer-events-none absolute -right-24 -top-24 h-56 w-56
            rounded-full bg-[color:var(--brand-accent)]/10 blur-2xl
          "
        />

        <div className="relative flex flex-col gap-4">
          {/* Messages */}
          <div
            ref={listRef}
            className="
              h-[52vh] min-h-[360px]
              space-y-3 overflow-y-auto
              rounded-2xl border border-[color:var(--border)]
              bg-[color:var(--background)]
              p-4
            "
          >
            {messages.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[color:var(--border)] px-4 py-6 text-sm text-[color:var(--muted-foreground)]">
                Ask something like: “Which clubs match dance and beginner tags?”
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={[
                    "w-fit max-w-[85%] rounded-2xl px-4 py-2 text-sm",
                    message.role === "user"
                      ? "ml-auto bg-[color:var(--primary)] text-[color:var(--primary-foreground)]"
                      : "mr-auto border border-[color:var(--border)] bg-[color:var(--card)] text-[color:var(--foreground)]",
                  ].join(" ")}
                >
                  {message.content}
                </div>
              ))
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about hobbies, clubs, or tags."
              className="
                w-full rounded-xl border border-[color:var(--input)]
                bg-[color:var(--background)]
                px-4 py-2 text-sm text-[color:var(--foreground)]
                placeholder:text-[color:var(--muted-foreground)]
                focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)] focus:ring-offset-2 focus:ring-offset-[color:var(--card)]
              "
            />
            <button
              type="submit"
              disabled={isSending}
              className="
                shrink-0 rounded-xl bg-[color:var(--primary)]
                px-5 py-2 text-sm font-semibold text-[color:var(--primary-foreground)]
                shadow-sm transition hover:brightness-105 active:scale-[0.99]
                disabled:opacity-60
              "
            >
              {isSending ? "Sending..." : "Send"}
            </button>
          </form>

          {/* Error */}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>
      </section>
    </div>
  )
}
