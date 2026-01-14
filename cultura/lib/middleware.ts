import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const role = req.cookies.get("role")?.value ?? "guest"

  if (req.nextUrl.pathname.startsWith("/organizer")) {
    if (role !== "organizer") {
      const url = req.nextUrl.clone()
      url.pathname = "/login"
      return NextResponse.redirect(url)
    }
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/organizer/:path*"]
}
