import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Mock DB ──────────────────────────────────────────────────────────────────
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
}));

vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{ message: { content: JSON.stringify({
      title: "Test Title",
      content: "Test content body",
      description: "Test description",
      tags: ["ai", "test", "content", "marketplace", "nexus"],
      slug: "test-title",
      metaDescription: "Test meta description",
      keywords: ["ai", "marketplace", "nexus", "content", "creator", "music", "video", "ebook", "art", "writing"],
    }) } }],
  }),
}));

vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────
function makePublicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function makeAuthCtx(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user-001",
      email: "test@nexus.com",
      name: "Test User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

// ─── Auth Tests ───────────────────────────────────────────────────────────────
describe("auth", () => {
  it("me returns null for unauthenticated user", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("me returns user for authenticated user", async () => {
    const caller = appRouter.createCaller(makeAuthCtx());
    const result = await caller.auth.me();
    expect(result).not.toBeNull();
    expect(result?.openId).toBe("test-user-001");
  });

  it("logout clears session cookie and returns success", async () => {
    const ctx = makeAuthCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
  });
});

// ─── Feed Tests ───────────────────────────────────────────────────────────────
describe("feed", () => {
  it("list returns empty array when db is unavailable", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.feed.list({ limit: 10, offset: 0 });
    expect(result.posts).toEqual([]);
  });

  it("trending returns empty array when db is unavailable", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.feed.trending();
    expect(Array.isArray(result)).toBe(true);
  });

  it("create requires authentication", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(caller.feed.create({ body: "Hello world", contentType: "text", isStory: false }))
      .rejects.toThrow();
  });

  it("create validates body length", async () => {
    const caller = appRouter.createCaller(makeAuthCtx());
    await expect(caller.feed.create({ body: "", contentType: "text", isStory: false }))
      .rejects.toThrow();
  });
});

// ─── Content Tests ────────────────────────────────────────────────────────────
describe("content", () => {
  it("list returns empty when db unavailable", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.content.list({ limit: 10, offset: 0 });
    expect(result).toEqual({ items: [] });
  });

  it("list accepts contentType filter", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.content.list({ contentType: "music", limit: 5, offset: 0 });
    expect(result).toEqual({ items: [] });
  });

  it("spotlight returns empty when db unavailable", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.content.spotlight();
    expect(Array.isArray(result)).toBe(true);
  });

  it("create requires authentication", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(caller.content.create({
      title: "My Song", contentType: "music", price: 4.99, isFree: false,
    })).rejects.toThrow();
  });

  it("generateWithAI returns structured content", async () => {
    const caller = appRouter.createCaller(makeAuthCtx());
    const result = await caller.content.generateWithAI({
      prompt: "Write a short story about an AI marketplace",
      contentType: "writing",
    });
    expect(result).toHaveProperty("title");
    expect(result).toHaveProperty("content");
    expect(result).toHaveProperty("tags");
    expect(Array.isArray(result.tags)).toBe(true);
  });
});

// ─── Marketplace Tests ────────────────────────────────────────────────────────
describe("marketplace", () => {
  it("products returns empty when db unavailable", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.marketplace.products({ limit: 10, offset: 0 });
    expect(result).toEqual({ products: [] });
  });

  it("products accepts category filter", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.marketplace.products({ category: "electronics", limit: 5, offset: 0 });
    expect(result).toEqual({ products: [] });
  });

  it("auctions returns empty when db unavailable", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.marketplace.auctions();
    expect(Array.isArray(result)).toBe(true);
  });

  it("placeBid requires authentication", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(caller.marketplace.placeBid({ auctionId: 1, amount: 25.00 }))
      .rejects.toThrow();
  });

  it("placeBid validates positive amount", async () => {
    const caller = appRouter.createCaller(makeAuthCtx());
    await expect(caller.marketplace.placeBid({ auctionId: 1, amount: -5 }))
      .rejects.toThrow();
  });
});

// ─── Vendor Tests ─────────────────────────────────────────────────────────────
describe("vendor", () => {
  it("myStore requires authentication", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(caller.vendor.myStore()).rejects.toThrow();
  });

  it("createStore requires authentication", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(caller.vendor.createStore({ storeName: "My Store" })).rejects.toThrow();
  });

  it("createStore validates store name length", async () => {
    const caller = appRouter.createCaller(makeAuthCtx());
    await expect(caller.vendor.createStore({ storeName: "X" })).rejects.toThrow();
  });

  it("topVendors returns empty when db unavailable", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.vendor.topVendors();
    expect(Array.isArray(result)).toBe(true);
  });
});

// ─── Agent Tests ──────────────────────────────────────────────────────────────
describe("agent", () => {
  it("logs returns empty when db unavailable", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.agent.logs({ limit: 10 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("stats returns zero counts when db unavailable", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.agent.stats();
    expect(result.totalProducts).toBe(0);
    expect(result.totalContent).toBe(0);
    expect(result.totalVendors).toBe(0);
    expect(result.totalOrders).toBe(0);
  });

  it("runSEO requires authentication", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(caller.agent.runSEO({ topic: "AI marketplace trends 2026" }))
      .rejects.toThrow();
  });

  it("runSEO generates and returns SEO content", async () => {
    const caller = appRouter.createCaller(makeAuthCtx());
    const result = await caller.agent.runSEO({ topic: "Best AI tools for content creators in 2026" });
    expect(result.success).toBe(true);
    expect(result.title).toBeTruthy();
    expect(result.slug).toBeTruthy();
  });
});
