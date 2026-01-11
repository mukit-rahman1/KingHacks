import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

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

  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .select("id, name, description, tags")
    .eq("owner_id", userData.user.id)
    .maybeSingle();

  if (orgError) {
    return NextResponse.json({ error: orgError.message }, { status: 400 });
  }

  return NextResponse.json({ organization: org ?? null });
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
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const tags = Array.isArray(body.tags) ? body.tags : [];
  const description =
    typeof body.description === "string" ? body.description.trim() : "";

  if (!name) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  const supabase = createSupabaseServerClient(accessToken);
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return NextResponse.json(
      { error: "Unable to load user session." },
      { status: 401 }
    );
  }

  const { data: existingOrg, error: existingError } = await supabase
    .from("organizations")
    .select("id, slug")
    .eq("owner_id", userData.user.id)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json(
      { error: existingError.message },
      { status: 400 }
    );
  }

  if (existingOrg) {
    const { error: updateError } = await supabase
      .from("organizations")
      .update({
        name,
        description,
        tags,
      })
      .eq("id", existingOrg.id);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, id: existingOrg.id });
  }

  const slugBase = toSlug(name) || "org";
  const slug = `${slugBase}-${userData.user.id.slice(0, 6)}`;

  const { data: org, error: insertError } = await supabase
    .from("organizations")
    .insert({
      owner_id: userData.user.id,
      name,
      slug,
      description,
      tags,
      events: [],
    })
    .select("id")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, id: org.id });
}
