import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

//Normalize Tags Function
const normalizeTags = (value: unknown) =>
  Array.isArray(value)
    ? value.filter((item) => typeof item === "string")
    : [];

//Get Organizations Function
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const accessToken = authHeader?.replace("Bearer ", "").trim();

  //Create Supabase Server Client
  const supabase = accessToken
    ? createSupabaseServerClient(accessToken)
    : createSupabaseServerClient("");

  //Get Organizations
  const { data: organizations, error } = await supabase
    .from("organizations")
    .select("id, name, description, tags");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  //Format Organizations
  const formatted = (organizations ?? []).map((org) => ({
    id: org.id,
    name: org.name ?? "Organization",
    description: org.description ?? "",
    tags: normalizeTags(org.tags),
  }));

  return NextResponse.json({ organizations: formatted });
}
