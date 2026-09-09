import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const startTime = Date.now();
  try {
    const [courseCount] = await Promise.all([
      db.course.count(),
    ]);
    const latency = Date.now() - startTime;

    return NextResponse.json({
      status: "healthy",
      database: "PostgreSQL Connected ✓",
      latency: `${latency}ms`,
      stats: {
        courses: courseCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const latency = Date.now() - startTime;
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        status: "unhealthy",
        database: "Disconnected",
        error: message,
        latency: `${latency}ms`,
        help: "Check DATABASE_URL in .env.local and ensure PostgreSQL is running.",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
