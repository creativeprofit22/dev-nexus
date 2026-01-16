CREATE TABLE `project_structure` (
	`id` text PRIMARY KEY NOT NULL,
	`projectId` text NOT NULL,
	`fileTree` text NOT NULL,
	`dependencies` text NOT NULL,
	`components` text NOT NULL,
	`lastScanned` text NOT NULL,
	FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `project_structure_projectId_unique` ON `project_structure` (`projectId`);--> statement-breakpoint
CREATE INDEX `idx_project_structure_projectId` ON `project_structure` (`projectId`);--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`pathWSL` text NOT NULL,
	`pathWindows` text NOT NULL,
	`techStack` text DEFAULT '[]' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`claudeMd` text,
	`lastAccessed` text NOT NULL,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `projects_pathWSL_unique` ON `projects` (`pathWSL`);--> statement-breakpoint
CREATE UNIQUE INDEX `projects_pathWindows_unique` ON `projects` (`pathWindows`);--> statement-breakpoint
CREATE INDEX `idx_projects_status` ON `projects` (`status`);--> statement-breakpoint
CREATE INDEX `idx_projects_lastAccessed` ON `projects` (`lastAccessed`);--> statement-breakpoint
CREATE TABLE `prompts` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`category` text NOT NULL,
	`tags` text DEFAULT '[]' NOT NULL,
	`variables` text DEFAULT '[]' NOT NULL,
	`projectId` text,
	`usageCount` integer DEFAULT 0 NOT NULL,
	`lastUsed` text,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL,
	FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_prompts_category` ON `prompts` (`category`);--> statement-breakpoint
CREATE INDEX `idx_prompts_projectId` ON `prompts` (`projectId`);--> statement-breakpoint
CREATE INDEX `idx_prompts_usageCount` ON `prompts` (`usageCount`);--> statement-breakpoint
CREATE TABLE `components` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`code` text NOT NULL,
	`props` text DEFAULT '[]' NOT NULL,
	`variants` text DEFAULT '[]' NOT NULL,
	`category` text NOT NULL,
	`tags` text DEFAULT '[]' NOT NULL,
	`preview` text,
	`projectId` text,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL,
	FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_components_category` ON `components` (`category`);--> statement-breakpoint
CREATE INDEX `idx_components_projectId` ON `components` (`projectId`);--> statement-breakpoint
CREATE TABLE `flows` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`nodes` text DEFAULT '[]' NOT NULL,
	`edges` text DEFAULT '[]' NOT NULL,
	`viewport` text NOT NULL,
	`thumbnail` text,
	`projectId` text,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL,
	FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_flows_projectId` ON `flows` (`projectId`);--> statement-breakpoint
CREATE TABLE `notes` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`tags` text DEFAULT '[]' NOT NULL,
	`projectId` text,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL,
	FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_notes_projectId` ON `notes` (`projectId`);--> statement-breakpoint
CREATE INDEX `idx_notes_updatedAt` ON `notes` (`updatedAt`);--> statement-breakpoint
CREATE TABLE `flow_components` (
	`id` text PRIMARY KEY NOT NULL,
	`flowId` text NOT NULL,
	`componentId` text NOT NULL,
	`nodeId` text NOT NULL,
	`createdAt` text NOT NULL,
	FOREIGN KEY (`flowId`) REFERENCES `flows`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`componentId`) REFERENCES `components`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_flow_components_flowId` ON `flow_components` (`flowId`);--> statement-breakpoint
CREATE INDEX `idx_flow_components_componentId` ON `flow_components` (`componentId`);--> statement-breakpoint
CREATE TABLE `project_prompts` (
	`id` text PRIMARY KEY NOT NULL,
	`projectId` text NOT NULL,
	`promptId` text NOT NULL,
	`createdAt` text NOT NULL,
	FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`promptId`) REFERENCES `prompts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_project_prompts_projectId` ON `project_prompts` (`projectId`);--> statement-breakpoint
CREATE INDEX `idx_project_prompts_promptId` ON `project_prompts` (`promptId`);