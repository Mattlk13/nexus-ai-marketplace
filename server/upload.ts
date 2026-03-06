/**
 * File Upload Route — handles multipart/form-data uploads from Creator Studio.
 *
 * Memory-safe design:
 *  - Uses multer DISK storage (not memory) to prevent OOM on large files
 *  - Streams files from disk directly to S3 using fs.createReadStream
 *  - Cleans up temp files after upload (success or failure)
 *  - Hard limit: 500 MB per file, 1 file per request
 *
 * Security:
 *  - Sanitizes filenames with sanitize-filename
 *  - Validates MIME types against an allow-list
 *  - Authenticates every request via session cookie
 *  - Prevents path traversal via sanitized keys
 */

import { Router, Request, Response, Express } from "express";
import multer, { FileFilterCallback } from "multer";
import { createReadStream, unlinkSync, existsSync } from "fs";
import { tmpdir } from "os";
import sanitize from "sanitize-filename";
import { getDb } from "./db";
import { uploadedFiles, users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { storagePut } from "./storage";
import { sdk } from "./_core/sdk";

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500 MB

// Allowed MIME types per category
const CATEGORY_MIME_MAP: Record<string, string[]> = {
  music: [
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/ogg",
    "audio/flac",
    "audio/aac",
    "audio/x-m4a",
  ],
  video: [
    "video/mp4",
    "video/webm",
    "video/ogg",
    "video/quicktime",
    "video/x-msvideo",
  ],
  ebook: [
    "application/pdf",
    "application/epub+zip",
    "application/x-mobipocket-ebook",
  ],
  image: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml",
  ],
  document: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ],
};

export function detectCategory(
  mimeType: string
): "music" | "video" | "ebook" | "image" | "document" | "other" {
  for (const [cat, mimes] of Object.entries(CATEGORY_MIME_MAP)) {
    if (mimes.includes(mimeType))
      return cat as "music" | "video" | "ebook" | "image" | "document";
  }
  return "other";
}

export function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function getAllowedMimeTypes(): string[] {
  return Object.values(CATEGORY_MIME_MAP).flat();
}

export function buildFileKey(
  userId: number,
  category: string,
  safeBase: string,
  ext: string
): string {
  return `uploads/${userId}/${category}/${safeBase}-${randomSuffix()}.${ext}`;
}

// ─── Multer: DISK storage to avoid memory exhaustion ─────────────────────────
const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, tmpdir()); // Write to OS temp dir, not memory
  },
  filename: (_req, file, cb) => {
    const safe = sanitize(file.originalname).replace(/\s+/g, "_") || "upload";
    cb(null, `nexus-upload-${Date.now()}-${safe}`);
  },
});

