CREATE TABLE `inquiries` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`type` text NOT NULL,
	`interest` text NOT NULL,
	`preferred_date` text,
	`message` text NOT NULL,
	`consent` integer NOT NULL,
	`created_at` text NOT NULL
);
