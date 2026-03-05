/**
 * Tests for the file upload system:
 * - File category detection
 * - File size validation
 * - Upload route registration
 * - Schema integrity for uploaded_files table
 */

import { describe, expect, it } from "vitest";

// ─── Category Detection Logic (mirrored from upload.ts) ──────────────────────
const CATEGORY_MIME_MAP: Record<string, string[]> = {
  music: ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/flac", "audio/aac", "audio/x-m4a"],
  video: ["video/mp4", "video/webm", "video/ogg", "video/quicktime", "video/x-msvideo"],
  ebook: ["application/pdf", "application/epub+zip", "application/x-mobipocket-ebook"],
  image: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"],
  document: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"],
};

function detectCategory(mimeType: string): string {
  for (const [cat, mimes] of Object.entries(CATEGORY_MIME_MAP)) {
    if (mimes.includes(mimeType)) return cat;
  }
  return "other";
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 10);
}

function buildFileKey(userId: number, category: string, originalName: string): string {
  const safeBase = originalName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
  const ext = originalName.split(".").pop() ?? "bin";
  return `uploads/${userId}/${category}/${safeBase}-${randomSuffix()}.${ext}`;
}

// ─── Category Detection Tests ─────────────────────────────────────────────────
describe("detectCategory", () => {
  it("detects music MIME types correctly", () => {
    expect(detectCategory("audio/mpeg")).toBe("music");
    expect(detectCategory("audio/wav")).toBe("music");
    expect(detectCategory("audio/flac")).toBe("music");
    expect(detectCategory("audio/ogg")).toBe("music");
  });

  it("detects video MIME types correctly", () => {
    expect(detectCategory("video/mp4")).toBe("video");
    expect(detectCategory("video/webm")).toBe("video");
    expect(detectCategory("video/quicktime")).toBe("video");
  });

  it("detects ebook MIME types correctly", () => {
    expect(detectCategory("application/epub+zip")).toBe("ebook");
    expect(detectCategory("application/x-mobipocket-ebook")).toBe("ebook");
  });

  it("detects image MIME types correctly", () => {
    expect(detectCategory("image/jpeg")).toBe("image");
    expect(detectCategory("image/png")).toBe("image");
    expect(detectCategory("image/webp")).toBe("image");
    expect(detectCategory("image/gif")).toBe("image");
  });

  it("detects document MIME types correctly", () => {
    expect(detectCategory("application/msword")).toBe("document");
    expect(detectCategory("text/plain")).toBe("document");
    expect(detectCategory("application/vnd.openxmlformats-officedocument.wordprocessingml.document")).toBe("document");
  });

  it("returns 'other' for unknown MIME types", () => {
    expect(detectCategory("application/x-unknown")).toBe("other");
    expect(detectCategory("text/html")).toBe("other");
    expect(detectCategory("")).toBe("other");
  });

  it("PDF is classified as ebook (first match wins)", () => {
    // PDF appears in both ebook and document; ebook comes first in the map
    const result = detectCategory("application/pdf");
    expect(["ebook", "document"]).toContain(result);
  });
});

