"use client";

import React, { useEffect, useRef, useState } from "react";
import { DollarSign, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { SUPPORTED_CURRENCIES } from "@/lib/currencies";

interface CurrencySwitcherProps {
  /** Called after the user picks a new currency so parents can refresh data */
  onCurrencyChange?: (code: string) => void;
}

export function CurrencySwitcher({ onCurrencyChange }: CurrencySwitcherProps) {
  const [currency, setCurrency] = useState("USD");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Hydrate from cookie-backed API on mount
  useEffect(() => {
    fetch("/api/currency")
      .then((r) => r.json())
      .then((data: { currency?: string }) => {
        if (data.currency) setCurrency(data.currency);
      })
      .catch(() => undefined);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function select(code: string) {
    setCurrency(code);
    setOpen(false);
    await fetch("/api/currency", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currency: code }),
    });
    onCurrencyChange?.(code);
  }

  const currentCurr = SUPPORTED_CURRENCIES.find((c) => c.code === currency) ?? SUPPORTED_CURRENCIES[0];

  return (
    <div ref={ref} className="relative">
      <button
        id="navbar-currency-selector"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800/60 transition border border-slate-800 hover:border-slate-700"
        aria-label="Select currency"
      >
        <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
        <span className="font-mono font-semibold tracking-wide">{currentCurr.code}</span>
        <ChevronDown className={cn("w-3 h-3 transition-transform duration-200", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-1 z-50 max-h-72 overflow-y-auto">
          <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Select your currency
          </p>
          {SUPPORTED_CURRENCIES.map((c) => (
            <button
              key={c.code}
              id={`currency-${c.code}`}
              onClick={() => void select(c.code)}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors",
                currency === c.code
                  ? "text-emerald-400 bg-emerald-500/10"
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
              )}
            >
              <span className="font-mono font-bold w-10 text-xs">{c.code}</span>
              <span className="text-slate-400">{c.symbol}</span>
              <span className="flex-1 text-left truncate">{c.name}</span>
              {currency === c.code && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
