import { NextResponse } from "next/server";

import { uploadBackboardDocument } from "@/lib/backboard/client";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "File is required." },
      { status: 400 }
    );
  }

  const result = await uploadBackboardDocument(file);
  if (!result.ok) {
    return NextResponse.json(
      { error: "Upload failed.", detail: result.error ?? null },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