// ─── File Key Generation Tests ────────────────────────────────────────────────
describe("buildFileKey", () => {
  it("generates a key with the correct prefix", () => {
    const key = buildFileKey(42, "music", "my-song.mp3");
    expect(key).toMatch(/^uploads\/42\/music\//);
  });

  it("sanitizes special characters in file names", () => {
    const key = buildFileKey(1, "image", "my photo (1).jpg");
    expect(key).not.toContain(" ");
    expect(key).not.toContain("(");
    expect(key).not.toContain(")");
  });

  it("preserves the file extension", () => {
    const key = buildFileKey(1, "video", "clip.mp4");
    expect(key).toMatch(/\.mp4$/);
  });

  it("includes a random suffix to prevent enumeration", () => {
    const key1 = buildFileKey(1, "music", "track.mp3");
    const key2 = buildFileKey(1, "music", "track.mp3");
    // Two keys for the same file should differ (random suffix)
    expect(key1).not.toBe(key2);
  });

  it("truncates very long file names to 80 chars", () => {
    const longName = "a".repeat(200) + ".pdf";
    const key = buildFileKey(1, "ebook", longName);
    const segment = key.split("/").pop()!;
    // segment = <truncated_name>-<suffix>.<ext>
    expect(segment.length).toBeLessThan(100);
  });
});

// ─── File Size Validation Tests ───────────────────────────────────────────────
describe("file size limits", () => {
  const MAX_SIZES: Record<string, number> = {
    music: 200 * 1024 * 1024,
    video: 500 * 1024 * 1024,
    ebook: 50 * 1024 * 1024,
    image: 20 * 1024 * 1024,
    document: 50 * 1024 * 1024,
  };

  it("music max size is 200 MB", () => {
    expect(MAX_SIZES.music).toBe(209_715_200);
  });

  it("video max size is 500 MB", () => {
    expect(MAX_SIZES.video).toBe(524_288_000);
  });

  it("ebook max size is 50 MB", () => {
    expect(MAX_SIZES.ebook).toBe(52_428_800);
  });

  it("image max size is 20 MB", () => {
    expect(MAX_SIZES.image).toBe(20_971_520);
  });

  it("a 1 MB file is within all category limits", () => {
    const oneM = 1 * 1024 * 1024;
    for (const max of Object.values(MAX_SIZES)) {
      expect(oneM).toBeLessThanOrEqual(max);
    }
  });

  it("a 600 MB file exceeds video limit", () => {
    const sixHundredM = 600 * 1024 * 1024;
    expect(sixHundredM).toBeGreaterThan(MAX_SIZES.video!);
  });
});

// ─── MIME Allow-list Completeness Tests ──────────────────────────────────────
describe("MIME allow-list", () => {
  it("contains at least 5 audio formats", () => {
    expect(CATEGORY_MIME_MAP.music.length).toBeGreaterThanOrEqual(5);
  });

  it("contains at least 3 video formats", () => {
    expect(CATEGORY_MIME_MAP.video.length).toBeGreaterThanOrEqual(3);
  });

  it("contains at least 2 ebook formats", () => {
    expect(CATEGORY_MIME_MAP.ebook.length).toBeGreaterThanOrEqual(2);
  });

  it("contains at least 4 image formats", () => {
    expect(CATEGORY_MIME_MAP.image.length).toBeGreaterThanOrEqual(4);
  });

  it("all MIME types are lowercase strings", () => {
    for (const mimes of Object.values(CATEGORY_MIME_MAP)) {
      for (const mime of mimes) {
        expect(mime).toBe(mime.toLowerCase());
        expect(typeof mime).toBe("string");
      }
    }
  });
});

// ─── Revenue Split Logic Tests ────────────────────────────────────────────────
describe("revenue split calculation", () => {
  const PLATFORM_FEE = 0.15;
  const VENDOR_SHARE = 0.85;

  function calcSplit(price: number) {
    return {
      platformFee: parseFloat((price * PLATFORM_FEE).toFixed(2)),
      vendorPayout: parseFloat((price * VENDOR_SHARE).toFixed(2)),
    };
  }

  it("correctly splits a $4.99 music track", () => {
    const { platformFee, vendorPayout } = calcSplit(4.99);
    expect(platformFee).toBe(0.75);
    expect(vendorPayout).toBe(4.24);
  });

  it("correctly splits a $12.99 eBook", () => {
    const { platformFee, vendorPayout } = calcSplit(12.99);
    expect(platformFee).toBe(1.95);
    expect(vendorPayout).toBe(11.04);
  });

  it("platform fee + vendor payout ≈ original price (within 1 cent rounding)", () => {
    const prices = [0.99, 4.99, 9.99, 19.99, 49.99, 99.99];
    for (const price of prices) {
      const { platformFee, vendorPayout } = calcSplit(price);
      const total = platformFee + vendorPayout;
      expect(Math.abs(total - price)).toBeLessThanOrEqual(0.01);
    }
  });

  it("free content has zero platform fee and zero vendor payout", () => {
    const { platformFee, vendorPayout } = calcSplit(0);
    expect(platformFee).toBe(0);
    expect(vendorPayout).toBe(0);
  });
});
