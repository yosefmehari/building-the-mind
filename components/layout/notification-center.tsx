"use client";

import { useState } from "react";
import { Bell, Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
export function NotificationCenter({ copy }: { copy?: { notifications: string; close: string; caughtUp: string; updates: string; allRead: string; unread: string } }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  function toggle() {
    setIsOpen((open) => !open);
    setHasUnread(false);
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        id="navbar-notifications"
        aria-label={copy?.notifications ?? "Notifications"}
        aria-expanded={isOpen}
        onClick={toggle}
      >
        <Bell className="w-4 h-4" />
      </Button>
      {hasUnread && <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-indigo-500" aria-label={copy?.unread ?? "Unread notification"} />}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
            <h2 className="text-sm font-semibold text-white">{copy?.notifications ?? "Notifications"}</h2>
            <button type="button" onClick={() => setIsOpen(false)} className="text-xs text-slate-500 transition hover:text-white">{copy?.close ?? "Close"}</button>
          </div>
          <div className="flex items-start gap-3 px-4 py-5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400"><Info className="h-4 w-4" /></div>
            <div><p className="text-sm text-slate-200">{copy?.caughtUp ?? "You are all caught up."}</p><p className="mt-1 text-xs text-slate-500">{copy?.updates ?? "New course updates will appear here."}</p></div>
          </div>
          <div className="flex items-center gap-2 border-t border-slate-800 px-4 py-3 text-xs text-slate-500"><Check className="h-3.5 w-3.5 text-emerald-400" />{copy?.allRead ?? "All notifications are read"}</div>
        </div>
      )}
    </div>
  );
}
