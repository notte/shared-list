import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getUserDataServer } from "./services/storage/user.server"

export async function proxy(request: NextRequest) {
  const url = request.nextUrl.clone()
  const userData = await getUserDataServer()
  const userId = userData?.userId

  if (url.pathname.startsWith("/lists") && !userId) {
    url.pathname = "/forbidden"
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/lists/:path*"],
}
