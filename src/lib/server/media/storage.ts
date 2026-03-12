import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";

import type { MediaKind, StoredMediaAsset } from "./types";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "audio/mpeg",
]);

const MAX_UPLOAD_SIZE = 100 * 1024 * 1024;

function ensureUploadDirExists(uploadDir: string): void {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
}

export function getUploadDir(): string {
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  ensureUploadDirExists(uploadDir);
  return uploadDir;
}

export function getFileIdFromUrl(url: string): string {
  return path.basename(url);
}

export function getAbsolutePathFromUploadUrl(url: string): string | null {
  if (!url.startsWith("/uploads/")) {
    return null;
  }
  const filename = path.basename(url);
  return path.join(getUploadDir(), filename);
}

export async function deleteUploadByUrl(url?: string | null): Promise<void> {
  if (!url) {
    return;
  }
  const absolutePath = getAbsolutePathFromUploadUrl(url);
  if (!absolutePath) {
    return;
  }
  try {
    await fsPromises.unlink(absolutePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error("Failed to delete upload file:", absolutePath, error);
    }
  }
}

function inferMediaType(mimeType: string): MediaKind {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  return "audio";
}

export async function storeUploadedFile(file: File): Promise<StoredMediaAsset> {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error("Unsupported file type");
  }
  if (file.size > MAX_UPLOAD_SIZE) {
    throw new Error("File size exceeds 100MB limit");
  }

  const uploadDir = getUploadDir();
  const ext = path.extname(file.name) || ".bin";
  const filename = `${uuidv4()}${ext}`;
  const absolutePath = path.join(uploadDir, filename);
  const bytes = Buffer.from(await file.arrayBuffer());
  await fsPromises.writeFile(absolutePath, bytes);

  const type = inferMediaType(file.type);
  const asset: StoredMediaAsset = {
    url: `/uploads/${filename}`,
    filename,
    type,
    size: file.size,
  };

  if (type === "image") {
    const image = sharp(absolutePath);
    const metadata = await image.metadata();
    const thumbnailFilename = `thumb_${filename}`;
    const thumbnailAbsolutePath = path.join(uploadDir, thumbnailFilename);
    await image.resize(300).toFile(thumbnailAbsolutePath);

    asset.thumbnailUrl = `/uploads/${thumbnailFilename}`;
    asset.width = metadata.width;
    asset.height = metadata.height;
  }

  return asset;
}
