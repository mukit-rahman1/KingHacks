import { NextResponse } from "next/server";

import { sendBackboardChatMessage } from "@/lib/backboard/client";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const normalizeTags = (value: unknown) =>
  Array.isArray(value)
    ? value.filter((item) => typeof item === "string")
    : [];

const buildFallbackResponse = (message: string) => {
  const lowered = message.toLowerCase();
  const tokens = lowered.split(/\s+/).filter(Boolean);
  return { lowered, tokens };
};

const formatOrgLine = (org: {
  name: string;
  tags: string[];
}) => `Organization: ${org.name} — Tags: ${org.tags.join(", ")}`;

const noMatchMessage =
  "Sorry, there doesn't seem to be clubs like that right now. Check again later or make one!";

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
  if (result.ok) {
    return NextResponse.json({ reply: result.reply });
  }

  const supabase = createSupabaseServerClient("");
  const { data: organizations, error } = await supabase
    .from("organizations")
    .select("id, name, description, tags, events");

  if (error) {
    console.error("Backboard chat failed:", result.error ?? "unknown error");
    return NextResponse.json(
      {
        error: "Unable to reach assistant.",
        detail: result.error ?? null,
      },
      { status: 502 }
    );
  }

  const { lowered, tokens } = buildFallbackResponse(message);
  const orgMatches =
    (organizations ?? [])
      .map((org) => ({
        name: org.name ?? "Organization",
        description: (org.description ?? "").toLowerCase(),
        tags: normalizeTags(org.tags),
      }))
      .filter((org) => {
        if (!tokens.length) return false;
        if (org.name.toLowerCase().includes(lowered)) return true;
        if (org.description.includes(lowered)) return true;
        return org.tags.some((tag) =>
          tokens.some((token) => tag.toLowerCase().includes(token))
        );
      })
      .slice(0, 5) ?? [];

  if (orgMatches.length === 0) {
    return NextResponse.json({ reply: noMatchMessage });
  }

  const reply = orgMatches.map(formatOrgLine).join("\n");
  return NextResponse.json({ reply });
}
