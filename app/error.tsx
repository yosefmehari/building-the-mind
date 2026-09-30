"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled Application Error:", error);
  }, [error]);

  const isDatabaseError =
    error.message?.toLowerCase().includes("database") ||
    error.message?.toLowerCase().includes("prisma") ||
    error.message?.toLowerCase().includes("connect");

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-20">
      <div className="max-w-md w-full rounded-2xl border border-rose-500/25 bg-slate-900/80 p-8 shadow-2xl text-center space-y-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-400">
          <AlertCircle className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-white">Unable to Load Page</h1>
          <p className="text-sm text-slate-300">
            {isDatabaseError
              ? "The database connection could not be established. If deploying to Vercel, please make sure DATABASE_URL is configured in Project Settings."
              : "A server error occurred. Please try reloading or check back in a moment."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            variant="primary"
            size="md"
            onClick={() => reset()}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Try Again
          </Button>
          <Link href="/">
            <Button variant="secondary" size="md" leftIcon={<Home className="h-4 w-4" />}>
              Go to Home
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
