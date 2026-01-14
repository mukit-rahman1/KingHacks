import { NextResponse } from "next/server";

import {
  addBackboardMemory,
  isBackboardSearchEnabled,
  searchBackboard,
  uploadBackboardAssistantDocument,
  upsertBackboardDocument,
} from "@/lib/backboard/client";
import { createSupabaseServerClient } from "@/lib/supabase/server";

//Event Input Type
type EventInput = {
  id: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  created_at: string;
};

type EventItem = {
  id: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  orgName: string;
};

//Normalize Tags Function
const normalizeTags = (value: unknown) =>
  Array.isArray(value)
    ? value.filter((item) => typeof item === "string")
    : [];

const buildSearchQuery = (query: string | null, tags: string[]) => {
  if (query && query.trim()) {
    return query.trim();
  }
  return tags.length ? tags.join(" ") : "";
};

const toBackboardEvent = (item: {
  id: string;
  data?: Record<string, unknown>;
}) => {
  const data = item.data ?? {};
  const title =
    typeof data.title === "string"
      ? data.title
      : typeof data.name === "string"
        ? data.name
        : "";
  const description =
    typeof data.description === "string" ? data.description : "";
  const date =
    typeof data.date === "string"
      ? data.date
      : typeof data.starts_at === "string"
        ? data.starts_at
        : "";
  const tags = normalizeTags(data.tags);
  const orgName =
    typeof data.orgName === "string"
      ? data.orgName
      : typeof data.organization === "string"
        ? data.organization
        : "Organization";

  if (!title && !description && !date && tags.length === 0) {
    return null;
  }

  return {
    id: item.id,
    title: title || "Event",
    description,
    date,
    tags,
    orgName,
  };
};

//Get Events Function
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const accessToken = authHeader?.replace("Bearer ", "").trim();
  const url = new URL(request.url);
  const query = url.searchParams.get("q");

  //Create Supabase Server Client
  const supabase = accessToken
    ? createSupabaseServerClient(accessToken)
    : createSupabaseServerClient("");

  //Initialize Organization Tags
  let orgTags: string[] = [];

  //Get Organization Tags
  if (accessToken) {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (!userError && userData.user) {
      const { data: org } = await supabase
        .from("organizations")
        .select("tags")
        .eq("owner_id", userData.user.id)
        .maybeSingle();

      orgTags = normalizeTags(org?.tags);
    }
  }

  //Get Organizations and Events
  const { data: organizations, error } = await supabase
    .from("organizations")
    .select("id, name, tags, events");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  //Format Events
  const events = (organizations ?? []).flatMap((org) => {
    const orgEvents = Array.isArray(org.events) ? org.events : [];
    const orgName = org.name ?? "Organization";

    return orgEvents
      .filter((event) => typeof event === "object" && event !== null)
      .map((event) => ({
        id: event.id ?? `${org.id}-${Math.random().toString(36).slice(2)}`,
        title: event.title ?? "Event",
        description: event.description ?? "",
        date: event.date ?? "",
        tags: normalizeTags(event.tags),
        orgName,
      }));
  });

  const searchQuery = buildSearchQuery(query, orgTags);
  if (isBackboardSearchEnabled() && searchQuery) {
    const { items } = await searchBackboard({
      query: searchQuery,
      limit: 50,
      filters: { type: "event" },
    });

    const backboardEvents = items
      .map((item) => toBackboardEvent(item))
      .filter((item): item is EventItem => Boolean(item));

    if (backboardEvents.length > 0) {
      return NextResponse.json({ events: backboardEvents });
    }

    const ids = new Set(items.map((item) => item.id).filter(Boolean));
    if (ids.size > 0) {
      const filteredByIds = events.filter((event) => ids.has(event.id));
      return NextResponse.json({ events: filteredByIds });
    }
  }

  return NextResponse.json({ events });
}

//Create Event Function
export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json(
      { error: "Missing authorization header." },
      { status: 401 }
    );
  }

  //Create Supabase Server Client
  const accessToken = authHeader.replace("Bearer ", "").trim();
  if (!accessToken) {
    return NextResponse.json(
      { error: "Missing access token." },
      { status: 401 }
    );
  }

  //Get Title, Description, Date, and Tags
  const body = await request.json();
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const description =
    typeof body.description === "string" ? body.description.trim() : "";
  const date = typeof body.date === "string" ? body.date.trim() : "";
  const tags = normalizeTags(body.tags);

  if (!title) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }

  const supabase = createSupabaseServerClient(accessToken);
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return NextResponse.json(
      { error: "Unable to load user session." },
      { status: 401 }
    );
  }

  //Get Organization
  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .select("id, name, events")
    .eq("owner_id", userData.user.id)
    .maybeSingle();

  if (orgError) {
    return NextResponse.json({ error: orgError.message }, { status: 400 });
  }

  if (!org) {
    return NextResponse.json(
      { error: "Organization profile not found." },
      { status: 404 }
    );
  }

  //Get Existing Events and New Event
  const existingEvents = Array.isArray(org.events) ? org.events : [];
  const newEvent: EventInput = {
    id: crypto.randomUUID(),
    title,
    description,
    date,
    tags,
    created_at: new Date().toISOString(),
  };

  //Update Organization Events
  const { error: updateError } = await supabase
    .from("organizations")
    .update({
      events: [...existingEvents, newEvent],
    })
    .eq("id", org.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  const orgName = typeof org.name === "string" ? org.name : "Organization";
  await upsertBackboardDocument({
    id: newEvent.id,
    type: "event",
    text: `${title}\n${description}\n${tags.join(" ")}`.trim(),
    metadata: {
      title,
      description,
      date,
      tags,
      orgName,
    },
  });
  await addBackboardMemory({
    content: `${title}\n${description}\n${tags.join(" ")}`.trim(),
    metadata: {
      type: "event",
      id: newEvent.id,
      title,
      description,
      date,
      tags,
      orgName,
    },
  });
  await uploadBackboardAssistantDocument({
    filename: `event-${newEvent.id}.txt`,
    content: [
      `Event: ${title}`,
      `Organization: ${orgName}`,
      `Description: ${description || "N/A"}`,
      `Date: ${date || "TBD"}`,
      `Tags: ${tags.length ? tags.join(", ") : "N/A"}`,
    ].join("\n"),
  });

  return NextResponse.json({ ok: true, event: newEvent });
}
