CREATE TABLE `anime_episodes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`pageUrl` text,
	`title` text NOT NULL,
	`order` integer NOT NULL,
	`animeId` integer NOT NULL,
	`downloadedFileId` integer NOT NULL,
	`createdAt` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`animeId`) REFERENCES `animes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`downloadedFileId`) REFERENCES `download_files`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `animes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`pageUrl` text,
	`createdAt` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `download_files` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`status` text NOT NULL,
	`path` text NOT NULL,
	`downloadUrl` text NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`createdAt` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
