import crypto from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { MAX_DOCUMENT_BYTES } from "@/lib/document";

const DEFAULT_MAX_BYTES = MAX_DOCUMENT_BYTES;

const guessExtensionFromMimeType = (mimeType: string): string => {
  switch (mimeType) {
    case "application/pdf":
      return ".pdf";
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    default:
      return "";
  }
};

export const savePublicDocument = async ({
  file,
  publicSubdir = "uploads/document-store",
  allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"],
  maxBytes = DEFAULT_MAX_BYTES,
}: {
  file: File;
  publicSubdir?: string;
  allowedMimeTypes?: string[];
  maxBytes?: number;
}): Promise<{
  publicPath: string;
  originalName: string;
  mimeType: string;
  size: number;
}> => {
  if (!allowedMimeTypes.includes(file.type)) {
    throw new Error("Unsupported file type");
  }
  if (file.size > maxBytes) {
    throw new Error("File size too large");
  }

  const originalName = file.name || "document";
  const extFromName = path.extname(originalName);
  const ext = extFromName || guessExtensionFromMimeType(file.type);

  const fileName = `${crypto.randomUUID()}${ext}`;
  const absDir = path.join(process.cwd(), "public", ...publicSubdir.split("/"));
  const absPath = path.join(absDir, fileName);

  await fs.mkdir(absDir, { recursive: true });
  const buf = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(absPath, buf);

  const publicPath = path.posix.join("/", publicSubdir, fileName);

  return {
    publicPath,
    originalName,
    mimeType: file.type,
    size: file.size,
  };
};

export const deletePublicDocument = async (publicPath: string) => {
  const normalized = publicPath.startsWith("/")
    ? publicPath.slice(1)
    : publicPath;
  const absPath = path.join(process.cwd(), "public", ...normalized.split("/"));
  await fs.unlink(absPath);
};
