import { db } from "@/lib/db";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { PlayCircle, FileText, Volume2, ArrowLeft, Lock, Film, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/currencies";
import type { Metadata } from "next";
import { defaultLocale, isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getSession } from "@/lib/auth/session";
import { CourseHighlights } from "@/components/courses/course-highlights";
import { CourseEnrollCard } from "@/components/courses/course-enroll-card";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = await db.course.findUnique({ where: { slug } });
  if (!course) return { title: "Course Not Found" };
  return {
    title: course.title,
    description: course.description ?? undefined,
  };
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;

  type CourseWithDetails = NonNullable<Awaited<ReturnType<typeof db.course.findUnique<{
    where: { slug: string };
    include: {
      modules: {
        orderBy: { position: "asc" };
        include: {
          lessons: {
            where: { published: boolean };
            orderBy: { position: "asc" };
            include: {
              videos: { select: { id: true; duration_seconds: true } };
              lesson_files: { select: { id: true; file_type: true } };
            };
          };
        };
      };
      levels: true;
    };
  }>>>>;

  let course: CourseWithDetails | null = null;
  let session = null;
  let enrollment = null;

  try {
    [course, session] = await Promise.all([
      db.course.findUnique({
        where: { slug },
        include: {
          modules: {
            orderBy: { position: "asc" },
            include: {
              lessons: {
                where: { published: true },
                orderBy: { position: "asc" },
                include: {
                  videos: { select: { id: true, duration_seconds: true } },
                  lesson_files: { select: { id: true, file_type: true } },
                },
              },
            },
          },
          levels: true,
        },
      }),
      getSession(),
    ]);

    if (session && course) {
      enrollment = await db.enrollment.findUnique({
        where: {
          user_id_course_id: {
            user_id: BigInt(session.userId),
            course_id: course.id,
          },
        },
      });
    }
  } catch (error) {
    console.error("Failed to load course details:", error);
  }

  if (!course) notFound();

  const isEnrolled = Boolean(enrollment) || (Boolean(session) && session?.role.toLowerCase() === "admin");
  const signedIn = Boolean(session);

  const cookieStore = await cookies();
  const displayCurrency = cookieStore.get("preferred_currency")?.value ?? "USD";
  const localeValue = cookieStore.get("locale")?.value ?? defaultLocale;
  const copy = getDictionary(isLocale(localeValue) ? localeValue : defaultLocale).common;

  const totalLessons = course.modules.reduce((s, m) => s + m.lessons.length, 0);

  // Parse course highlights
  const highlightsList = course.highlights
    ? course.highlights
        .split("\n")
        .map((line) => line.trim().replace(/^[-•*]\s*/, ""))
        .filter((line) => line.length > 0)
    : [];

  const firstLesson = course.modules[0]?.lessons[0];
  const firstLessonHref = firstLesson
    ? `/courses/${course.slug}/lessons/${firstLesson.slug}`
    : null;

  const priceDisplay = course.is_free
    ? copy.free
    : formatPrice(Number(course.price ?? 0), course.currency ?? "USD", displayCurrency);

  const loginRedirectUrl = `/login?redirectTo=${encodeURIComponent(`/courses/${course.slug}`)}`;

  return (
    <main className="flex-1 py-16 px-4">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Back link */}
        <Link href="/courses" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition">
          <ArrowLeft className="w-4 h-4" />
          {copy.backToCourses}
        </Link>

        {/* Course Header */}
        <div className="p-8 rounded-2xl bg-linear-to-r from-slate-900 to-indigo-950/30 border border-slate-800 space-y-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {course.levels && <Badge variant="indigo" size="md">{course.levels.name}</Badge>}
                <Badge variant={course.is_free ? "emerald" : "amber"} size="md">
                  {priceDisplay}
                </Badge>
                {isEnrolled && (
                  <Badge variant="emerald" size="md" dot>
                    {copy.enrolled}
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-black text-white">{course.title}</h1>
              {course.description && (
                <p className="text-slate-400 max-w-2xl">{course.description}</p>
              )}
            </div>
            <div className="text-right text-sm text-slate-400 space-y-1 shrink-0">
              <div><strong className="text-white">{course.modules.length}</strong> {copy.modules}</div>
              <div><strong className="text-white">{totalLessons}</strong> {copy.lessons}</div>
            </div>
          </div>

          {/* Course Title Preview Video */}
          {course.video_url && (
            <div className="mt-4 rounded-2xl border border-indigo-500/20 bg-slate-950/70 p-4 space-y-3 shadow-xl">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/25 text-indigo-400">
                    <Film className="h-4 w-4" />
                  </span>
                  <div>
                    <h2 className="text-sm font-bold text-white">Course Title Preview Video</h2>
                    <p className="text-[11px] text-slate-400">Watch the introduction before signing in</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-medium text-indigo-300 border border-indigo-500/20">
                  <Play className="h-3 w-3 fill-indigo-400" /> Free Preview
                </span>
              </div>
              <div className="relative overflow-hidden rounded-xl bg-black aspect-video max-h-[440px] w-full border border-slate-800 shadow-inner flex items-center justify-center">
                <video
                  src={course.video_url}
                  poster={course.thumbnail_url ?? undefined}
                  controls
                  preload="metadata"
                  className="w-full h-full object-contain"
                >
                  Your browser does not support HTML5 video playback.
                </video>
              </div>
            </div>
          )}
        </div>

        {/* Course Highlights (Always visible so unauthenticated students can see what they will get) */}
        {highlightsList.length > 0 && (
          <CourseHighlights
            highlights={highlightsList}
            title={copy.whatYouWillLearnInCourse}
            badgeText={copy.courseHighlights}
          />
        )}

        {/* Enrollment & Sign-In Call to Action Card */}
        <CourseEnrollCard
          courseId={course.id.toString()}
          courseSlug={course.slug}
          courseTitle={course.title}
          isFree={course.is_free}
          priceDisplay={priceDisplay}
          signedIn={signedIn}
          isEnrolled={isEnrolled}
          firstLessonHref={firstLessonHref}
          labels={{
            signInToGetCourse: copy.signInToGetCourse,
            getCourse: copy.getCourse,
            enrolled: copy.enrolled,
            continueLearning: copy.continueLearning,
            courseLockedNotice: copy.courseLockedNotice,
          }}
        />

        {/* Modules & Lessons */}
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h2 className="text-xl font-bold text-white">{copy.courseCurriculum}</h2>
            {!isEnrolled && (
              <span className="text-xs text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
                <Lock className="w-3 h-3" />
                {signedIn ? "Enroll above to unlock lessons" : "Sign in to unlock all lessons"}
              </span>
            )}
          </div>

          {course.modules.map((mod, idx) => (
            <div key={mod.id.toString()} className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden">
              {/* Module Header */}
              <div className="px-6 py-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="h-7 w-7 rounded-full bg-indigo-600/15 border border-indigo-500/25 flex items-center justify-center text-xs font-bold text-indigo-400">
                    {idx + 1}
                  </span>
                  <h3 className="font-semibold text-white">{mod.title}</h3>
                </div>
                <Badge variant="default" size="sm">{mod.lessons.length} {copy.lessons}</Badge>
              </div>

              {/* Lessons */}
              <ul className="divide-y divide-slate-800/60">
                {mod.lessons.map((lesson, li) => {
                  if (isEnrolled) {
                    // Full access
                    return (
                      <li key={lesson.id.toString()}>
                        <Link
                          href={`/courses/${course.slug}/lessons/${lesson.slug}`}
                          id={`lesson-${lesson.slug}`}
                          className="flex items-center gap-3 px-6 py-3.5 hover:bg-slate-800/40 transition group"
                        >
                          <span className="text-xs text-slate-600 w-5 text-right shrink-0">{li + 1}</span>
                          <PlayCircle className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 shrink-0 transition" />
                          <span className="flex-1 text-sm text-slate-300 group-hover:text-white transition">{lesson.title}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            {lesson.lesson_files.some((f) => f.file_type?.includes("pdf")) && (
                              <FileText className="w-3.5 h-3.5 text-slate-600" />
                            )}
                            {lesson.lesson_files.some((f) => f.file_type?.includes("audio")) && (
                              <Volume2 className="w-3.5 h-3.5 text-slate-600" />
                            )}
                            {lesson.duration_minutes && lesson.duration_minutes > 0 && (
                              <span className="text-xs text-slate-500">{lesson.duration_minutes}m</span>
                            )}
                          </div>
                        </Link>
                      </li>
                    );
                  }

                  // Locked: Student must sign in before getting the course
                  return (
                    <li key={lesson.id.toString()}>
                      <Link
                        href={signedIn ? "#" : loginRedirectUrl}
                        className="flex items-center gap-3 px-6 py-3.5 hover:bg-slate-800/25 transition group opacity-85"
                        title={signedIn ? "Enroll in course to unlock" : "Sign in to get course"}
                      >
                        <span className="text-xs text-slate-600 w-5 text-right shrink-0">{li + 1}</span>
                        <Lock className="w-4 h-4 text-amber-500/70 group-hover:text-amber-400 shrink-0 transition" />
                        <span className="flex-1 text-sm text-slate-400 group-hover:text-slate-200 transition">
                          {lesson.title}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                            {signedIn ? "Enroll to view" : copy.signInToUnlock}
                          </span>
                          {lesson.duration_minutes && lesson.duration_minutes > 0 && (
                            <span className="text-xs text-slate-500">{lesson.duration_minutes}m</span>
                          )}
                        </div>
                      </Link>
                    </li>
                  );
                })}
                {mod.lessons.length === 0 && (
                  <li className="px-6 py-4 text-sm text-slate-600 italic">
                    {copy.noLessons}
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
