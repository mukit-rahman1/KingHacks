import { NextResponse } from "next/server";

import { sendBackboardChatMessage } from "@/lib/backboard/client";

export async function POST(request: Request) {
  const body = (await request.json()) as { message?: unknown };
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!message) {
    return NextResponse.json(
      { error: "Message is required." },
      { status: 400 }
    );
  }

  const result = await sendBackboardChatMessage({ message });
  if (!result.ok) {
    console.error("Backboard chat failed:", result.error ?? "unknown error");
    return NextResponse.json(
      {
        error: "Unable to reach assistant.",
        detail: result.error ?? null,
      },
      { status: 502 }
    );
  }

  return NextResponse.json({ reply: result.reply });
}
