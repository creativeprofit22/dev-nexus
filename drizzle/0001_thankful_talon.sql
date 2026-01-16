ALTER TABLE `components` ADD `isFavorite` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `components` ADD `usageCount` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `components` ADD `lastUsed` text;--> statement-breakpoint
ALTER TABLE `notes` ADD `isPinned` integer DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX `idx_notes_isPinned` ON `notes` (`isPinned`);