const upload = multer({
  storage: diskStorage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1, // Only one file per request
  },
  fileFilter: (
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ) => {
    const allAllowed = getAllowedMimeTypes();
    if (allAllowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Unsupported file type: ${file.mimetype}. Allowed: audio, video, PDF, ePub, image`
        )
      );
    }
  },
});

/** Safely delete a temp file, ignoring errors */
function cleanupTempFile(path: string | undefined): void {
  if (path && existsSync(path)) {
    try {
      unlinkSync(path);
    } catch {
      // Ignore cleanup errors — OS will clean /tmp eventually
    }
  }
}

/** Parse session cookie and return openId, or null on failure */
async function getOpenIdFromCookies(req: Request): Promise<string | null> {
  try {
    const user = await sdk.authenticateRequest(req);
    return user.openId;
  } catch {
    return null;
  }
}

export function registerUploadRoutes(app: Express) {
  const uploadRouter = Router();

  // ─── POST /api/upload — authenticated multipart upload (disk → S3 stream) ──
  uploadRouter.post(
    "/",
    upload.single("file"),
    async (req: Request, res: Response) => {
      const tempPath = (req as Request & { file?: Express.Multer.File }).file
        ?.path;

      try {
        const openId = await getOpenIdFromCookies(req);
        if (!openId) {
          cleanupTempFile(tempPath);
          res.status(401).json({ error: "Not authenticated" });
          return;
        }

        const file = (req as Request & { file?: Express.Multer.File }).file;
        if (!file) {
          res.status(400).json({ error: "No file provided" });
          return;
        }

        const db = await getDb();
        if (!db) {
          cleanupTempFile(tempPath);
          res.status(503).json({ error: "Database unavailable" });
          return;
        }

        const [userRow] = await db
          .select()
          .from(users)
          .where(eq(users.openId, openId))
          .limit(1);
        if (!userRow) {
          cleanupTempFile(tempPath);
          res.status(404).json({ error: "User not found" });
          return;
        }

        const { mimetype, originalname, size } = file;
        const category = detectCategory(mimetype);

        // Sanitize filename to prevent path traversal
        const sanitizedName =
          sanitize(originalname).replace(/\s+/g, "_") || "upload";
        const ext = (sanitizedName.split(".").pop() ?? "bin")
          .slice(0, 10)
          .toLowerCase();
        const safeBase = sanitizedName.replace(/\.[^.]+$/, "").slice(0, 80);
        const fileKey = buildFileKey(userRow.id, category, safeBase, ext);

        // Stream from disk to S3 — never loads full file into memory
        const fileStream = createReadStream(file.path);
        const { url } = await storagePut(fileKey, fileStream, mimetype);

        // Cleanup temp file immediately after successful S3 upload
        cleanupTempFile(tempPath);

        // Save metadata to DB
        const title =
          (req.body.title as string)?.slice(0, 200) ||
          sanitizedName.replace(/\.[^.]+$/, "");
        const description =
          (req.body.description as string)?.slice(0, 2000) || "";
        const price = Math.max(0, parseFloat(req.body.price ?? "0") || 0);
        const isFree = price === 0;

        const [inserted] = await db
          .insert(uploadedFiles)
          .values({
            userId: userRow.id,
            fileName: safeBase,
            originalName: originalname.slice(0, 255),
            fileKey,
            fileUrl: url,
            mimeType: mimetype,
            fileSize: size,
            fileCategory: category,
            title,
            description,
            price: String(price),
            isFree,
            isPublished: false,
          })
          .$returningId();

        res.json({
          success: true,
          fileId: inserted.id,
          fileUrl: url,
          fileKey,
          category,
          title,
          size,
          mimeType: mimetype,
        });
      } catch (err: unknown) {
        cleanupTempFile(tempPath); // Always cleanup on error
        const message = err instanceof Error ? err.message : "Upload failed";
        console.error("[Upload Error]", message);

        // Return appropriate status for multer size limit errors
        if (message.includes("File too large")) {
          res.status(413).json({ error: `File exceeds 500 MB limit` });
          return;
        }

        res.status(500).json({ error: message });
      }
    }
  );

  // ─── GET /api/upload/my-files — list authenticated user's uploaded files ───
  uploadRouter.get("/my-files", async (req: Request, res: Response) => {
    try {
      const openId = await getOpenIdFromCookies(req);
      if (!openId) {
        res.status(401).json({ error: "Not authenticated" });
        return;
      }

      const db = await getDb();
      if (!db) {
        res.status(503).json({ error: "Database unavailable" });
        return;
      }

      const [userRow] = await db
        .select()
        .from(users)
        .where(eq(users.openId, openId))
        .limit(1);
      if (!userRow) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const page = Math.max(1, parseInt((req.query.page as string) ?? "1"));
      const limit = Math.min(
        50,
        Math.max(1, parseInt((req.query.limit as string) ?? "20"))
      );
      const offset = (page - 1) * limit;

      const files = await db
        .select()
        .from(uploadedFiles)
        .where(eq(uploadedFiles.userId, userRow.id))
        .orderBy(uploadedFiles.createdAt)
        .limit(limit)
        .offset(offset);

      res.json({ files, page, limit });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to list files";
      res.status(500).json({ error: message });
    }
  });

  // ─── PATCH /api/upload/:id/publish — toggle publish status ────────────────
  uploadRouter.patch("/:id/publish", async (req: Request, res: Response) => {
    try {
      const openId = await getOpenIdFromCookies(req);
      if (!openId) {
        res.status(401).json({ error: "Not authenticated" });
        return;
      }

      const db = await getDb();
      if (!db) {
        res.status(503).json({ error: "Database unavailable" });
        return;
      }

      const [userRow] = await db
        .select()
        .from(users)
        .where(eq(users.openId, openId))
        .limit(1);
      if (!userRow) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const fileId = parseInt(req.params.id);
      if (isNaN(fileId) || fileId <= 0) {
        res.status(400).json({ error: "Invalid file ID" });
        return;
      }

      const [file] = await db
        .select()
        .from(uploadedFiles)
        .where(eq(uploadedFiles.id, fileId))
        .limit(1);

      if (!file || file.userId !== userRow.id) {
        res.status(404).json({ error: "File not found" });
        return;
      }

      const newPublished = !file.isPublished;
      await db
        .update(uploadedFiles)
        .set({ isPublished: newPublished })
        .where(eq(uploadedFiles.id, fileId));

      res.json({ success: true, isPublished: newPublished });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update file";
      res.status(500).json({ error: message });
    }
  });

  // ─── DELETE /api/upload/:id — delete a file ────────────────────────────────
  uploadRouter.delete("/:id", async (req: Request, res: Response) => {
    try {
      const openId = await getOpenIdFromCookies(req);
      if (!openId) {
        res.status(401).json({ error: "Not authenticated" });
        return;
      }

      const db = await getDb();
      if (!db) {
        res.status(503).json({ error: "Database unavailable" });
        return;
      }

      const [userRow] = await db
        .select()
        .from(users)
        .where(eq(users.openId, openId))
        .limit(1);
      if (!userRow) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const fileId = parseInt(req.params.id);
      if (isNaN(fileId) || fileId <= 0) {
        res.status(400).json({ error: "Invalid file ID" });
        return;
      }

      const [file] = await db
        .select()
        .from(uploadedFiles)
        .where(eq(uploadedFiles.id, fileId))
        .limit(1);

      if (!file || file.userId !== userRow.id) {
        res.status(404).json({ error: "File not found" });
        return;
      }

      // Delete from DB (S3 object remains for CDN caching — add S3 delete if needed)
      await db.delete(uploadedFiles).where(eq(uploadedFiles.id, fileId));
      res.json({ success: true });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to delete file";
      res.status(500).json({ error: message });
    }
  });

  app.use("/api/upload", uploadRouter);
}
