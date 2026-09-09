"use client";

import { useActionState } from "react";
import { UserPlus } from "lucide-react";
import { registerStudent, type StudentAuthState } from "@/app/actions/student-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function StudentRegisterForm() {
  const [state, action, pending] = useActionState<StudentAuthState, FormData>(registerStudent, undefined);
  return <form action={action} className="space-y-4"><Input label="Name" name="name" autoComplete="name" minLength={2} maxLength={100} required /><Input label="Email" name="email" type="email" autoComplete="email" required /><Input label="Password" name="password" type="password" autoComplete="new-password" minLength={8} required helperText="At least 8 characters." />{state?.error && <p role="alert" className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{state.error}</p>}<Button type="submit" disabled={pending} isLoading={pending} leftIcon={pending ? undefined : <UserPlus className="h-4 w-4" />}>Create account</Button></form>;
}
