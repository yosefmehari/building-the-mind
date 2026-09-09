"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export type ModuleFormState = { error?: string; success?: string };

export async function createModule(
  _state: ModuleFormState | undefined,
  formData: FormData
): Promise<ModuleFormState> {
  await requireAdmin();

  const courseIdValue = String(formData.get("courseId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  if (!/^\d+$/.test(courseIdValue) || title.length < 2 || title.length > 255) {
    return { error: "Choose a course and enter a title between 2 and 255 characters." };
  }

  const courseId = BigInt(courseIdValue);
  const course = await db.course.findUnique({ where: { id: courseId }, select: { id: true } });
  if (!course) return { error: "The selected course does not exist." };

  const lastModule = await db.module.findFirst({
    where: { course_id: courseId },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  await db.module.create({
    data: {
      course_id: courseId,
      title,
      position: (lastModule?.position ?? -1) + 1,
      published: false,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/modules");
  revalidatePath("/admin/courses");
  return { success: "Module created as a draft." };
}

export async function deleteModule(formData: FormData) {
  await requireAdmin();
  const idValue = String(formData.get("moduleId") ?? "");
  if (!/^\d+$/.test(idValue)) throw new Error("Invalid module.");

  await db.module.delete({ where: { id: BigInt(idValue) } });
  revalidatePath("/admin");
  revalidatePath("/admin/modules");
  revalidatePath("/admin/lessons");
  revalidatePath("/courses");
}
