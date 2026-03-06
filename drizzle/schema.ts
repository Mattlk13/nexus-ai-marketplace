import {
  bigint,
  boolean,
  decimal,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// ─── Users ───────────────────────────────────────────────────────────────────
export const users = mysqlTable(
  "users",
  {
    id: int("id").autoincrement().primaryKey(),
    openId: varchar("openId", { length: 64 }).notNull().unique(),
    name: text("name"),
    email: varchar("email", { length: 320 }).unique(),
    loginMethod: varchar("loginMethod", { length: 64 }),
    role: mysqlEnum("role", ["user", "vendor", "admin"])
      .default("user")
      .notNull(),
    bio: text("bio"),
    avatarUrl: text("avatarUrl"),
    bannerUrl: text("bannerUrl"),
    website: varchar("website", { length: 255 }),
    totalEarnings: decimal("totalEarnings", {
      precision: 12,
      scale: 2,
    }).default("0.00"),
    followerCount: int("followerCount").default(0),
    followingCount: int("followingCount").default(0),
    isVerified: boolean("isVerified").default(false),
    stripeAccountId: varchar("stripeAccountId", { length: 128 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  },
  table => ({
    emailIdx: index("users_email_idx").on(table.email),
    roleIdx: index("users_role_idx").on(table.role),
  })
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Content Items (music, video, ebook, art, writing) ───────────────────────
export const contentItems = mysqlTable(
  "content_items",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    contentType: mysqlEnum("contentType", [
      "music",
      "video",
      "ebook",
      "art",
      "writing",
      "course",
      "template",
      "other",
    ]).notNull(),
    fileUrl: text("fileUrl"),
    previewUrl: text("previewUrl"),
    thumbnailUrl: text("thumbnailUrl"),
    price: decimal("price", { precision: 10, scale: 2 }).default("0.00"),
    isFree: boolean("isFree").default(false),
    isPublished: boolean("isPublished").default(false),
    tags: text("tags"), // JSON array stored as text
    genre: varchar("genre", { length: 100 }),
    likeCount: int("likeCount").default(0),
    viewCount: int("viewCount").default(0),
    downloadCount: int("downloadCount").default(0),
    salesCount: int("salesCount").default(0),
    totalRevenue: decimal("totalRevenue", { precision: 12, scale: 2 }).default(
      "0.00"
    ),
    isSpotlighted: boolean("isSpotlighted").default(false),
    spotlightCategory: varchar("spotlightCategory", { length: 64 }),
    copyrightRegistered: boolean("copyrightRegistered").default(false),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    userIdx: index("content_user_idx").on(table.userId),
    typeIdx: index("content_type_idx").on(table.contentType),
    publishedIdx: index("content_published_idx").on(table.isPublished),
    createdAtIdx: index("content_created_at_idx").on(table.createdAt),
  })
);

export type ContentItem = typeof contentItems.$inferSelect;
export type InsertContentItem = typeof contentItems.$inferInsert;

// ─── Vendor Stores ────────────────────────────────────────────────────────────
export const vendorStores = mysqlTable(
  "vendor_stores",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "restrict" }),
    storeName: varchar("storeName", { length: 128 }).notNull(),
    storeSlug: varchar("storeSlug", { length: 128 }).notNull().unique(),
    description: text("description"),
    logoUrl: text("logoUrl"),
    bannerUrl: text("bannerUrl"),
    category: varchar("category", { length: 64 }),
    totalSales: int("totalSales").default(0),
    totalRevenue: decimal("totalRevenue", { precision: 12, scale: 2 }).default(
      "0.00"
    ),
    rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
    reviewCount: int("reviewCount").default(0),
    isActive: boolean("isActive").default(true),
    commissionRate: decimal("commissionRate", {
      precision: 5,
      scale: 2,
    }).default("15.00"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    activeIdx: index("vendor_active_idx").on(table.isActive),
    revenueIdx: index("vendor_revenue_idx").on(table.totalRevenue),
  })
);

export type VendorStore = typeof vendorStores.$inferSelect;
export type InsertVendorStore = typeof vendorStores.$inferInsert;

