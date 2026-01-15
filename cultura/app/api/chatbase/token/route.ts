import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"

import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function POST() {
  const secret = process.env.CHATBOT_IDENTITY_SECRET
  if (!secret) {
    return NextResponse.json(
      { error: "Chatbase identity secret is missing." },
      { status: 500 }
    )
  }

  const supabase = createSupabaseServerClient("")
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) {
    return NextResponse.json({ token: null })
  }

  const token = jwt.sign(
    {
      user_id: data.user.id,
      email: data.user.email ?? undefined,
    },
    secret,
    { expiresIn: "1h" }
  )

  return NextResponse.json({ token })
}
