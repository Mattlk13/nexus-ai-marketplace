import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import {
  agentLogs, auctions, contentItems, feedPosts,
  orders, products, seoPages, users, vendorStores
} from "../drizzle/schema";
import { desc, eq, and, like, sql } from "drizzle-orm";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import { notifyOwner } from "./_core/notification";

// ─── Feed Router ──────────────────────────────────────────────────────────────
const feedRouter = router({
  list: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(20), offset: z.number().default(0) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { posts: [], total: 0 };
      const posts = await db.select().from(feedPosts)
        .orderBy(desc(feedPosts.createdAt))
        .limit(input.limit).offset(input.offset);
      return { posts };
    }),

  trending: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(feedPosts)
      .where(eq(feedPosts.isTrending, true))
      .orderBy(desc(feedPosts.likeCount))
      .limit(10);
  }),

  create: protectedProcedure
    .input(z.object({
      body: z.string().min(1).max(2000),
      contentType: z.enum(["text", "image", "video", "music", "ebook", "product", "story"]).default("text"),
      mediaUrl: z.string().url().optional(),
      isStory: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const userRow = await db.select().from(users).where(eq(users.openId, ctx.user.openId)).limit(1);
      if (!userRow[0]) throw new Error("User not found");
      const [post] = await db.insert(feedPosts).values({
        userId: userRow[0].id,
        body: input.body,
        contentType: input.contentType,
        mediaUrl: input.mediaUrl,
        isStory: input.isStory,
        storyExpiresAt: input.isStory ? new Date(Date.now() + 24 * 60 * 60 * 1000) : undefined,
      }).$returningId();
      return { id: post.id, success: true };
    }),
});

// ─── Content Router ───────────────────────────────────────────────────────────
const contentRouter = router({
  list: publicProcedure
    .input(z.object({
      contentType: z.enum(["music", "video", "ebook", "art", "writing", "course", "template", "other"]).optional(),
      limit: z.number().min(1).max(50).default(20),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { items: [] };
      const conditions = [eq(contentItems.isPublished, true)];
      if (input.contentType) conditions.push(eq(contentItems.contentType, input.contentType));
      const items = await db.select().from(contentItems)
        .where(and(...conditions))
        .orderBy(desc(contentItems.createdAt))
        .limit(input.limit).offset(input.offset);
      return { items };
    }),

  spotlight: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(contentItems)
      .where(and(eq(contentItems.isSpotlighted, true), eq(contentItems.isPublished, true)))
      .orderBy(desc(contentItems.likeCount))
      .limit(6);
  }),

  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(255),
      description: z.string().optional(),
      contentType: z.enum(["music", "video", "ebook", "art", "writing", "course", "template", "other"]),
      fileUrl: z.string().url().optional(),
      previewUrl: z.string().url().optional(),
      thumbnailUrl: z.string().url().optional(),
      price: z.number().min(0).default(0),
      isFree: z.boolean().default(false),
      tags: z.array(z.string()).optional(),
      genre: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const userRow = await db.select().from(users).where(eq(users.openId, ctx.user.openId)).limit(1);
      if (!userRow[0]) throw new Error("User not found");
      const [item] = await db.insert(contentItems).values({
        userId: userRow[0].id,
        title: input.title,
        description: input.description,
        contentType: input.contentType,
        fileUrl: input.fileUrl,
        previewUrl: input.previewUrl,
        thumbnailUrl: input.thumbnailUrl,
        price: String(input.price),
        isFree: input.isFree,
        tags: input.tags ? JSON.stringify(input.tags) : undefined,
        genre: input.genre,
        isPublished: true,
      }).$returningId();
      await notifyOwner({ title: "New Content Published", content: `${ctx.user.name} published "${input.title}" (${input.contentType})` });
      return { id: item.id, success: true };
    }),

  generateWithAI: protectedProcedure
    .input(z.object({
      prompt: z.string().min(10).max(500),
      contentType: z.enum(["writing", "ebook", "blog"]),
    }))
    .mutation(async ({ input }) => {
      const response = await invokeLLM({
        messages: [
          { role: "system", content: `You are a professional ${input.contentType} writer for a creative marketplace. Write compelling, high-quality content that creators can sell. Return a JSON object with fields: title, content, tags (array of 5 strings), description.` },
          { role: "user", content: input.prompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "generated_content",
            strict: true,
            schema: {
              type: "object",
              properties: {
                title: { type: "string" },
                content: { type: "string" },
                description: { type: "string" },
                tags: { type: "array", items: { type: "string" } },
              },
              required: ["title", "content", "description", "tags"],
              additionalProperties: false,
            },
          },
        },
      });
      const raw = (response.choices?.[0]?.message?.content as string) ?? "{}";
      return JSON.parse(raw);
    }),
});

