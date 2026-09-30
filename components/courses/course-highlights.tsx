import { Sparkles, CheckCircle2, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CourseHighlightsProps {
  highlights: string[];
  title?: string;
  badgeText?: string;
}

export function CourseHighlights({
  highlights,
  title = "What you'll learn in this course",
  badgeText = "Course Highlights",
}: CourseHighlightsProps) {
  if (!highlights || highlights.length === 0) return null;

  return (
    <section className="rounded-2xl border border-indigo-500/20 bg-linear-to-b from-indigo-950/25 to-slate-900/60 p-6 sm:p-8 space-y-6 shadow-xl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5">
            <Badge variant="indigo" size="sm">
              <Sparkles className="h-3 w-3 mr-1 text-indigo-400" />
              {badgeText}
            </Badge>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {title}
          </h2>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-indigo-300/80 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
          <span>Curated by Instructor</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
        {highlights.map((item, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-800/80 bg-slate-900/50 hover:bg-slate-800/40 hover:border-indigo-500/30 transition duration-200 group"
          >
            <div className="h-6 w-6 rounded-lg bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <p className="text-sm text-slate-200 leading-relaxed font-medium">
              {item}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
