import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sessionCookie = req.cookies.get("session")?.value;

  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isRoot = pathname === "/";
  const isDashboardPath = pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const isCompanyPath = pathname === "/company" || pathname.startsWith("/company/");

  if (!sessionCookie && (isRoot || isDashboardPath || isCompanyPath)) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (sessionCookie && (isRoot || isAuthPage)) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/signup",
    "/dashboard/:path*",
    "/company/:path*",
  ],
};
