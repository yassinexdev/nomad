import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const DASHBOARD_COOKIE = "dashboard_session";
const DASHBOARD_SECRET = process.env.DASHBOARD_SECRET ?? "";

function hasValidSession(request: NextRequest): boolean {
  const cookie = request.cookies.get(DASHBOARD_COOKIE);
  return !!cookie && !!DASHBOARD_SECRET && cookie.value === DASHBOARD_SECRET;
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard")) {
    // Login page: redirect to dashboard if already logged in
    if (pathname === "/dashboard/login") {
      if (hasValidSession(request)) {
        return NextResponse.redirect(new URL("/dashboard/orders", request.url));
      }
      return NextResponse.next();
    }

    // All other dashboard routes: require valid session
    if (!hasValidSession(request)) {
      return NextResponse.redirect(new URL("/dashboard/login", request.url));
    }

    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)" ],
};
