import {
  bigint, boolean, decimal, int, mysqlEnum, mysqlTable,
  text, timestamp, varchar
} from "drizzle-orm/mysql-core";

// ─── Users ───────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "vendor", "admin"]).default("user").notNull(),
  bio: text("bio"),
  avatarUrl: text("avatarUrl"),
  bannerUrl: text("bannerUrl"),
  website: varchar("website", { length: 255 }),
  totalEarnings: decimal("totalEarnings", { precision: 12, scale: 2 }).default("0.00"),
  followerCount: int("followerCount").default(0),
  followingCount: int("followingCount").default(0),
  isVerified: boolean("isVerified").default(false),
  stripeAccountId: varchar("stripeAccountId", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Content Items (music, video, ebook, art, writing) ───────────────────────
export const contentItems = mysqlTable("content_items", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  contentType: mysqlEnum("contentType", ["music", "video", "ebook", "art", "writing", "course", "template", "other"]).notNull(),
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
  totalRevenue: decimal("totalRevenue", { precision: 12, scale: 2 }).default("0.00"),
  isSpotlighted: boolean("isSpotlighted").default(false),
  spotlightCategory: varchar("spotlightCategory", { length: 64 }),
  copyrightRegistered: boolean("copyrightRegistered").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ContentItem = typeof contentItems.$inferSelect;
export type InsertContentItem = typeof contentItems.$inferInsert;

// ─── Vendor Stores ────────────────────────────────────────────────────────────
export const vendorStores = mysqlTable("vendor_stores", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  storeName: varchar("storeName", { length: 128 }).notNull(),
  storeSlug: varchar("storeSlug", { length: 128 }).notNull().unique(),
  description: text("description"),
  logoUrl: text("logoUrl"),
  bannerUrl: text("bannerUrl"),
  category: varchar("category", { length: 64 }),
  totalSales: int("totalSales").default(0),
  totalRevenue: decimal("totalRevenue", { precision: 12, scale: 2 }).default("0.00"),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  reviewCount: int("reviewCount").default(0),
  isActive: boolean("isActive").default(true),
  commissionRate: decimal("commissionRate", { precision: 5, scale: 2 }).default("15.00"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type VendorStore = typeof vendorStores.$inferSelect;
export type InsertVendorStore = typeof vendorStores.$inferInsert;

// ─── Marketplace Products (dropship + vendor) ─────────────────────────────────
export const products = mysqlTable("products", {
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
  source: mysqlEnum("source", ["dropship", "vendor", "p2p"]).default("dropship"),
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
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// ─── Auctions ─────────────────────────────────────────────────────────────────
export const auctions = mysqlTable("auctions", {
  id: int("id").autoincrement().primaryKey(),
  sellerId: int("sellerId").notNull(),
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
  status: mysqlEnum("status", ["active", "ended", "cancelled", "sold"]).default("active"),
  endsAt: timestamp("endsAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Auction = typeof auctions.$inferSelect;
export type InsertAuction = typeof auctions.$inferInsert;

// ─── Social Feed Posts ────────────────────────────────────────────────────────
export const feedPosts = mysqlTable("feed_posts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  contentType: mysqlEnum("contentType", ["text", "image", "video", "music", "ebook", "product", "story"]).default("text"),
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
});

export type FeedPost = typeof feedPosts.$inferSelect;
export type InsertFeedPost = typeof feedPosts.$inferInsert;

// ─── Orders ───────────────────────────────────────────────────────────────────
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  buyerId: int("buyerId").notNull(),
  sellerId: int("sellerId"),
  productId: int("productId"),
  contentItemId: int("contentItemId"),
  auctionId: int("auctionId"),
  orderType: mysqlEnum("orderType", ["product", "content", "auction"]).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  platformFee: decimal("platformFee", { precision: 10, scale: 2 }).notNull(),
  vendorPayout: decimal("vendorPayout", { precision: 10, scale: 2 }),
  status: mysqlEnum("status", ["pending", "paid", "fulfilled", "refunded", "cancelled"]).default("pending"),
  stripePaymentId: varchar("stripePaymentId", { length: 256 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

// ─── AI Agent Logs ────────────────────────────────────────────────────────────
export const agentLogs = mysqlTable("agent_logs", {
  id: int("id").autoincrement().primaryKey(),
  agentName: varchar("agentName", { length: 64 }).notNull(),
  action: varchar("action", { length: 128 }).notNull(),
  result: text("result"),
  status: mysqlEnum("status", ["success", "error", "running"]).default("running"),
  productsImported: int("productsImported").default(0),
  revenueGenerated: decimal("revenueGenerated", { precision: 10, scale: 2 }).default("0.00"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AgentLog = typeof agentLogs.$inferSelect;

// ─── SEO Pages ────────────────────────────────────────────────────────────────
export const seoPages = mysqlTable("seo_pages", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  metaDescription: text("metaDescription"),
  content: text("content"),
  keywords: text("keywords"),
  pageType: mysqlEnum("pageType", ["blog", "category", "product", "landing"]).default("blog"),
  isPublished: boolean("isPublished").default(false),
  viewCount: int("viewCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SeoPage = typeof seoPages.$inferSelect;

// ─── Stripe Connect Accounts ─────────────────────────────────────────────────
export const stripeAccounts = mysqlTable("stripe_accounts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  stripeAccountId: varchar("stripeAccountId", { length: 128 }).notNull().unique(),
  accountStatus: mysqlEnum("accountStatus", ["pending", "active", "restricted", "disabled"]).default("pending"),
  chargesEnabled: boolean("chargesEnabled").default(false),
  payoutsEnabled: boolean("payoutsEnabled").default(false),
  detailsSubmitted: boolean("detailsSubmitted").default(false),
  country: varchar("country", { length: 2 }).default("US"),
  currency: varchar("currency", { length: 3 }).default("usd"),
  totalEarned: decimal("totalEarned", { precision: 12, scale: 2 }).default("0.00"),
  totalPaidOut: decimal("totalPaidOut", { precision: 12, scale: 2 }).default("0.00"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StripeAccount = typeof stripeAccounts.$inferSelect;
export type InsertStripeAccount = typeof stripeAccounts.$inferInsert;

// ─── Stripe Products (for content and marketplace items) ──────────────────────
export const stripeProducts = mysqlTable("stripe_products", {
  id: int("id").autoincrement().primaryKey(),
  contentItemId: int("contentItemId"),
  productId: int("productId"),
  stripeProductId: varchar("stripeProductId", { length: 128 }).notNull(),
  stripePriceId: varchar("stripePriceId", { length: 128 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("usd"),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StripeProduct = typeof stripeProducts.$inferSelect;
export type InsertStripeProduct = typeof stripeProducts.$inferInsert;
