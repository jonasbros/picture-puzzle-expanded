import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { User } from "@supabase/supabase-js";

export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const pathname = request.nextUrl.pathname;

  try {
    checkIsLoggedIn(user, pathname);
  } catch (e) {
    console.log(e);
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - /auth/callback (OAuth callback)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

function checkIsLoggedIn(user: User | null, pathname: string) {
  const protectedPaths = ["/dashboard", "/profile", "/settings"]; // update later for real paths

  if (protectedPaths.includes(pathname) && !user) {
    throw new Error("User is not logged in");
  }
}
