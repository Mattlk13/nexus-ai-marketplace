CREATE TABLE `agent_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentName` varchar(64) NOT NULL,
	`action` varchar(128) NOT NULL,
	`result` text,
	`status` enum('success','error','running') DEFAULT 'running',
	`productsImported` int DEFAULT 0,
	`revenueGenerated` decimal(10,2) DEFAULT '0.00',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `agent_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `auctions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sellerId` int NOT NULL,
	`productId` int,
	`title` varchar(255) NOT NULL,
	`description` text,
	`imageUrl` text,
	`startingBid` decimal(10,2) NOT NULL,
	`currentBid` decimal(10,2),
	`reservePrice` decimal(10,2),
	`buyNowPrice` decimal(10,2),
	`bidCount` int DEFAULT 0,
	`winnerId` int,
	`status` enum('active','ended','cancelled','sold') DEFAULT 'active',
	`endsAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auctions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `content_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`contentType` enum('music','video','ebook','art','writing','course','template','other') NOT NULL,
	`fileUrl` text,
	`previewUrl` text,
	`thumbnailUrl` text,
	`price` decimal(10,2) DEFAULT '0.00',
	`isFree` boolean DEFAULT false,
	`isPublished` boolean DEFAULT false,
	`tags` text,
	`genre` varchar(100),
	`likeCount` int DEFAULT 0,
	`viewCount` int DEFAULT 0,
	`downloadCount` int DEFAULT 0,
	`salesCount` int DEFAULT 0,
	`totalRevenue` decimal(12,2) DEFAULT '0.00',
	`isSpotlighted` boolean DEFAULT false,
	`spotlightCategory` varchar(64),
	`copyrightRegistered` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `content_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `feed_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`contentType` enum('text','image','video','music','ebook','product','story') DEFAULT 'text',
	`body` text,
	`mediaUrl` text,
	`linkedContentId` int,
	`linkedProductId` int,
	`likeCount` int DEFAULT 0,
	`commentCount` int DEFAULT 0,
	`shareCount` int DEFAULT 0,
	`viewCount` int DEFAULT 0,
	`isStory` boolean DEFAULT false,
	`storyExpiresAt` timestamp,
	`isTrending` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `feed_posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`buyerId` int NOT NULL,
	`sellerId` int,
	`productId` int,
	`contentItemId` int,
	`auctionId` int,
	`orderType` enum('product','content','auction') NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`platformFee` decimal(10,2) NOT NULL,
	`vendorPayout` decimal(10,2),
	`status` enum('pending','paid','fulfilled','refunded','cancelled') DEFAULT 'pending',
	`stripePaymentId` varchar(256),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vendorId` int,
	`title` varchar(255) NOT NULL,
	`description` text,
	`imageUrl` text,
	`price` decimal(10,2) NOT NULL,
	`comparePrice` decimal(10,2),
	`costPrice` decimal(10,2),
	`category` varchar(100),
	`tags` text,
	`source` enum('dropship','vendor','p2p') DEFAULT 'dropship',
	`supplier` varchar(128),
	`sku` varchar(128),
	`stockCount` int DEFAULT 0,
	`isActive` boolean DEFAULT true,
	`isFeatured` boolean DEFAULT false,
	`salesCount` int DEFAULT 0,
	`viewCount` int DEFAULT 0,
	`rating` decimal(3,2) DEFAULT '0.00',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `seo_pages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(255) NOT NULL,
	`title` varchar(255) NOT NULL,
	`metaDescription` text,
	`content` text,
	`keywords` text,
	`pageType` enum('blog','category','product','landing') DEFAULT 'blog',
	`isPublished` boolean DEFAULT false,
	`viewCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `seo_pages_id` PRIMARY KEY(`id`),
	CONSTRAINT `seo_pages_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `vendor_stores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`storeName` varchar(128) NOT NULL,
	`storeSlug` varchar(128) NOT NULL,
	`description` text,
	`logoUrl` text,
	`bannerUrl` text,
	`category` varchar(64),
	`totalSales` int DEFAULT 0,
	`totalRevenue` decimal(12,2) DEFAULT '0.00',
	`rating` decimal(3,2) DEFAULT '0.00',
	`reviewCount` int DEFAULT 0,
	`isActive` boolean DEFAULT true,
	`commissionRate` decimal(5,2) DEFAULT '15.00',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vendor_stores_id` PRIMARY KEY(`id`),
	CONSTRAINT `vendor_stores_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `vendor_stores_storeSlug_unique` UNIQUE(`storeSlug`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','vendor','admin') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `bio` text;--> statement-breakpoint
ALTER TABLE `users` ADD `avatarUrl` text;--> statement-breakpoint
ALTER TABLE `users` ADD `bannerUrl` text;--> statement-breakpoint
ALTER TABLE `users` ADD `website` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `totalEarnings` decimal(12,2) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE `users` ADD `followerCount` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `users` ADD `followingCount` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `users` ADD `isVerified` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `users` ADD `stripeAccountId` varchar(128);