// ─── Marketplace Products (dropship + vendor) ─────────────────────────────────
export const products = mysqlTable(
  "products",
  {
    id: int("id").autoincrement().primaryKey(),
    vendorId: int("vendorId"), // null = dropship product
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    imageUrl: text("imageUrl"),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    comparePrice: decimal("comparePrice", { precision: 10, scale: 2 }),
    costPrice: decimal("costPrice", { precision: 10, scale: 2 }),
    category: varchar("category", { length: 100 }),
    tags: text("tags"),
    source: mysqlEnum("source", ["dropship", "vendor", "p2p"]).default(
      "dropship"
    ),
    supplier: varchar("supplier", { length: 128 }),
    sku: varchar("sku", { length: 128 }),
    stockCount: int("stockCount").default(0),
    isActive: boolean("isActive").default(true),
    isFeatured: boolean("isFeatured").default(false),
    salesCount: int("salesCount").default(0),
    viewCount: int("viewCount").default(0),
    rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    vendorIdx: index("products_vendor_idx").on(table.vendorId),
    categoryIdx: index("products_category_idx").on(table.category),
    activeIdx: index("products_active_idx").on(table.isActive),
    sourceIdx: index("products_source_idx").on(table.source),
    salesIdx: index("products_sales_idx").on(table.salesCount),
  })
);

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// ─── Auctions ─────────────────────────────────────────────────────────────────
export const auctions = mysqlTable(
  "auctions",
  {
    id: int("id").autoincrement().primaryKey(),
    sellerId: int("sellerId")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    productId: int("productId"),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    imageUrl: text("imageUrl"),
    startingBid: decimal("startingBid", { precision: 10, scale: 2 }).notNull(),
    currentBid: decimal("currentBid", { precision: 10, scale: 2 }),
    reservePrice: decimal("reservePrice", { precision: 10, scale: 2 }),
    buyNowPrice: decimal("buyNowPrice", { precision: 10, scale: 2 }),
    bidCount: int("bidCount").default(0),
    winnerId: int("winnerId"),
    status: mysqlEnum("status", [
      "active",
      "ended",
      "cancelled",
      "sold",
    ]).default("active"),
    endsAt: timestamp("endsAt").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    statusIdx: index("auctions_status_idx").on(table.status),
    sellerIdx: index("auctions_seller_idx").on(table.sellerId),
    endsAtIdx: index("auctions_ends_at_idx").on(table.endsAt),
  })
);

export type Auction = typeof auctions.$inferSelect;
export type InsertAuction = typeof auctions.$inferInsert;

// ─── Social Feed Posts ────────────────────────────────────────────────────────
export const feedPosts = mysqlTable(
  "feed_posts",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    contentType: mysqlEnum("contentType", [
      "text",
      "image",
      "video",
      "music",
      "ebook",
      "product",
      "story",
    ]).default("text"),
    body: text("body"),
    mediaUrl: text("mediaUrl"),
    linkedContentId: int("linkedContentId"),
    linkedProductId: int("linkedProductId"),
    likeCount: int("likeCount").default(0),
    commentCount: int("commentCount").default(0),
    shareCount: int("shareCount").default(0),
    viewCount: int("viewCount").default(0),
    isStory: boolean("isStory").default(false),
    storyExpiresAt: timestamp("storyExpiresAt"),
    isTrending: boolean("isTrending").default(false),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    userIdx: index("feed_user_idx").on(table.userId),
    createdAtIdx: index("feed_created_at_idx").on(table.createdAt),
    trendingIdx: index("feed_trending_idx").on(table.isTrending),
  })
);

export type FeedPost = typeof feedPosts.$inferSelect;
export type InsertFeedPost = typeof feedPosts.$inferInsert;

