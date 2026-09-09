"use client";

import { useActionState } from "react";
import { Mail, LockKeyhole, LogIn } from "lucide-react";
import { login, type LoginState } from "@/app/actions/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, undefined);

  return (
    <form action={action} className="space-y-5">
      <Input
        label="Administrator email"
        name="email"
        type="email"
        autoComplete="username"
        defaultValue="yosefmehari2404@gmail.com"
        required
        leftIcon={<Mail className="h-4 w-4" />}
      />
      <Input
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="Enter your password"
        minLength={8}
        required
        leftIcon={<LockKeyhole className="h-4 w-4" />}
      />
      {state?.error && (
        <p role="alert" className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
          {state.error}
        </p>
      )}
      <Button type="submit" variant="primary" className="w-full" disabled={pending} leftIcon={<LogIn className="h-4 w-4" />}>
        {pending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
