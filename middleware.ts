import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = new Set(["/welcome", "/login", "/signup"]);
const PUBLIC_API_PREFIXES = ["/api/auth/"];

function isPublic(pathname: string) {
  if (PUBLIC_PATHS.has(pathname)) return true;
  if (pathname.startsWith("/_next/")) return true;
  if (pathname.startsWith("/favicon")) return true;
  if (PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p))) return true;
  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (isPublic(pathname)) return NextResponse.next();

  const cookie = request.cookies.get("coach_vente_session");
  if (!cookie) {
    const isApi = pathname.startsWith("/api/");
    if (isApi) {
      return NextResponse.json(
        { error: "Non authentifie." },
        { status: 401 }
      );
    }
    const url = request.nextUrl.clone();
    url.pathname = "/welcome";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"]
};
