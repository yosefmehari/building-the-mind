import { NextResponse } from "next/server";
import { SUPPORTED_CURRENCIES } from "@/lib/currencies";

const DEFAULT_CURRENCY = "USD";

function isValidCurrency(code: unknown): code is string {
  return typeof code === "string" && SUPPORTED_CURRENCIES.some((c) => c.code === code);
}

export async function GET(request: Request) {
  const cookieCurrency =
    request.headers.get("cookie")?.match(/(?:^|;\s*)preferred_currency=([^;]+)/)?.[1] ?? "";
  return NextResponse.json({
    currency: isValidCurrency(cookieCurrency) ? cookieCurrency : DEFAULT_CURRENCY,
  });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { currency?: unknown } | null;
  const currency = isValidCurrency(body?.currency) ? body!.currency : null;
  if (!currency)
    return NextResponse.json({ error: "Unsupported currency." }, { status: 400 });

  const response = NextResponse.json({ currency });
  response.cookies.set("preferred_currency", currency as string, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  return response;
}
