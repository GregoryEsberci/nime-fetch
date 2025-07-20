CREATE TABLE `anime_episodes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`pageUrl` text NOT NULL,
	`title` text NOT NULL,
	`order` integer NOT NULL,
	`fileName` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`animeId` integer NOT NULL,
	`downloadedFileId` integer,
	`createdAt` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`animeId`) REFERENCES `animes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`downloadedFileId`) REFERENCES `download_files`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `animes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`pageUrl` text NOT NULL,
	`folderName` text NOT NULL,
	`createdAt` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `download_files` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`path` text NOT NULL,
	`downloadUrl` text NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`createdAt` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
