import { NextResponse } from "next/server";

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

//Normalize Tags Function
const normalizeTags = (value: unknown) =>
  Array.isArray(value)
    ? value.filter((item) => typeof item === "string")
    : [];

//Has Overlap Function
const hasOverlap = (left: string[], right: string[]) =>
  left.some((item) => right.includes(item));

//Get Events Function
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const accessToken = authHeader?.replace("Bearer ", "").trim();

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

  //Filter Events
  const filteredEvents =
    orgTags.length === 0
      ? events
      : events.filter((event) => hasOverlap(event.tags, orgTags));

  return NextResponse.json({ events: filteredEvents });
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
    .select("id, events")
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

  return NextResponse.json({ ok: true, event: newEvent });
}
