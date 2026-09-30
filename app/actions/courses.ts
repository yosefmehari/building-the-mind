"use server";

import { db } from "@/lib/db";
import { requireAdmin, requireStudent } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export type CourseFormState = {
  error?: string;
  success?: string;
};

export async function createCourse(
  _state: CourseFormState | undefined,
  formData: FormData
): Promise<CourseFormState> {
  await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const description = String(formData.get("description") ?? "").trim();
  const highlights = String(formData.get("highlights") ?? "").trim();

  if (title.length < 2 || title.length > 255) {
    return { error: "Title must be between 2 and 255 characters." };
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 255) {
    return { error: "Slug must use lowercase letters, numbers, and hyphens only." };
  }

  const existingCourse = await db.course.findUnique({ where: { slug } });
  if (existingCourse) return { error: "A course with this slug already exists." };

  const isFree = formData.get("isFree") !== "false";
  const priceRaw = String(formData.get("price") ?? "").trim();
  const price = !isFree && priceRaw ? parseFloat(priceRaw) : null;
  const currency = String(formData.get("currency") ?? "USD").trim().toUpperCase() || "USD";
  const videoUrl = String(formData.get("videoUrl") ?? "").trim();

  await db.course.create({
    data: {
      title,
      slug,
      description: description || null,
      highlights: highlights || null,
      video_url: videoUrl || null,
      published: false,
      is_free: isFree,
      price: price !== null && !isNaN(price) ? price : null,
      currency,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/courses");
  revalidatePath("/courses");
  return { success: "Course created as a draft." };
}

export async function updateCourse(
  _state: CourseFormState | undefined,
  formData: FormData
): Promise<CourseFormState> {
  await requireAdmin();

  const idValue = String(formData.get("courseId") ?? "");
  if (!/^\d+$/.test(idValue)) return { error: "Invalid course ID." };
  const courseId = BigInt(idValue);

  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const description = String(formData.get("description") ?? "").trim();
  const highlights = String(formData.get("highlights") ?? "").trim();
  const published = formData.get("published") === "true";

  if (title.length < 2 || title.length > 255) {
    return { error: "Title must be between 2 and 255 characters." };
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 255) {
    return { error: "Slug must use lowercase letters, numbers, and hyphens only." };
  }

  const existingCourse = await db.course.findFirst({
    where: { slug, id: { not: courseId } },
  });
  if (existingCourse) return { error: "Another course with this slug already exists." };

  const isFree = formData.get("isFree") !== "false";
  const priceRaw = String(formData.get("price") ?? "").trim();
  const price = !isFree && priceRaw ? parseFloat(priceRaw) : null;
  const currency = String(formData.get("currency") ?? "USD").trim().toUpperCase() || "USD";
  const videoUrl = String(formData.get("videoUrl") ?? "").trim();

  const updated = await db.course.update({
    where: { id: courseId },
    data: {
      title,
      slug,
      description: description || null,
      highlights: highlights || null,
      video_url: videoUrl || null,
      published,
      is_free: isFree,
      price: price !== null && !isNaN(price) ? price : null,
      currency,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/courses");
  revalidatePath("/courses");
  revalidatePath(`/courses/${updated.slug}`);
  return { success: "Course updated successfully." };
}

export async function updateCourseHighlights(
  _state: CourseFormState | undefined,
  formData: FormData
): Promise<CourseFormState> {
  await requireAdmin();

  const idValue = String(formData.get("courseId") ?? "");
  if (!/^\d+$/.test(idValue)) return { error: "Invalid course ID." };

  const highlights = String(formData.get("highlights") ?? "").trim();

  const updated = await db.course.update({
    where: { id: BigInt(idValue) },
    data: { highlights: highlights || null },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/courses");
  revalidatePath("/courses");
  revalidatePath(`/courses/${updated.slug}`);
  return { success: "Course highlights saved." };
}

export async function deleteCourse(formData: FormData) {
  await requireAdmin();
  const idValue = String(formData.get("courseId") ?? "");
  if (!/^\d+$/.test(idValue)) throw new Error("Invalid course.");

  await db.course.delete({ where: { id: BigInt(idValue) } });
  revalidatePath("/admin");
  revalidatePath("/admin/courses");
  revalidatePath("/courses");
}

export async function enrollInCourse(
  _state: CourseFormState | undefined,
  formData: FormData
): Promise<CourseFormState> {
  const session = await requireStudent();
  const courseIdValue = String(formData.get("courseId") ?? "");
  if (!/^\d+$/.test(courseIdValue)) {
    return { error: "Invalid course selected." };
  }

  const course = await db.course.findUnique({
    where: { id: BigInt(courseIdValue) },
    select: { id: true, slug: true, published: true, title: true },
  });

  if (!course || !course.published) {
    return { error: "Course is not available for enrollment." };
  }

  const userId = BigInt(session.userId);

  await db.enrollment.upsert({
    where: {
      user_id_course_id: {
        user_id: userId,
        course_id: course.id,
      },
    },
    create: {
      user_id: userId,
      course_id: course.id,
    },
    update: {},
  });

  revalidatePath("/courses");
  revalidatePath(`/courses/${course.slug}`);
  revalidatePath("/dashboard");
  revalidatePath("/admin/students");
  revalidatePath("/admin/courses");

  return { success: `Successfully enrolled in ${course.title}!` };
}
