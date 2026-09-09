"use client";

import type { FormEvent } from "react";
import { Trash2 } from "lucide-react";

type DeleteAction = (formData: FormData) => Promise<void>;

export function DeleteButton({ action, field, id, label }: { action: DeleteAction; field: string; id: string; label: string }) {
  function confirmDelete(event: FormEvent<HTMLFormElement>) {
    if (!window.confirm(`Delete ${label}? This cannot be undone.`)) event.preventDefault();
  }

  return (
    <form action={action} onSubmit={confirmDelete}>
      <input type="hidden" name={field} value={id} />
      <button type="submit" aria-label={`Delete ${label}`} className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/20 px-2.5 py-1.5 text-xs font-medium text-rose-300 transition hover:border-rose-500/50 hover:bg-rose-500/10">
        <Trash2 className="h-3.5 w-3.5" />
        Delete
      </button>
    </form>
  );
}