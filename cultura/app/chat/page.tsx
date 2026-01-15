"use client"

import { FormEvent, useRef, useState } from "react"

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
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    })
  }

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
      scrollToBottom()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to reach chat.")
    } finally {
      setIsSending(false)
    }
  }

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

      <div
        ref={listRef}
        className="flex-1 space-y-4 overflow-y-auto rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-4 shadow-sm"
      >
        {messages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[color:var(--border)] px-4 py-6 text-sm text-[color:var(--muted-foreground)]">
            Ask something like: “Which clubs match dance and beginner tags?”
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={
                message.role === "user"
                  ? "ml-auto w-fit max-w-[80%] rounded-2xl bg-[color:var(--primary)] px-4 py-2 text-sm text-[color:var(--primary-foreground)]"
                  : "mr-auto w-fit max-w-[80%] rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)] px-4 py-2 text-sm text-[color:var(--foreground)]"
              }
            >
              {message.content}
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask about hobbies, clubs, or tags."
          className="flex-1 rounded-full border border-[color:var(--input)] bg-[color:var(--background)] px-4 py-2 text-sm text-[color:var(--foreground)] placeholder:text-[color:var(--muted-foreground)]"
        />
        <button
          type="submit"
          disabled={isSending}
          className="rounded-full bg-[color:var(--primary)] px-5 py-2 text-sm font-semibold text-[color:var(--primary-foreground)] disabled:opacity-60"
        >
          {isSending ? "Sending..." : "Send"}
        </button>
      </form>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  )
}
