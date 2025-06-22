CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`name_en` text,
	`name_fr` text,
	`name_ar` text,
	`description` text,
	`image` text,
	`parent_id` integer,
	`status` text DEFAULT 'active' NOT NULL,
	`sort_order` integer DEFAULT 0,
	`created_at` text DEFAULT (datetime('now')),
	`updated_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`parent_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_id` integer,
	`product_id` integer,
	`product_name` text NOT NULL,
	`product_sku` text,
	`quantity` integer NOT NULL,
	`unit_price` real NOT NULL,
	`discount_rate` real DEFAULT 0,
	`discount_amount` real DEFAULT 0,
	`tax_rate` real DEFAULT 0,
	`tax_amount` real DEFAULT 0,
	`total_price` real NOT NULL,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_number` text NOT NULL,
	`customer_id` integer,
	`staff_id` integer,
	`subtotal` real DEFAULT 0 NOT NULL,
	`tax_amount` real DEFAULT 0,
	`discount_amount` real DEFAULT 0,
	`total_amount` real NOT NULL,
	`payment_method` text DEFAULT 'cash' NOT NULL,
	`payment_status` text DEFAULT 'pending' NOT NULL,
	`paid_amount` real DEFAULT 0,
	`change_amount` real DEFAULT 0,
	`status` text DEFAULT 'pending' NOT NULL,
	`order_type` text DEFAULT 'sale' NOT NULL,
	`customer_name` text,
	`customer_phone` text,
	`customer_email` text,
	`order_date` text DEFAULT (date('now')),
	`created_at` text DEFAULT (datetime('now')),
	`updated_at` text DEFAULT (datetime('now')),
	`notes` text,
	`receipt_printed` integer DEFAULT false,
	FOREIGN KEY (`customer_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`staff_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_order_number_unique` ON `orders` (`order_number`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`name_en` text,
	`name_fr` text,
	`name_ar` text,
	`description` text,
	`sku` text,
	`barcode` text,
	`category_id` integer,
	`unit_id` integer,
	`supplier_id` integer,
	`purchase_price` real DEFAULT 0,
	`selling_price` real NOT NULL,
	`min_price` real DEFAULT 0,
	`current_stock` integer DEFAULT 0,
	`min_stock` integer DEFAULT 0,
	`weight` real DEFAULT 0,
	`color` text,
	`size` text,
	`image` text,
	`tax_rate` real DEFAULT 0,
	`discount_rate` real DEFAULT 0,
	`is_active` integer DEFAULT true,
	`is_featured` integer DEFAULT false,
	`track_stock` integer DEFAULT true,
	`created_at` text DEFAULT (datetime('now')),
	`updated_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`unit_id`) REFERENCES `units`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`supplier_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_sku_unique` ON `products` (`sku`);--> statement-breakpoint
CREATE UNIQUE INDEX `products_barcode_unique` ON `products` (`barcode`);--> statement-breakpoint
CREATE TABLE `units` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`name_en` text,
	`name_fr` text,
	`name_ar` text,
	`symbol` text NOT NULL,
	`type` text DEFAULT 'piece' NOT NULL,
	`conversion_rate` real DEFAULT 1,
	`base_unit` integer,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text DEFAULT (datetime('now')),
	`updated_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`base_unit`) REFERENCES `units`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password` text,
	`phone` text,
	`address` text,
	`role` text DEFAULT 'client' NOT NULL,
	`avatar` text,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text DEFAULT (datetime('now')),
	`updated_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);