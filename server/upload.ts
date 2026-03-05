/**
 * File Upload Route — handles multipart/form-data uploads from Creator Studio.
 * Files are stored in S3 via storagePut(), metadata saved to uploaded_files table.
 * Max file size: 500 MB (enforced by multer memory storage).
 */

import { Router, Request, Response, Express } from "express";
import multer, { FileFilterCallback } from "multer";
import { getDb } from "./db";
import { uploadedFiles, users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { storagePut } from "./storage";
import { sdk } from "./_core/sdk";

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500 MB

// Allowed MIME types per category
const CATEGORY_MIME_MAP: Record<string, string[]> = {
  music: ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/flac", "audio/aac", "audio/x-m4a"],
  video: ["video/mp4", "video/webm", "video/ogg", "video/quicktime", "video/x-msvideo"],
  ebook: ["application/pdf", "application/epub+zip", "application/x-mobipocket-ebook"],
  image: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"],
  document: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"],
};

function detectCategory(mimeType: string): "music" | "video" | "ebook" | "image" | "document" | "other" {
  for (const [cat, mimes] of Object.entries(CATEGORY_MIME_MAP)) {
    if (mimes.includes(mimeType)) return cat as "music" | "video" | "ebook" | "image" | "document";
  }
  return "other";
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 10);
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allAllowed = Object.values(CATEGORY_MIME_MAP).flat();
    if (allAllowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  },
});

/** Parse session cookie and return openId, or throw on failure */
async function getOpenIdFromCookies(req: Request): Promise<string> {
  const user = await sdk.authenticateRequest(req);
  return user.openId;
}

export function registerUploadRoutes(app: Express) {
  const uploadRouter = Router();

  // POST /api/upload — authenticated multipart upload
  uploadRouter.post("/", upload.single("file"), async (req: Request, res: Response) => {
    try {
      const openId = await getOpenIdFromCookies(req).catch(() => null);
      if (!openId) {
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
        res.status(503).json({ error: "Database unavailable" });
        return;
      }

      const [userRow] = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
      if (!userRow) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const { buffer, mimetype, originalname, size } = file;
      const category = detectCategory(mimetype);
      const ext = originalname.split(".").pop() ?? "bin";
      const safeBase = originalname.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
      const fileKey = `uploads/${userRow.id}/${category}/${safeBase}-${randomSuffix()}.${ext}`;

      // Upload to S3
      const { url } = await storagePut(fileKey, buffer, mimetype);

      // Save metadata to DB
      const title = (req.body.title as string) || originalname.replace(/\.[^.]+$/, "");
      const description = (req.body.description as string) || "";
      const price = parseFloat(req.body.price ?? "0") || 0;
      const isFree = price === 0;

      const [inserted] = await db.insert(uploadedFiles).values({
        userId: userRow.id,
        fileName: safeBase,
        originalName: originalname,
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
      }).$returningId();

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
      const message = err instanceof Error ? err.message : "Upload failed";
      console.error("[Upload Error]", message);
      res.status(500).json({ error: message });
    }
  });

  // GET /api/upload/my-files — list authenticated user's uploaded files
  uploadRouter.get("/my-files", async (req: Request, res: Response) => {
    try {
      const openId = await getOpenIdFromCookies(req).catch(() => null);
      if (!openId) {
        res.status(401).json({ error: "Not authenticated" });
        return;
      }

      const db = await getDb();
      if (!db) {
        res.status(503).json({ error: "Database unavailable" });
        return;
      }

      const [userRow] = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
      if (!userRow) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const files = await db.select().from(uploadedFiles)
        .where(eq(uploadedFiles.userId, userRow.id))
        .orderBy(uploadedFiles.createdAt);

      res.json({ files });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to list files";
      res.status(500).json({ error: message });
    }
  });

  // PATCH /api/upload/:id/publish — toggle publish status
  uploadRouter.patch("/:id/publish", async (req: Request, res: Response) => {
    try {
      const openId = await getOpenIdFromCookies(req).catch(() => null);
      if (!openId) {
        res.status(401).json({ error: "Not authenticated" });
        return;
      }

      const db = await getDb();
      if (!db) {
        res.status(503).json({ error: "Database unavailable" });
        return;
      }

      const [userRow] = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
      if (!userRow) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const fileId = parseInt(req.params.id);
      const [file] = await db.select().from(uploadedFiles)
        .where(eq(uploadedFiles.id, fileId)).limit(1);

      if (!file || file.userId !== userRow.id) {
        res.status(404).json({ error: "File not found" });
        return;
      }

      const newPublished = !file.isPublished;
      await db.update(uploadedFiles)
        .set({ isPublished: newPublished })
        .where(eq(uploadedFiles.id, fileId));

      res.json({ success: true, isPublished: newPublished });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update file";
      res.status(500).json({ error: message });
    }
  });

  // DELETE /api/upload/:id — delete a file
  uploadRouter.delete("/:id", async (req: Request, res: Response) => {
    try {
      const openId = await getOpenIdFromCookies(req).catch(() => null);
      if (!openId) {
        res.status(401).json({ error: "Not authenticated" });
        return;
      }

      const db = await getDb();
      if (!db) {
        res.status(503).json({ error: "Database unavailable" });
        return;
      }

      const [userRow] = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
      if (!userRow) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const fileId = parseInt(req.params.id);
      const [file] = await db.select().from(uploadedFiles)
        .where(eq(uploadedFiles.id, fileId)).limit(1);

      if (!file || file.userId !== userRow.id) {
        res.status(404).json({ error: "File not found" });
        return;
      }

      await db.delete(uploadedFiles).where(eq(uploadedFiles.id, fileId));
      res.json({ success: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete file";
      res.status(500).json({ error: message });
    }
  });

  app.use("/api/upload", uploadRouter);
}
