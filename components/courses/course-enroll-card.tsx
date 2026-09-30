"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Lock, LogIn, UserPlus, GraduationCap, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import { enrollInCourse, type CourseFormState } from "@/app/actions/courses";
import { Button } from "@/components/ui/button";

interface CourseEnrollCardProps {
  courseId: string;
  courseSlug: string;
  courseTitle: string;
  isFree: boolean;
  priceDisplay: string;
  signedIn: boolean;
  isEnrolled: boolean;
  firstLessonHref: string | null;
  labels?: {
    signInToGetCourse?: string;
    getCourse?: string;
    enrolled?: string;
    continueLearning?: string;
    courseLockedNotice?: string;
  };
}

export function CourseEnrollCard({
  courseId,
  courseSlug,
  courseTitle,
  isFree,
  priceDisplay,
  signedIn,
  isEnrolled,
  firstLessonHref,
  labels,
}: CourseEnrollCardProps) {
  const [state, formAction, pending] = useActionState<CourseFormState | undefined, FormData>(
    enrollInCourse,
    undefined
  );

  const loginRedirectUrl = `/login?redirectTo=${encodeURIComponent(`/courses/${courseSlug}`)}`;
  const registerRedirectUrl = `/register?redirectTo=${encodeURIComponent(`/courses/${courseSlug}`)}`;

  // State 1: Already Enrolled
  if (isEnrolled) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-linear-to-r from-emerald-950/30 to-slate-900/60 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                {labels?.enrolled ?? "Enrolled"}
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span className="text-xs text-slate-400">Full Access Unlocked</span>
            </div>
            <h3 className="text-base font-bold text-white mt-0.5">
              You are ready to learn
            </h3>
          </div>
        </div>

        {firstLessonHref && (
          <Link href={firstLessonHref} className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="md"
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 border-emerald-500/40"
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              {labels?.continueLearning ?? "Continue Learning"}
            </Button>
          </Link>
        )}
      </div>
    );
  }

  // State 2: Signed In, Not Enrolled -> "Get Course"
  if (signedIn) {
    return (
      <div className="rounded-2xl border border-indigo-500/30 bg-linear-to-r from-indigo-950/40 via-slate-900/80 to-slate-900/60 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Get full access</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white">
              Enroll in {courseTitle}
            </h3>
            <p className="text-sm text-slate-300">
              Unlock all modules, streaming video lessons, quizzes, and downloadable resources now.
            </p>
          </div>

          <form action={formAction} className="w-full sm:w-auto shrink-0 space-y-2">
            <input type="hidden" name="courseId" value={courseId} />
            <Button
              type="submit"
              disabled={pending}
              isLoading={pending}
              size="lg"
              className="w-full sm:w-auto px-7 shadow-lg shadow-indigo-500/20"
              leftIcon={pending ? undefined : <GraduationCap className="h-5 w-5" />}
            >
              {labels?.getCourse ?? "Get Course"} {isFree ? "— Free" : `— ${priceDisplay}`}
            </Button>
            {state?.error && (
              <p role="alert" className="text-xs text-rose-300 text-center sm:text-right">
                {state.error}
              </p>
            )}
          </form>
        </div>
      </div>
    );
  }

  // State 3: NOT Signed In -> Gate with Sign In Prompt
  return (
    <div className="rounded-2xl border border-amber-500/30 bg-linear-to-r from-slate-900 via-amber-950/20 to-slate-900/80 p-6 sm:p-7 shadow-xl space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
            <Lock className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Sign In Required to Get Course
              </span>
              <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                Highlights Preview Only
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white">
              {labels?.signInToGetCourse ?? "Sign in to Get Course"}
            </h3>
            <p className="text-sm text-slate-300 max-w-2xl">
              {labels?.courseLockedNotice ??
                "Students must sign in before accessing the course curriculum and video lessons. Review the highlights above, then sign in to get instant access."}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 w-full sm:w-auto">
          <Link href={loginRedirectUrl} className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="md"
              className="w-full sm:w-auto shadow-md shadow-indigo-500/20"
              leftIcon={<LogIn className="h-4 w-4" />}
            >
              Sign In to Get Course
            </Button>
          </Link>
          <Link href={registerRedirectUrl} className="w-full sm:w-auto">
            <Button
              variant="secondary"
              size="md"
              className="w-full sm:w-auto"
              leftIcon={<UserPlus className="h-4 w-4" />}
            >
              Create Free Account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
