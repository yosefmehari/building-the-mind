import "server-only";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

export async function saveLocalUpload(file: File, allowedTypes: Set<string>, maxSize: number) {
  if (!file || file.size === 0) throw new Error("Choose a file to upload.");
  if (!allowedTypes.has(file.type)) throw new Error("This file type is not supported.");
  if (file.size > maxSize) throw new Error("The file exceeds the allowed size limit.");

  const extension = path.extname(file.name).toLowerCase().replace(/[^a-z0-9.]/g, "");
  const filename = `${randomUUID()}${extension}`;
  const directory = path.join(process.cwd(), "public", "uploads");
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, filename), Buffer.from(await file.arrayBuffer()));
  return { url: `/uploads/${filename}`, size: file.size, mimeType: file.type, filename };
}
