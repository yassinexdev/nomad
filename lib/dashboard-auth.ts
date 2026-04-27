import { cookies } from "next/headers";

const DASHBOARD_COOKIE = "dashboard_session";

export async function isDashboardAuthed(): Promise<boolean> {
  const secret = process.env.DASHBOARD_SECRET;
  if (!secret) return false;
  const cookieValue = (await cookies()).get(DASHBOARD_COOKIE)?.value;
  return Boolean(cookieValue) && cookieValue === secret;
}

