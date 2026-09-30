import "server-only";

import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

export async function saveLocalUpload(
  file: File,
  allowedTypes: Set<string>,
  maxSize: number,
  subfolder: string = "",
  allowedExtensions?: Set<string>
) {
  if (!file || file.size === 0) throw new Error("Choose a file to upload.");

  const extension = path.extname(file.name).toLowerCase().replace(/[^a-z0-9.]/g, "");
  const typeMatches = file.type ? allowedTypes.has(file.type) : false;
  const extMatches = allowedExtensions ? allowedExtensions.has(extension) : false;

  if (!typeMatches && !extMatches) {
    throw new Error(`This file type (${file.type || extension || "unknown"}) is not supported.`);
  }

  if (file.size > maxSize) {
    const maxMb = Math.round(maxSize / (1024 * 1024));
    throw new Error(`The file exceeds the ${maxMb}MB size limit.`);
  }

  const filename = `${randomUUID()}${extension}`;
  const directory = subfolder
    ? path.join(process.cwd(), "public", "uploads", subfolder)
    : path.join(process.cwd(), "public", "uploads");

  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, filename), Buffer.from(await file.arrayBuffer()));

  const publicUrl = subfolder ? `/uploads/${subfolder}/${filename}` : `/uploads/${filename}`;

  const resolvedMime = file.type || getMimeFromExtension(extension);

  return {
    url: publicUrl,
    size: file.size,
    mimeType: resolvedMime,
    filename,
  };
}

export async function deleteLocalUpload(publicUrl: string) {
  try {
    if (!publicUrl.startsWith("/uploads/")) return;
    const relativePath = publicUrl.replace(/^\/uploads\//, "");
    const fullPath = path.join(process.cwd(), "public", "uploads", relativePath);
    await unlink(fullPath);
  } catch {
    // Ignore if file doesn't exist on disk
  }
}

function getMimeFromExtension(ext: string): string {
  switch (ext.toLowerCase()) {
    case ".mp4":
    case ".m4v":
      return "video/mp4";
    case ".webm":
      return "video/webm";
    case ".mov":
      return "video/quicktime";
    case ".mkv":
      return "video/x-matroska";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".pdf":
      return "application/pdf";
    default:
      return "application/octet-stream";
  }
}
