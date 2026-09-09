"use client";

import { useActionState } from "react";
import { LogIn, Mail, LockKeyhole } from "lucide-react";
import { studentLogin, type StudentAuthState } from "@/app/actions/student-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function StudentLoginForm() {
  const [state, action, pending] = useActionState<StudentAuthState, FormData>(studentLogin, undefined);
  return <form action={action} className="space-y-4"><Input label="Email" name="email" type="email" autoComplete="username" required leftIcon={<Mail className="h-4 w-4" />} /><Input label="Password" name="password" type="password" autoComplete="current-password" minLength={8} required leftIcon={<LockKeyhole className="h-4 w-4" />} />{state?.error && <p role="alert" className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{state.error}</p>}<Button type="submit" disabled={pending} isLoading={pending} leftIcon={pending ? undefined : <LogIn className="h-4 w-4" />}>Sign in</Button></form>;
}