// ─── Marketplace / Products Router ───────────────────────────────────────────
const marketplaceRouter = router({
  products: publicProcedure
    .input(z.object({
      category: z.string().optional(),
      search: z.string().optional(),
      source: z.enum(["dropship", "vendor", "p2p"]).optional(),
      limit: z.number().min(1).max(100).default(24),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { products: [] };
      const conditions = [eq(products.isActive, true)];
      if (input.category) conditions.push(eq(products.category, input.category));
      if (input.source) conditions.push(eq(products.source, input.source));
      if (input.search) conditions.push(like(products.title, `%${input.search}%`));
      const rows = await db.select().from(products)
        .where(and(...conditions))
        .orderBy(desc(products.salesCount))
        .limit(input.limit).offset(input.offset);
      return { products: rows };
    }),

  auctions: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(auctions)
      .where(eq(auctions.status, "active"))
      .orderBy(desc(auctions.endsAt))
      .limit(20);
  }),

  placeBid: protectedProcedure
    .input(z.object({ auctionId: z.number(), amount: z.number().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const [auction] = await db.select().from(auctions).where(eq(auctions.id, input.auctionId)).limit(1);
      if (!auction) throw new Error("Auction not found");
      if (auction.status !== "active") throw new Error("Auction is not active");
      const currentBid = parseFloat(String(auction.currentBid ?? auction.startingBid));
      if (input.amount <= currentBid) throw new Error(`Bid must exceed current bid of $${currentBid}`);
      const userRow = await db.select().from(users).where(eq(users.openId, ctx.user.openId)).limit(1);
      if (!userRow[0]) throw new Error("User not found");
      await db.update(auctions).set({
        currentBid: String(input.amount),
        bidCount: sql`${auctions.bidCount} + 1`,
        winnerId: userRow[0].id,
      }).where(eq(auctions.id, input.auctionId));
      return { success: true, newBid: input.amount };
    }),
});

// ─── Vendor Router ────────────────────────────────────────────────────────────
const vendorRouter = router({
  myStore: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;
    const userRow = await db.select().from(users).where(eq(users.openId, ctx.user.openId)).limit(1);
    if (!userRow[0]) return null;
    const [store] = await db.select().from(vendorStores).where(eq(vendorStores.userId, userRow[0].id)).limit(1);
    return store ?? null;
  }),

  createStore: protectedProcedure
    .input(z.object({
      storeName: z.string().min(2).max(128),
      description: z.string().optional(),
      category: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const userRow = await db.select().from(users).where(eq(users.openId, ctx.user.openId)).limit(1);
      if (!userRow[0]) throw new Error("User not found");
      const slug = input.storeName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const [store] = await db.insert(vendorStores).values({
        userId: userRow[0].id,
        storeName: input.storeName,
        storeSlug: `${slug}-${Date.now()}`,
        description: input.description,
        category: input.category,
      }).$returningId();
      // Upgrade user role to vendor
      await db.update(users).set({ role: "vendor" }).where(eq(users.openId, ctx.user.openId));
      await notifyOwner({ title: "New Vendor Store Created", content: `${ctx.user.name} opened "${input.storeName}"` });
      return { id: store.id, success: true };
    }),

  topVendors: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(vendorStores)
      .where(eq(vendorStores.isActive, true))
      .orderBy(desc(vendorStores.totalRevenue))
      .limit(10);
  }),
});

// ─── AI Agent / Dashboard Router ─────────────────────────────────────────────
const agentRouter = router({
  logs: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(20) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(agentLogs)
        .orderBy(desc(agentLogs.createdAt))
        .limit(input.limit);
    }),

  stats: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { totalProducts: 0, totalContent: 0, totalVendors: 0, totalOrders: 0 };
    const [productCount] = await db.select({ count: sql<number>`count(*)` }).from(products);
    const [contentCount] = await db.select({ count: sql<number>`count(*)` }).from(contentItems);
    const [vendorCount] = await db.select({ count: sql<number>`count(*)` }).from(vendorStores);
    const [orderCount] = await db.select({ count: sql<number>`count(*)` }).from(orders);
    return {
      totalProducts: productCount?.count ?? 0,
      totalContent: contentCount?.count ?? 0,
      totalVendors: vendorCount?.count ?? 0,
      totalOrders: orderCount?.count ?? 0,
    };
  }),

  runSEO: protectedProcedure
    .input(z.object({ topic: z.string().min(5).max(200) }))
    .mutation(async ({ input }) => {
      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are an expert SEO content writer. Generate a complete SEO-optimized blog post for a marketplace website. Return JSON with: title, slug, metaDescription, content (HTML), keywords (array of 10 strings)." },
          { role: "user", content: `Write an SEO blog post about: ${input.topic}` },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "seo_post",
            strict: true,
            schema: {
              type: "object",
              properties: {
                title: { type: "string" },
                slug: { type: "string" },
                metaDescription: { type: "string" },
                content: { type: "string" },
                keywords: { type: "array", items: { type: "string" } },
              },
              required: ["title", "slug", "metaDescription", "content", "keywords"],
              additionalProperties: false,
            },
          },
        },
      });
      const raw = (response.choices?.[0]?.message?.content as string) ?? "{}";
      const data = JSON.parse(raw);
      const db = await getDb();
      if (db) {
        await db.insert(seoPages).values({
          slug: `${data.slug}-${Date.now()}`,
          title: data.title,
          metaDescription: data.metaDescription,
          content: data.content,
          keywords: JSON.stringify(data.keywords),
          pageType: "blog",
          isPublished: true,
        });
      }
      await notifyOwner({ title: "SEO Agent: New Blog Post", content: `Published: "${data.title}"` });
      return { success: true, title: data.title, slug: data.slug };
    }),
});

// ─── App Router ───────────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  feed: feedRouter,
  content: contentRouter,
  marketplace: marketplaceRouter,
  vendor: vendorRouter,
  agent: agentRouter,
});

export type AppRouter = typeof appRouter;
