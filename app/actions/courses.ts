"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
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

  await db.course.create({
    data: {
      title,
      slug,
      description: description || null,
      published: false,
      is_free: isFree,
      price: price !== null && !isNaN(price) ? price : null,
      currency,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/courses");
  return { success: "Course created as a draft." };
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
