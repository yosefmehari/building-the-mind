"use client";

import { useActionState } from "react";
import { BookOpen, Plus } from "lucide-react";
import { createLesson, type LessonFormState } from "@/app/actions/lessons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ModuleOption = { id: string; label: string };

export function LessonForm({ modules }: { modules: ModuleOption[] }) {
  const [state, action, pending] = useActionState<LessonFormState | undefined, FormData>(createLesson, undefined);

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="moduleId" className="block text-xs font-medium text-slate-300">Module</label>
        <select id="moduleId" name="moduleId" required defaultValue="" className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2.5 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
          <option value="" disabled>Select a module</option>
          {modules.map((module) => <option key={module.id} value={module.id}>{module.label}</option>)}
        </select>
      </div>
      <Input label="Lesson title" name="title" placeholder="What is React?" minLength={2} maxLength={255} required leftIcon={<BookOpen className="h-4 w-4" />} />
      <Input label="URL slug" name="slug" placeholder="what-is-react" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required helperText="Lowercase words separated by hyphens." />
      <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3.5 space-y-3">
        <label className="block text-xs font-semibold text-slate-300">Access & Pricing</label>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm text-slate-200 cursor-pointer">
            <input type="radio" name="isFree" value="true" defaultChecked className="text-emerald-600 focus:ring-emerald-500" />
            <span>Free</span>
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-200 cursor-pointer">
            <input type="radio" name="isFree" value="false" className="text-emerald-600 focus:ring-emerald-500" />
            <span>Paid</span>
          </label>
        </div>
        <div className="pt-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input label="Price amount" name="price" type="number" step="0.01" min="0" placeholder="e.g. 4.99" helperText="Leave blank or 0 if free." />
          <div className="space-y-1.5">
            <label htmlFor="lesson-currency" className="block text-xs font-medium text-slate-300">Currency / Country</label>
            <select id="lesson-currency" name="currency" defaultValue="USD" className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2.5 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
              <option value="USD">USD ($) - United States Dollar</option>
              <option value="EUR">EUR (€) - Euro (Europe)</option>
              <option value="GBP">GBP (£) - British Pound</option>
              <option value="ETB">ETB (Br) - Ethiopian Birr</option>
              <option value="ERN">ERN (Nfk) - Eritrean Nakfa</option>
              <option value="CAD">CAD (CA$) - Canadian Dollar</option>
              <option value="AUD">AUD (AU$) - Australian Dollar</option>
              <option value="AED">AED - UAE Dirham</option>
              <option value="SAR">SAR - Saudi Riyal</option>
              <option value="KES">KES (KSh) - Kenyan Shilling</option>
              <option value="NGN">NGN (₦) - Nigerian Naira</option>
              <option value="ZAR">ZAR (R) - South African Rand</option>
              <option value="INR">INR (₹) - Indian Rupee</option>
              <option value="CHF">CHF - Swiss Franc</option>
              <option value="SEK">SEK (kr) - Swedish Krona</option>
              <option value="NOK">NOK (kr) - Norwegian Krone</option>
              <option value="JPY">JPY (¥) - Japanese Yen</option>
              <option value="CNY">CNY (¥) - Chinese Yuan</option>
            </select>
          </div>
        </div>
      </div>
      {state?.error && <p role="alert" className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{state.error}</p>}
      {state?.success && <p role="status" className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">{state.success}</p>}
      <Button type="submit" disabled={pending || modules.length === 0} isLoading={pending} leftIcon={pending ? undefined : <Plus className="h-4 w-4" />}>Create draft lesson</Button>
      {modules.length === 0 && <p className="text-xs text-amber-300">Create a module first.</p>}
    </form>
  );
}
