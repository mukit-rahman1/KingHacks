import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const normalizeTags = (value: unknown) =>
  Array.isArray(value)
    ? value.filter((item) => typeof item === "string")
    : [];

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json(
      { error: "Missing authorization header." },
      { status: 401 }
    );
  }

  const accessToken = authHeader.replace("Bearer ", "").trim();
  if (!accessToken) {
    return NextResponse.json(
      { error: "Missing access token." },
      { status: 401 }
    );
  }

  const supabase = createSupabaseServerClient(accessToken);
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return NextResponse.json(
      { error: "Unable to load user session." },
      { status: 401 }
    );
  }

  const { data: profile, error: profileError } = await supabase
    .from("individual_profiles")
    .select("username, tags")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json(
      { error: profileError.message },
      { status: 400 }
    );
  }

  return NextResponse.json({
    profile: profile
      ? {
          username: profile.username ?? "",
          tags: normalizeTags(profile.tags),
        }
      : null,
  });
}

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json(
      { error: "Missing authorization header." },
      { status: 401 }
    );
  }

  const accessToken = authHeader.replace("Bearer ", "").trim();
  if (!accessToken) {
    return NextResponse.json(
      { error: "Missing access token." },
      { status: 401 }
    );
  }

  const body = await request.json();
  const username =
    typeof body.username === "string" ? body.username.trim() : "";
  const tags = Array.isArray(body.tags) ? body.tags : [];

  if (!username) {
    return NextResponse.json(
      { error: "Username is required." },
      { status: 400 }
    );
  }

  const supabase = createSupabaseServerClient(accessToken);
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return NextResponse.json(
      { error: "Unable to load user session." },
      { status: 401 }
    );
  }

  const { error: upsertError } = await supabase
    .from("individual_profiles")
    .upsert(
      {
        user_id: userData.user.id,
        username,
        tags,
      },
      { onConflict: "user_id" }
    );

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