// ─── Orders ───────────────────────────────────────────────────────────────────
export const orders = mysqlTable(
  "orders",
  {
    id: int("id").autoincrement().primaryKey(),
    buyerId: int("buyerId")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    sellerId: int("sellerId"),
    productId: int("productId"),
    contentItemId: int("contentItemId"),
    auctionId: int("auctionId"),
    orderType: mysqlEnum("orderType", [
      "product",
      "content",
      "auction",
    ]).notNull(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    platformFee: decimal("platformFee", { precision: 10, scale: 2 }).notNull(),
    vendorPayout: decimal("vendorPayout", { precision: 10, scale: 2 }),
    status: mysqlEnum("status", [
      "pending",
      "paid",
      "fulfilled",
      "refunded",
      "cancelled",
    ]).default("pending"),
    stripePaymentId: varchar("stripePaymentId", { length: 256 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    buyerIdx: index("orders_buyer_idx").on(table.buyerId),
    sellerIdx: index("orders_seller_idx").on(table.sellerId),
    statusIdx: index("orders_status_idx").on(table.status),
    createdAtIdx: index("orders_created_at_idx").on(table.createdAt),
  })
);

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

// ─── AI Agent Logs ────────────────────────────────────────────────────────────
export const agentLogs = mysqlTable(
  "agent_logs",
  {
    id: int("id").autoincrement().primaryKey(),
    agentName: varchar("agentName", { length: 64 }).notNull(),
    action: varchar("action", { length: 128 }).notNull(),
    result: text("result"),
    status: mysqlEnum("status", ["success", "error", "running"]).default(
      "running"
    ),
    productsImported: int("productsImported").default(0),
    revenueGenerated: decimal("revenueGenerated", {
      precision: 10,
      scale: 2,
    }).default("0.00"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    createdAtIdx: index("agent_logs_created_at_idx").on(table.createdAt),
    statusIdx: index("agent_logs_status_idx").on(table.status),
  })
);

export type AgentLog = typeof agentLogs.$inferSelect;

// ─── SEO Pages ────────────────────────────────────────────────────────────────
export const seoPages = mysqlTable(
  "seo_pages",
  {
    id: int("id").autoincrement().primaryKey(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    title: varchar("title", { length: 255 }).notNull(),
    metaDescription: text("metaDescription"),
    content: text("content"),
    keywords: text("keywords"),
    pageType: mysqlEnum("pageType", [
      "blog",
      "category",
      "product",
      "landing",
    ]).default("blog"),
    isPublished: boolean("isPublished").default(false),
    viewCount: int("viewCount").default(0),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    publishedIdx: index("seo_published_idx").on(table.isPublished),
    pageTypeIdx: index("seo_page_type_idx").on(table.pageType),
  })
);

export type SeoPage = typeof seoPages.$inferSelect;

// ─── Stripe Connect Accounts ─────────────────────────────────────────────────
export const stripeAccounts = mysqlTable(
  "stripe_accounts",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "restrict" }),
    stripeAccountId: varchar("stripeAccountId", { length: 128 })
      .notNull()
      .unique(),
    accountStatus: mysqlEnum("accountStatus", [
      "pending",
      "active",
      "restricted",
      "disabled",
    ]).default("pending"),
    chargesEnabled: boolean("chargesEnabled").default(false),
    payoutsEnabled: boolean("payoutsEnabled").default(false),
    detailsSubmitted: boolean("detailsSubmitted").default(false),
    country: varchar("country", { length: 2 }).default("US"),
    currency: varchar("currency", { length: 3 }).default("usd"),
    totalEarned: decimal("totalEarned", { precision: 12, scale: 2 }).default(
      "0.00"
    ),
    totalPaidOut: decimal("totalPaidOut", { precision: 12, scale: 2 }).default(
      "0.00"
    ),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    userIdx: index("stripe_accounts_user_idx").on(table.userId),
    statusIdx: index("stripe_accounts_status_idx").on(table.accountStatus),
  })
);

export type StripeAccount = typeof stripeAccounts.$inferSelect;
export type InsertStripeAccount = typeof stripeAccounts.$inferInsert;

