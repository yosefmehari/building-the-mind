import { NextResponse } from "next/server";
import { defaultLocale, isLocale } from "@/lib/i18n/config";

export async function GET(request: Request) {
  const cookieLocale = request.headers.get("cookie")?.match(/(?:^|;\s*)locale=([^;]+)/)?.[1] ?? "";
  return NextResponse.json({ locale: isLocale(cookieLocale) ? cookieLocale : defaultLocale });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { locale?: unknown } | null;
  const locale = typeof body?.locale === "string" && isLocale(body.locale) ? body.locale : null;
  if (!locale) return NextResponse.json({ error: "Unsupported locale." }, { status: 400 });

  const response = NextResponse.json({ locale });
  response.cookies.set("locale", locale, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  return response;
}
