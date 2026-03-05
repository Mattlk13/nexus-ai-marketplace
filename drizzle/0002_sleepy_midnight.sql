CREATE TABLE `stripe_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stripeAccountId` varchar(128) NOT NULL,
	`accountStatus` enum('pending','active','restricted','disabled') DEFAULT 'pending',
	`chargesEnabled` boolean DEFAULT false,
	`payoutsEnabled` boolean DEFAULT false,
	`detailsSubmitted` boolean DEFAULT false,
	`country` varchar(2) DEFAULT 'US',
	`currency` varchar(3) DEFAULT 'usd',
	`totalEarned` decimal(12,2) DEFAULT '0.00',
	`totalPaidOut` decimal(12,2) DEFAULT '0.00',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stripe_accounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `stripe_accounts_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `stripe_accounts_stripeAccountId_unique` UNIQUE(`stripeAccountId`)
);
--> statement-breakpoint
CREATE TABLE `stripe_products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contentItemId` int,
	`productId` int,
	`stripeProductId` varchar(128) NOT NULL,
	`stripePriceId` varchar(128) NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`currency` varchar(3) DEFAULT 'usd',
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `stripe_products_id` PRIMARY KEY(`id`)
);
