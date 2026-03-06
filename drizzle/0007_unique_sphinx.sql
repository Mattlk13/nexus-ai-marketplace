CREATE TABLE `llm_usage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`procedure` varchar(64) NOT NULL,
	`tokensUsed` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `llm_usage_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stripe_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` varchar(128) NOT NULL,
	`eventType` varchar(128) NOT NULL,
	`processedAt` timestamp NOT NULL DEFAULT (now()),
	`status` enum('processed','failed','skipped') NOT NULL DEFAULT 'processed',
	`errorMessage` text,
	CONSTRAINT `stripe_events_id` PRIMARY KEY(`id`),
	CONSTRAINT `stripe_events_eventId_unique` UNIQUE(`eventId`)
);
--> statement-breakpoint
ALTER TABLE `llm_usage` ADD CONSTRAINT `llm_usage_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `llm_usage_user_idx` ON `llm_usage` (`userId`);--> statement-breakpoint
CREATE INDEX `llm_usage_created_at_idx` ON `llm_usage` (`createdAt`);--> statement-breakpoint
CREATE INDEX `llm_usage_user_created_idx` ON `llm_usage` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `stripe_events_event_id_idx` ON `stripe_events` (`eventId`);--> statement-breakpoint
CREATE INDEX `stripe_events_type_idx` ON `stripe_events` (`eventType`);--> statement-breakpoint
CREATE INDEX `stripe_events_processed_at_idx` ON `stripe_events` (`processedAt`);