import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Download, FileText, PlayCircle, Volume2 } from "lucide-react";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { LessonProgress } from "@/components/courses/lesson-progress";
import { QuizPlayer } from "@/components/courses/quiz-player";

interface Props {
  params: Promise<{ slug: string; lessonSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, lessonSlug } = await params;
  const lesson = await db.lesson.findFirst({ where: { slug: lessonSlug, published: true, modules: { courses: { slug } } }, select: { title: true, description: true } });
  return lesson ? { title: lesson.title, description: lesson.description ?? undefined } : { title: "Lesson Not Found" };
}

export default async function LessonPage({ params }: Props) {
  const { slug, lessonSlug } = await params;
  const lesson = await db.lesson.findFirst({
    where: { slug: lessonSlug, published: true, modules: { courses: { slug } } },
    include: {
      modules: { include: { courses: { select: { title: true, slug: true } } } },
      videos: { where: { published: true }, orderBy: { id: "asc" } },
      lesson_files: { orderBy: { created_at: "asc" } },
      quizzes: {
        where: { published: true },
        orderBy: { created_at: "asc" },
        include: {
          questions: {
            orderBy: { position: "asc" },
            include: { answers: { orderBy: { id: "asc" }, select: { id: true, answer: true } } },
          },
        },
      },
    },
  });
  if (!lesson) notFound();

  const course = await db.course.findUnique({
    where: { slug },
    select: {
      title: true,
      slug: true,
      modules: {
        orderBy: { position: "asc" },
        select: { id: true, title: true, lessons: { where: { published: true }, orderBy: { position: "asc" }, select: { id: true, title: true, slug: true } } },
      },
    },
  });
  if (!course) notFound();

  const allLessons = course.modules.flatMap((module) => module.lessons.map((item) => ({ ...item, moduleTitle: module.title })));
  const currentIndex = allLessons.findIndex((item) => item.slug === lesson.slug);
  const previousLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
  const session = await getSession();
  const progressRecords = session
    ? await db.student_progress.findMany({
        where: { user_id: BigInt(session.userId), lesson_id: { in: allLessons.map((item) => item.id) }, completed: true },
        select: { lesson_id: true },
      })
    : [];
  const completedLessonIds = new Set(progressRecords.map((record) => record.lesson_id.toString()));
  const completedCount = completedLessonIds.size;
  const currentLessonCompleted = completedLessonIds.has(lesson.id.toString());
  const progress = allLessons.length ? Math.round((completedCount / allLessons.length) * 100) : 0;

  return (
    <main className="flex-1 px-4 py-10">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-7">
          <Link href={`/courses/${course.slug}`} className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"><ArrowLeft className="h-4 w-4" />{course.title}</Link>
          <div className="space-y-2"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-400">{lesson.modules.title}</p><h1 className="text-3xl font-black text-white">{lesson.title}</h1>{lesson.description && <p className="max-w-3xl text-slate-400">{lesson.description}</p>}</div>

          {lesson.videos.length > 0 ? <div className="overflow-hidden rounded-2xl border border-slate-800 bg-black shadow-2xl"><video className="aspect-video w-full" controls preload="metadata" poster={lesson.videos[0].thumbnail_url ?? undefined}><source src={lesson.videos[0].video_url} type={lesson.videos[0].mime_type ?? "video/mp4"} />Your browser does not support video playback.</video></div> : <div className="flex aspect-video items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/50"><div className="text-center"><PlayCircle className="mx-auto h-10 w-10 text-slate-700" /><p className="mt-3 text-sm text-slate-500">Video coming soon.</p></div></div>}

          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6"><div className="flex items-center justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Course progress</p><p className="mt-1 text-sm text-slate-300">{completedCount} of {allLessons.length} lessons completed</p></div><span className="text-lg font-bold text-indigo-300">{progress}%</span></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${progress}%` }} /></div><div className="mt-4"><LessonProgress lessonId={lesson.id.toString()} courseSlug={course.slug} lessonSlug={lesson.slug} completed={currentLessonCompleted} signedIn={Boolean(session)} /></div></section>

          {lesson.lesson_files.length > 0 && <section className="space-y-3"><h2 className="text-lg font-bold text-white">Lesson resources</h2><div className="grid gap-3 sm:grid-cols-2">{lesson.lesson_files.map((file) => <a key={file.id.toString()} href={file.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition hover:border-indigo-500/40"><FileText className="h-5 w-5 shrink-0 text-amber-400" /><span className="min-w-0 flex-1 truncate text-sm text-slate-300">{file.name}</span>{file.file_type?.includes("audio") ? <Volume2 className="h-4 w-4 text-slate-500" /> : <Download className="h-4 w-4 text-slate-500" />}</a>)}</div></section>}

          {lesson.quizzes.filter((quiz) => quiz.questions.length > 0).map((quiz) => <QuizPlayer key={quiz.id.toString()} quiz={{ id: quiz.id.toString(), title: quiz.title, description: quiz.description, questions: quiz.questions.map((question) => ({ id: question.id.toString(), question: question.question, answers: question.answers.map((answer) => ({ id: answer.id.toString(), answer: answer.answer })) })) }} signedIn={Boolean(session)} />)}

          <div className="flex items-center justify-between border-t border-slate-800 pt-6">{previousLesson ? <Link href={`/courses/${course.slug}/lessons/${previousLesson.slug}`} className="flex max-w-[45%] items-center gap-2 text-sm text-slate-400 transition hover:text-white"><ArrowLeft className="h-4 w-4 shrink-0" /><span className="truncate">{previousLesson.title}</span></Link> : <span />}{nextLesson ? <Link href={`/courses/${course.slug}/lessons/${nextLesson.slug}`} className="flex max-w-[45%] items-center gap-2 text-right text-sm text-indigo-400 transition hover:text-white"><span className="truncate">{nextLesson.title}</span><ArrowRight className="h-4 w-4 shrink-0" /></Link> : <span />}</div>
        </div>

        <aside className="h-fit rounded-2xl border border-slate-800 bg-slate-900/60 lg:sticky lg:top-24"><div className="border-b border-slate-800 p-5"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-400">Course contents</p><h2 className="mt-2 font-bold text-white">{course.title}</h2></div><div className="max-h-[70vh] overflow-y-auto p-3">{course.modules.map((module) => <div key={module.id.toString()} className="mb-4 last:mb-0"><p className="px-3 py-2 text-xs font-semibold text-slate-500">{module.title}</p><div className="space-y-1">{module.lessons.map((item) => { const active = item.slug === lesson.slug; return <Link key={item.slug} href={`/courses/${course.slug}/lessons/${item.slug}`} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${active ? "bg-indigo-500/15 text-indigo-300" : "text-slate-400 hover:bg-slate-800/60 hover:text-white"}`}>{active ? <PlayCircle className="h-3.5 w-3.5 shrink-0" /> : <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-slate-700" />}<span className="truncate">{item.title}</span></Link> })}</div></div>)}</div></aside>
      </div>
    </main>
  );
}
