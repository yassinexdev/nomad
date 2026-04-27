import { NextRequest, NextResponse } from "next/server";

const DASHBOARD_COOKIE = "dashboard_session";
const MAX_AGE = 60 * 60 * 8; // 8 hours

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    const expected = process.env.DASHBOARD_PASSWORD;

    if (!expected) {
      return NextResponse.json(
        { error: "Dashboard password not configured" },
        { status: 500 }
      );
    }

    if (!password || password !== expected) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const secret = process.env.DASHBOARD_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: "Dashboard secret not configured" },
        { status: 500 }
      );
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(DASHBOARD_COOKIE, secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: MAX_AGE,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set("dashboard_session", "", { maxAge: 0, path: "/" });
  return response;
}
