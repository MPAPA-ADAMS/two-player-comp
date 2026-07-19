import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { pin } = (await request.json()) as { pin?: string };
  const expectedPin = process.env.ADMIN_PIN;
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;

  if (!expectedPin || !sessionSecret) {
    return NextResponse.json({ error: "Admin environment variables are not configured." }, { status: 500 });
  }
  if (pin !== expectedPin) {
    return NextResponse.json({ error: "Invalid PIN." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("ta_admin", sessionSecret, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 12 });
  return response;
}
