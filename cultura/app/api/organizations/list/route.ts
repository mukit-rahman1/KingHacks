import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const normalizeTags = (value: unknown) =>
  Array.isArray(value)
    ? value.filter((item) => typeof item === "string")
    : [];

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const accessToken = authHeader?.replace("Bearer ", "").trim();

  const supabase = accessToken
    ? createSupabaseServerClient(accessToken)
    : createSupabaseServerClient("");

  let excludeOwnerId: string | null = null;

  if (accessToken) {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (!userError && userData.user) {
      excludeOwnerId = userData.user.id;
    }
  }

  const query = supabase
    .from("organizations")
    .select("id, name, description, tags, owner_id");

  const { data: organizations, error } = excludeOwnerId
    ? await query.neq("owner_id", excludeOwnerId)
    : await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const formatted = (organizations ?? []).map((org) => ({
    id: org.id,
    name: org.name ?? "Organization",
    description: org.description ?? "",
    tags: normalizeTags(org.tags),
  }));

  return NextResponse.json({ organizations: formatted });
}
