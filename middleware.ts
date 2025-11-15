import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // Public routes
  const isPublicRoute = pathname.startsWith("/login") || pathname.startsWith("/signup");

  // Redirect logged-in users away from login
  if (isLoggedIn && isPublicRoute) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Redirect non-logged-in users to login
  if (!isLoggedIn && !isPublicRoute && pathname !== "/") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
