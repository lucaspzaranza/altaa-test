import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware simples que:
 * - redireciona não-logados de "/" e "/dashboard/*" para "/login"
 * - redireciona logados de "/" "/login" "/signup" para "/dashboard"
 *
 * Nota: estamos apenas checando a existência do cookie "session".
 * Para validação real do JWT, chame uma API de validação ou verifique no servidor.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sessionCookie = req.cookies.get("session")?.value;

  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isRoot = pathname === "/";
  const isDashboardPath = pathname === "/dashboard" || pathname.startsWith("/dashboard/");

  // 1) Se não estiver logado → redireciona de "/" ou qualquer /dashboard/* para /login
  if (!sessionCookie && (isRoot || isDashboardPath)) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // 2) Se estiver logado → redireciona de "/" ou páginas de auth para /dashboard
  if (sessionCookie && (isRoot || isAuthPage)) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // 3) Caso contrário, segue normalmente
  return NextResponse.next();
}

// Rotas que o middleware deve cobrir
export const config = {
  matcher: ["/", "/dashboard/:path*", "/login", "/signup"],
};
