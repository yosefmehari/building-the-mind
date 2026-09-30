import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { saveLocalUpload } from "@/lib/storage/local";
import { revalidatePath } from "next/cache";

const MAX_VIDEO_SIZE = 1024 * 1024 * 1024; // 1 GB
const ALLOWED_VIDEO_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-matroska",
  "video/ogg",
  "video/x-msvideo",
  "video/mpeg",
]);
const ALLOWED_VIDEO_EXTENSIONS = new Set([
  ".mp4",
  ".webm",
  ".mov",
  ".mkv",
  ".m4v",
  ".avi",
  ".ogv",
]);

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const ALLOWED_IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 250);
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role.toLowerCase() !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
    }

    const formData = await req.formData();

    const uploadTarget = String(formData.get("uploadTarget") ?? "lesson").trim();
    let lessonIdValue = String(formData.get("lessonId") ?? "").trim();
    const moduleIdValue = String(formData.get("moduleId") ?? "").trim();
    const courseIdValue = String(formData.get("courseId") ?? "").trim();
    const newLessonTitle = String(formData.get("newLessonTitle") ?? "").trim();
    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const durationSeconds = Math.max(0, parseInt(String(formData.get("durationSeconds") ?? "0"), 10) || 0);
    const published = formData.get("published") === "true";
    const externalVideoUrl = String(formData.get("videoUrl") ?? "").trim();
    const externalThumbnailUrl = String(formData.get("thumbnailUrl") ?? "").trim();

    const videoFile = formData.get("video");
    const thumbnailFile = formData.get("thumbnail");

    if (uploadTarget === "course_title") {
      if (!courseIdValue || !/^\d+$/.test(courseIdValue)) {
        return NextResponse.json({ error: "Please select a valid course for the title video." }, { status: 400 });
      }
      const courseId = BigInt(courseIdValue);
      const course = await db.course.findUnique({
        where: { id: courseId },
        select: { id: true, title: true, slug: true },
      });
      if (!course) {
        return NextResponse.json({ error: "Course not found." }, { status: 404 });
      }

      let finalVideoUrl = externalVideoUrl;
      if (videoFile instanceof File && videoFile.size > 0) {
        const savedVideo = await saveLocalUpload(
          videoFile,
          ALLOWED_VIDEO_TYPES,
          MAX_VIDEO_SIZE,
          "videos",
          ALLOWED_VIDEO_EXTENSIONS
        );
        finalVideoUrl = savedVideo.url;
      }
      if (!finalVideoUrl) {
        return NextResponse.json({ error: "Please choose a video file from your device or enter a video URL." }, { status: 400 });
      }

      let finalThumbnailUrl = externalThumbnailUrl || null;
      if (thumbnailFile instanceof File && thumbnailFile.size > 0) {
        const savedThumb = await saveLocalUpload(
          thumbnailFile,
          ALLOWED_IMAGE_TYPES,
          MAX_IMAGE_SIZE,
          "thumbnails",
          ALLOWED_IMAGE_EXTENSIONS
        );
        finalThumbnailUrl = savedThumb.url;
      }

      await db.course.update({
        where: { id: courseId },
        data: {
          video_url: finalVideoUrl,
          ...(finalThumbnailUrl ? { thumbnail_url: finalThumbnailUrl } : {}),
        },
      });

      revalidatePath("/admin");
      revalidatePath("/admin/courses");
      revalidatePath("/admin/videos");
      revalidatePath("/courses");
      revalidatePath(`/courses/${course.slug}`);

      return NextResponse.json({
        success: true,
        message: `Video successfully attached to course title "${course.title}"!`,
        video: {
          title: course.title,
          video_url: finalVideoUrl,
        },
      });
    }

    if (!title) {
      return NextResponse.json({ error: "Please enter a video title." }, { status: 400 });
    }

    // Handle creating a new lesson on the fly for the selected module
    if (lessonIdValue === "new" || (!lessonIdValue && newLessonTitle)) {
      if (!moduleIdValue || !/^\d+$/.test(moduleIdValue)) {
        return NextResponse.json({ error: "Please select a module for the new lesson." }, { status: 400 });
      }
      if (!newLessonTitle || newLessonTitle.length < 2) {
        return NextResponse.json({ error: "Please enter a valid title for the new lesson." }, { status: 400 });
      }

      const moduleId = BigInt(moduleIdValue);
      const moduleRecord = await db.module.findUnique({
        where: { id: moduleId },
        select: { id: true, course_id: true },
      });
      if (!moduleRecord) {
        return NextResponse.json({ error: "Selected module not found." }, { status: 404 });
      }

      let slug = slugify(newLessonTitle);
      const existingLesson = await db.lesson.findFirst({
        where: { module_id: moduleId, slug },
      });
      if (existingLesson) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
      }

      const lastLesson = await db.lesson.findFirst({
        where: { module_id: moduleId },
        orderBy: { position: "desc" },
        select: { position: true },
      });
      const nextPosition = (lastLesson?.position ?? -1) + 1;

      const createdLesson = await db.lesson.create({
        data: {
          module_id: moduleId,
          title: newLessonTitle,
          slug,
          duration_minutes: Math.ceil(durationSeconds / 60),
          position: nextPosition,
          published: true,
        },
      });

      lessonIdValue = createdLesson.id.toString();
    }

    if (!/^\d+$/.test(lessonIdValue)) {
      return NextResponse.json({ error: "Please select or create a lesson for this video." }, { status: 400 });
    }

    const lessonId = BigInt(lessonIdValue);
    const lesson = await db.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true, modules: { select: { courses: { select: { slug: true } } } } },
    });
    if (!lesson) {
      return NextResponse.json({ error: "Target lesson not found." }, { status: 404 });
    }

    // Process Video File (from Device) or external URL
    let finalVideoUrl = externalVideoUrl;
    let storageProvider = "external";
    let fileSize: number | null = null;
    let mimeType: string | null = null;

    if (videoFile instanceof File && videoFile.size > 0) {
      const savedVideo = await saveLocalUpload(
        videoFile,
        ALLOWED_VIDEO_TYPES,
        MAX_VIDEO_SIZE,
        "videos",
        ALLOWED_VIDEO_EXTENSIONS
      );
      finalVideoUrl = savedVideo.url;
      storageProvider = "local";
      fileSize = savedVideo.size;
      mimeType = savedVideo.mimeType;
    }

    if (!finalVideoUrl) {
      return NextResponse.json({ error: "Please choose a video file from your device to upload." }, { status: 400 });
    }

    // Process Thumbnail File (from Device) or external URL
    let finalThumbnailUrl = externalThumbnailUrl || null;
    if (thumbnailFile instanceof File && thumbnailFile.size > 0) {
      const savedThumb = await saveLocalUpload(
        thumbnailFile,
        ALLOWED_IMAGE_TYPES,
        MAX_IMAGE_SIZE,
        "thumbnails",
        ALLOWED_IMAGE_EXTENSIONS
      );
      finalThumbnailUrl = savedThumb.url;
    }

    const createdVideo = await db.videos.create({
      data: {
        lesson_id: lessonId,
        title,
        description: description || null,
        video_url: finalVideoUrl,
        thumbnail_url: finalThumbnailUrl,
        storage_provider: storageProvider,
        duration_seconds: durationSeconds,
        file_size: fileSize ? BigInt(fileSize) : null,
        mime_type: mimeType,
        published,
      },
    });

    // Update lesson duration if needed
    if (durationSeconds > 0) {
      await db.lesson.update({
        where: { id: lessonId },
        data: { duration_minutes: Math.ceil(durationSeconds / 60) },
      });
    }

    revalidatePath("/admin");
    revalidatePath("/admin/videos");
    revalidatePath("/admin/lessons");
    if (lesson.modules?.courses?.slug) {
      revalidatePath(`/courses/${lesson.modules.courses.slug}`);
    }

    return NextResponse.json({
      success: true,
      message: `Video "${title}" uploaded and attached successfully!`,
      video: {
        id: createdVideo.id.toString(),
        title: createdVideo.title,
        video_url: createdVideo.video_url,
        published: createdVideo.published,
      },
    });
  } catch (error) {
    console.error("Video upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload video." },
      { status: 500 }
    );
  }
}
