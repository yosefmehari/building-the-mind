"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export type LessonFormState = { error?: string; success?: string };

export async function createLesson(
  _state: LessonFormState | undefined,
  formData: FormData
): Promise<LessonFormState> {
  await requireAdmin();

  const moduleIdValue = String(formData.get("moduleId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();

  if (!/^\d+$/.test(moduleIdValue) || title.length < 2 || title.length > 255) {
    return { error: "Choose a module and enter a title between 2 and 255 characters." };
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 255) {
    return { error: "Slug must use lowercase letters, numbers, and hyphens only." };
  }

  const moduleId = BigInt(moduleIdValue);
  const selectedModule = await db.module.findUnique({ where: { id: moduleId }, select: { id: true } });
  if (!selectedModule) return { error: "The selected module does not exist." };

  const existingLesson = await db.lesson.findFirst({ where: { module_id: moduleId, slug } });
  if (existingLesson) return { error: "A lesson with this slug already exists in that module." };

  const lastLesson = await db.lesson.findFirst({
    where: { module_id: moduleId },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  const isFree = formData.get("isFree") !== "false";
  const priceRaw = String(formData.get("price") ?? "").trim();
  const price = !isFree && priceRaw ? parseFloat(priceRaw) : null;
  const currency = String(formData.get("currency") ?? "USD").trim().toUpperCase() || "USD";

  await db.lesson.create({
    data: {
      module_id: moduleId,
      title,
      slug,
      position: (lastLesson?.position ?? -1) + 1,
      published: false,
      is_free: isFree,
      price: price !== null && !isNaN(price) ? price : null,
      currency,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/lessons");
  revalidatePath("/admin/modules");
  return { success: "Lesson created as a draft." };
}
