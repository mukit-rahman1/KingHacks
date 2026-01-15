import { NextResponse } from "next/server";

import { cosBucket, cosClient, cosPublicBaseUrl } from "@/lib/cos/client";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const safeName = (value: string) =>
  value.replace(/[^a-zA-Z0-9._-]/g, "-");

export async function POST(request: Request) {
  if (!cosClient) {
    return NextResponse.json(
      { error: "Cloud storage not configured." },
      { status: 500 }
    );
  }

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

  const formData = await request.formData();
  const file = formData.get("file");
  const type = formData.get("type");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File is required." }, { status: 400 });
  }

  const typeValue = typeof type === "string" ? type : "misc";
  let prefix = `${typeValue}/${userData.user.id}`;

  if (typeValue === "org") {
    const { data: org } = await supabase
      .from("organizations")
      .select("id")
      .eq("owner_id", userData.user.id)
      .maybeSingle();

    if (org?.id) {
      prefix = `${typeValue}/${org.id}`;
    }
  }

  const key = `${prefix}/${crypto.randomUUID()}-${safeName(file.name)}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const contentType = file.type || "application/octet-stream";

  try {
    await cosClient
      .putObject({
        Bucket: cosBucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        ACL: "public-read",
      })
      .promise();
  } catch (error) {
    return NextResponse.json(
      { error: "Upload failed." },
      { status: 502 }
    );
  }

  return NextResponse.json({
    url: `${cosPublicBaseUrl}/${key}`,
  });
}
