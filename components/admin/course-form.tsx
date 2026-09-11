"use client";

import { useActionState } from "react";
import { Plus, WandSparkles } from "lucide-react";
import { createCourse, type CourseFormState } from "@/app/actions/courses";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function CourseForm() {
  const [state, action, pending] = useActionState<CourseFormState | undefined, FormData>(createCourse, undefined);

  return (
    <form action={action} className="space-y-4">
      <Input label="Course title" name="title" placeholder="Full Stack Web Development" minLength={2} maxLength={255} required />
      <Input label="URL slug" name="slug" placeholder="full-stack" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required helperText="Lowercase words separated by hyphens." />
      <div className="space-y-1.5">
        <label htmlFor="description" className="block text-xs font-medium text-slate-300">Description</label>
        <textarea id="description" name="description" rows={4} placeholder="What will students learn?" className="w-full resize-y rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3.5 space-y-3">
        <label className="block text-xs font-semibold text-slate-300">Access & Pricing</label>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm text-slate-200 cursor-pointer">
            <input type="radio" name="isFree" value="true" defaultChecked className="text-indigo-600 focus:ring-indigo-500" />
            <span>Free</span>
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-200 cursor-pointer">
            <input type="radio" name="isFree" value="false" className="text-indigo-600 focus:ring-indigo-500" />
            <span>Paid</span>
          </label>
        </div>
        <div className="pt-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input label="Price amount" name="price" type="number" step="0.01" min="0" placeholder="e.g. 19.99" helperText="Leave blank or 0 if free." />
          <div className="space-y-1.5">
            <label htmlFor="course-currency" className="block text-xs font-medium text-slate-300">Currency / Country</label>
            <select id="course-currency" name="currency" defaultValue="USD" className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2.5 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
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
      <Button type="submit" disabled={pending} isLoading={pending} leftIcon={pending ? undefined : <Plus className="h-4 w-4" />}>Create draft course</Button>
      <div className="flex items-center gap-2 text-xs text-slate-500"><WandSparkles className="h-3.5 w-3.5 text-indigo-400" />New courses start unpublished until reviewed.</div>
    </form>
  );
}