// ─── Stripe Products (for content and marketplace items) ──────────────────────
export const stripeProducts = mysqlTable(
  "stripe_products",
  {
    id: int("id").autoincrement().primaryKey(),
    contentItemId: int("contentItemId"),
    productId: int("productId"),
    stripeProductId: varchar("stripeProductId", { length: 128 }).notNull(),
    stripePriceId: varchar("stripePriceId", { length: 128 }).notNull(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("usd"),
    isActive: boolean("isActive").default(true),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    contentItemIdx: index("stripe_products_content_idx").on(
      table.contentItemId
    ),
    productIdx: index("stripe_products_product_idx").on(table.productId),
  })
);

export type StripeProduct = typeof stripeProducts.$inferSelect;
export type InsertStripeProduct = typeof stripeProducts.$inferInsert;

// ─── Uploaded Files (S3 creator content) ─────────────────────────────────────
export const uploadedFiles = mysqlTable(
  "uploaded_files",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    fileName: varchar("fileName", { length: 255 }).notNull(),
    originalName: varchar("originalName", { length: 255 }).notNull(),
    fileKey: varchar("fileKey", { length: 512 }).notNull().unique(),
    fileUrl: text("fileUrl").notNull(),
    mimeType: varchar("mimeType", { length: 128 }).notNull(),
    fileSize: bigint("fileSize", { mode: "number" }).notNull(),
    fileCategory: mysqlEnum("fileCategory", [
      "music",
      "video",
      "ebook",
      "image",
      "document",
      "other",
    ]).notNull(),
    title: varchar("title", { length: 255 }),
    description: text("description"),
    isPublished: boolean("isPublished").default(false),
    price: decimal("price", { precision: 10, scale: 2 }).default("0.00"),
    isFree: boolean("isFree").default(true),
    downloadCount: int("downloadCount").default(0),
    linkedContentId: int("linkedContentId"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    userIdx: index("uploaded_files_user_idx").on(table.userId),
    categoryIdx: index("uploaded_files_category_idx").on(table.fileCategory),
    publishedIdx: index("uploaded_files_published_idx").on(table.isPublished),
    createdAtIdx: index("uploaded_files_created_at_idx").on(table.createdAt),
  })
);

export type UploadedFile = typeof uploadedFiles.$inferSelect;
export type InsertUploadedFile = typeof uploadedFiles.$inferInsert;

// ─── Stripe Webhook Events (idempotency) ─────────────────────────────────────
// Stores processed Stripe event IDs to prevent duplicate processing when
// Stripe retries webhook delivery. Check before processing any webhook event.
export const stripeEvents = mysqlTable(
  "stripe_events",
  {
    id: int("id").autoincrement().primaryKey(),
    eventId: varchar("eventId", { length: 128 }).notNull().unique(),
    eventType: varchar("eventType", { length: 128 }).notNull(),
    processedAt: timestamp("processedAt").defaultNow().notNull(),
    status: mysqlEnum("status", ["processed", "failed", "skipped"])
      .default("processed")
      .notNull(),
    errorMessage: text("errorMessage"),
  },
  table => ({
    eventIdIdx: index("stripe_events_event_id_idx").on(table.eventId),
    eventTypeIdx: index("stripe_events_type_idx").on(table.eventType),
    processedAtIdx: index("stripe_events_processed_at_idx").on(
      table.processedAt
    ),
  })
);

export type StripeEvent = typeof stripeEvents.$inferSelect;
export type InsertStripeEvent = typeof stripeEvents.$inferInsert;

// ─── LLM Usage (per-user rate limiting) ──────────────────────────────────────
// Tracks per-user LLM invocations per hour to enforce rate limits.
// Each row represents one LLM call. Rows older than 1 hour are ignored.
export const llmUsage = mysqlTable(
  "llm_usage",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    procedure: varchar("procedure", { length: 64 }).notNull(),
    tokensUsed: int("tokensUsed").default(0),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    userIdx: index("llm_usage_user_idx").on(table.userId),
    createdAtIdx: index("llm_usage_created_at_idx").on(table.createdAt),
    userCreatedIdx: index("llm_usage_user_created_idx").on(
      table.userId,
      table.createdAt
    ),
  })
);

export type LlmUsage = typeof llmUsage.$inferSelect;
export type InsertLlmUsage = typeof llmUsage.$inferInsert;
