ALTER TABLE `auctions` DROP FOREIGN KEY `auctions_sellerId_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `content_items` DROP FOREIGN KEY `content_items_userId_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `feed_posts` DROP FOREIGN KEY `feed_posts_userId_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `orders` DROP FOREIGN KEY `orders_buyerId_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `stripe_accounts` DROP FOREIGN KEY `stripe_accounts_userId_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `uploaded_files` DROP FOREIGN KEY `uploaded_files_userId_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `vendor_stores` DROP FOREIGN KEY `vendor_stores_userId_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `auctions` ADD CONSTRAINT `auctions_sellerId_users_id_fk` FOREIGN KEY (`sellerId`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `content_items` ADD CONSTRAINT `content_items_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `feed_posts` ADD CONSTRAINT `feed_posts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_buyerId_users_id_fk` FOREIGN KEY (`buyerId`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `stripe_accounts` ADD CONSTRAINT `stripe_accounts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `uploaded_files` ADD CONSTRAINT `uploaded_files_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vendor_stores` ADD CONSTRAINT `vendor_stores_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;