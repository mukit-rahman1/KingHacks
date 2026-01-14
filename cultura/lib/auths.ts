"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import type { Role } from "@/lib/types"

const ROLE_COOKIE = "role"
const NAME_COOKIE = "userName"

function asString(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v : ""
}

export async function getSession(): Promise<{ role: Role; userName?: string }> {
  const store = await cookies()

  const role = (store.get(ROLE_COOKIE)?.value as Role | undefined) ?? "guest"
  const userName = store.get(NAME_COOKIE)?.value

  return { role, userName }
}

export async function setSessionAction(formData: FormData) {
  const roleRaw = asString(formData.get("role"))
  const userNameRaw = asString(formData.get("userName")).trim()

  const role: Role =
    roleRaw === "organizer" || roleRaw === "user" || roleRaw === "guest"
      ? roleRaw
      : "guest"

  const store = await cookies()

  store.set(ROLE_COOKIE, role, { path: "/" })

  if (userNameRaw) {
    store.set(NAME_COOKIE, userNameRaw, { path: "/" })
  } else {
    store.delete(NAME_COOKIE)
  }

  redirect("/")
}
