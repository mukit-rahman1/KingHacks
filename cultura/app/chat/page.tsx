"use client"

import Link from "next/link"
import { FormEvent, useEffect, useMemo, useRef, useState } from "react"

type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const suggestedPrompts = [
  { id: "p1", label: "Which clubs match dance and beginner tags?" },
  { id: "p2", label: "What events are happening this weekend?" },
  { id: "p3", label: "Find cultural festivals near downtown" },
]

const formatTime = (d: Date) =>
  d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const listRef = useRef<HTMLDivElement | null>(null)
  const endRef = useRef<HTMLDivElement | null>(null)

  const showEmpty = messages.length === 0

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages.length])

  const handlePromptClick = (text: string) => {
    setInput(text)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const message = input.trim()
    if (!message || isSending) return

    setInput("")
    setError(null)
    setIsSending(true)

    const userMsg: ChatMessage = {
      id: `${Date.now()}-u`,
      role: "user",
      content: message,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMsg])

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
      const replyText = payload.reply?.trim() || "I don't have that information yet."

      const botMsg: ChatMessage = {
        id: `${Date.now()}-a`,
        role: "assistant",
        content: replyText,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMsg])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to reach chat.")
    } finally {
      setIsSending(false)
    }
  }

  const typing = useMemo(() => isSending, [isSending])

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6 lg:px-8">
      {/* ===== Header (revamped) ===== */}
      <div className="mx-auto max-w-4xl pt-10 text-center">
        <div
          className="
            mx-auto inline-flex items-center gap-2
            rounded-full border border-[color:var(--border)]
            bg-[color:var(--secondary)]
            px-4 py-2 text-sm font-semibold
            text-[color:var(--primary)]
          "
        >
          <span
            className="
              inline-flex h-6 w-6 items-center justify-center
              rounded-full bg-[color:var(--primary)] text-[color:var(--primary-foreground)]
              text-xs
            "
          >
            ✦
          </span>
          AI-Powered Discovery
        </div>

        <h1 className="mt-6 font-header text-5xl font-extrabold tracking-tight text-[color:var(--foreground)] md:text-6xl">
          Community <span className="text-heritage">Chat</span>
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-lg text-[color:var(--muted-foreground)]">
          Ask about clubs, events, and tags — and discover cultural experiences tailored to you.
        </p>

        <div className="mt-4 text-sm text-[color:var(--muted-foreground)]">
          Or{" "}
          <Link className="font-semibold text-[color:var(--primary)] hover:opacity-90" href="/discover">
            browse events
          </Link>
          .
        </div>
      </div>

      {/* ===== Chat Card ===== */}
      <section
        className="
          relative overflow-hidden
          rounded-3xl border border-[color:var(--border)]
          bg-[color:var(--card)]
          shadow-sm
          pb-4
        "
      >
        {/* Decorative glows */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[color:var(--brand-accent)]/12 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 -bottom-24 h-64 w-64 rounded-full bg-[color:var(--brand-primary)]/10 blur-3xl" />

        {/* Messages area */}
        <div
          ref={listRef}
          className="
            relative
            min-h-[420px] max-h-[560px]
            overflow-y-auto
            p-6
          "
        >
          {showEmpty ? (
            <div className="flex h-full flex-col items-center justify-center py-12 text-center">
              <div
                className="
                  mb-6 grid h-20 w-20 place-items-center rounded-full
                  bg-gradient-to-br from-[color:var(--brand-primary)] to-[color:var(--brand-accent)]
                  shadow-md
                "
              >
                <span className="text-xl font-bold text-white">💬</span>
              </div>

              <h3 className="font-header text-2xl font-bold text-[color:var(--foreground)]">
                Start a conversation
              </h3>

              <p className="mt-2 max-w-md text-[color:var(--muted-foreground)]">
                Ask anything about cultural events, communities, or find something new to do.
              </p>

              {/* Suggested prompts */}
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                {suggestedPrompts.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handlePromptClick(p.label)}
                    className="
                      group rounded-full border border-[color:var(--border)]
                      bg-[color:var(--background)]
                      px-4 py-2.5 text-sm font-semibold
                      text-[color:var(--muted-foreground)]
                      transition
                      hover:border-[color:var(--primary)]/40 hover:bg-[color:var(--secondary)]
                      hover:text-[color:var(--foreground)]
                    "
                  >
                    {p.label}
                    <span className="ml-2 inline-block transition-transform group-hover:translate-x-0.5">
                      →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((m) => {
                const isUser = m.role === "user"
                return (
                  <div key={m.id} className={isUser ? "flex justify-end" : "flex justify-start"}>
                    <div
                      className={[
                        "max-w-[82%] rounded-2xl px-5 py-3",
                        isUser
                          ? "bg-gradient-to-r from-[#a02237] to-[#f9a81c] text-white shadow-md"
                          : "border border-[color:var(--border)] bg-[color:var(--background)] text-[color:var(--foreground)]",
                      ].join(" ")}
                    >
                      <p className="text-sm leading-relaxed">{m.content}</p>
                      <span className={["mt-1 block text-xs", isUser ? "text-white/75" : "text-[color:var(--muted-foreground)]"].join(" ")}>
                        {formatTime(m.timestamp)}
                      </span>
                    </div>
                  </div>
                )
              })}

              {/* Typing indicator */}
              {typing ? (
                <div className="flex justify-start">
                  <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)] px-5 py-3">
                    <div className="flex gap-1.5">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-[color:var(--primary)]/60" style={{ animationDelay: "0ms" }} />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-[color:var(--primary)]/60" style={{ animationDelay: "150ms" }} />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-[color:var(--primary)]/60" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              ) : null}

              <div ref={endRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="border-t border-[color:var(--border)] bg-[color:var(--card)]/20 p-4 backdrop-blur pb-0 ">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about hobbies, clubs, or tags…"
              className="
                w-full rounded-xl border border-[color:var(--input)]
                bg-[color:var(--background)]
                px-4 py-3 text-sm text-[color:var(--foreground)]
                placeholder:text-[color:var(--muted-foreground)]
                focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]
                focus:ring-offset-2 focus:ring-offset-[color:var(--card)]
              "
            />
            <button
              type="submit"
              disabled={isSending || !input.trim()}
              className="
                shrink-0 rounded-xl
                bg-[color:var(--primary)]
                px-6 py-3 text-sm font-semibold
                text-[color:var(--primary-foreground)]
                shadow-sm transition
                hover:brightness-105 active:scale-[0.99]
                disabled:opacity-60
              "
            >
              {isSending ? "Sending…" : "Send"}
            </button>
          </form>

          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        </div>
      </section>

      {/* Quick tip */}
      <p className="text-center text-sm text-[color:var(--muted-foreground)]">
        <span className="font-semibold text-[color:var(--primary)]">Pro tip:</span>{" "}
        Ask for a culture + interest + date range (example: “Caribbean food events next week”).
      </p>

      <div className="h-10" />
    </div>
  )
}
