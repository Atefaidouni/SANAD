CREATE TABLE `book_orders` (
	`id` varchar(36) NOT NULL,
	`enrollment_id` varchar(36),
	`user_id` varchar(36) NOT NULL,
	`course_id` varchar(36) NOT NULL,
	`full_name` text NOT NULL,
	`phone` text NOT NULL,
	`wilaya` text NOT NULL,
	`baladiya` text NOT NULL,
	`delivery_type` enum('home','office','pickup') NOT NULL DEFAULT 'home',
	`status` enum('pending','confirmed','shipped','delivered') NOT NULL DEFAULT 'pending',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `book_orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `course_codes` (
	`id` varchar(36) NOT NULL,
	`course_id` varchar(36) NOT NULL,
	`code` varchar(64) NOT NULL,
	`label` text NOT NULL,
	`status` enum('available','used','revoked') NOT NULL DEFAULT 'available',
	`bound_user_id` varchar(36),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`used_at` timestamp,
	CONSTRAINT `course_codes_id` PRIMARY KEY(`id`),
	CONSTRAINT `course_codes_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `courses` (
	`id` varchar(36) NOT NULL,
	`title` text NOT NULL,
	`title_ar` text,
	`description` text,
	`description_ar` text,
	`subject` text NOT NULL,
	`subject_ar` text,
	`level` enum('middle','high','exam') NOT NULL,
	`division` text,
	`price` int NOT NULL DEFAULT 0,
	`teacher_name` text NOT NULL,
	`teacher_email` text,
	`zoom_url` text,
	`thumbnail` text,
	`tags` json DEFAULT ('[]'),
	`is_popular` boolean NOT NULL DEFAULT false,
	`is_gold_pack` boolean NOT NULL DEFAULT false,
	`rating` int NOT NULL DEFAULT 5,
	`duration_hours` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `courses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `enrollments` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`course_id` varchar(36) NOT NULL,
	`course_code_id` varchar(36),
	`status` enum('saved','active') NOT NULL DEFAULT 'active',
	`progress_percent` int NOT NULL DEFAULT 0,
	`completed_lesson_ids` json DEFAULT ('[]'),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `enrollments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lessons` (
	`id` varchar(36) NOT NULL,
	`course_id` varchar(36) NOT NULL,
	`title` text NOT NULL,
	`title_ar` text,
	`video_url` text,
	`duration_min` int NOT NULL DEFAULT 0,
	`order` int NOT NULL DEFAULT 0,
	`is_preview` boolean NOT NULL DEFAULT false,
	CONSTRAINT `lessons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`title_key` text NOT NULL,
	`body_key` text NOT NULL,
	`meta` json DEFAULT ('{}'),
	`read` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `otps` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36),
	`email` varchar(255) NOT NULL,
	`code` varchar(512) NOT NULL,
	`purpose` enum('signup','reset','join') NOT NULL,
	`expires_at` timestamp NOT NULL,
	`used` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `otps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `questions` (
	`id` varchar(36) NOT NULL,
	`course_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`resolved` boolean NOT NULL DEFAULT false,
	CONSTRAINT `questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quiz_answers` (
	`id` varchar(36) NOT NULL,
	`attempt_id` varchar(36) NOT NULL,
	`question_id` varchar(36) NOT NULL,
	`selected_choice_ids` json DEFAULT ('[]'),
	`is_correct` boolean NOT NULL DEFAULT false,
	`points_earned` int NOT NULL DEFAULT 0,
	CONSTRAINT `quiz_answers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quiz_attempts` (
	`id` varchar(36) NOT NULL,
	`quiz_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`attempt_number` int NOT NULL DEFAULT 1,
	`started_at` timestamp NOT NULL DEFAULT (now()),
	`submitted_at` timestamp,
	`score` int,
	`max_score` int NOT NULL DEFAULT 0,
	`percentage` int,
	`passed` boolean,
	`time_spent_sec` int,
	CONSTRAINT `quiz_attempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quiz_choices` (
	`id` varchar(36) NOT NULL,
	`question_id` varchar(36) NOT NULL,
	`text` text NOT NULL,
	`text_ar` text,
	`is_correct` boolean NOT NULL DEFAULT false,
	`order` int NOT NULL DEFAULT 0,
	CONSTRAINT `quiz_choices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quiz_questions` (
	`id` varchar(36) NOT NULL,
	`quiz_id` varchar(36) NOT NULL,
	`type` enum('single','multiple','true_false') NOT NULL DEFAULT 'single',
	`text` text NOT NULL,
	`text_ar` text,
	`image_id` varchar(36),
	`points` int NOT NULL DEFAULT 1,
	`order` int NOT NULL DEFAULT 0,
	`explanation` text,
	`explanation_ar` text,
	CONSTRAINT `quiz_questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quizzes` (
	`id` varchar(36) NOT NULL,
	`course_id` varchar(36) NOT NULL,
	`title` text NOT NULL,
	`title_ar` text,
	`description` text,
	`description_ar` text,
	`time_limit_min` int,
	`passing_score` int NOT NULL DEFAULT 60,
	`max_attempts` int,
	`available_from` timestamp,
	`available_until` timestamp,
	`shuffle_questions` boolean NOT NULL DEFAULT false,
	`shuffle_answers` boolean NOT NULL DEFAULT false,
	`show_answers_after_submit` boolean NOT NULL DEFAULT true,
	`show_explanations_after_submit` boolean NOT NULL DEFAULT true,
	`status` enum('draft','published') NOT NULL DEFAULT 'draft',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quizzes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `replies` (
	`id` varchar(36) NOT NULL,
	`question_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`body` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `replies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36),
	`author_name` text NOT NULL,
	`author_role` text,
	`rating` int NOT NULL DEFAULT 5,
	`body` text NOT NULL,
	`body_ar` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `saved_courses` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`course_id` varchar(36) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `saved_courses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `uploads` (
	`id` varchar(36) NOT NULL,
	`mime` text NOT NULL,
	`data` longblob NOT NULL,
	`size` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `uploads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(36) NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`email` varchar(255) NOT NULL,
	`password_hash` text NOT NULL,
	`role` enum('student','teacher','admin') NOT NULL DEFAULT 'student',
	`is_verified` boolean NOT NULL DEFAULT false,
	`approved` boolean NOT NULL DEFAULT true,
	`locale` enum('en','ar') NOT NULL DEFAULT 'en',
	`theme` enum('light','dark','system') NOT NULL DEFAULT 'system',
	`avatar` text,
	`phone` text,
	`age` int,
	`wilaya` text,
	`baladiya` text,
	`bio` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `book_orders` ADD CONSTRAINT `book_orders_enrollment_id_enrollments_id_fk` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `book_orders` ADD CONSTRAINT `book_orders_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `book_orders` ADD CONSTRAINT `book_orders_course_id_courses_id_fk` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `course_codes` ADD CONSTRAINT `course_codes_course_id_courses_id_fk` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `course_codes` ADD CONSTRAINT `course_codes_bound_user_id_users_id_fk` FOREIGN KEY (`bound_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `enrollments` ADD CONSTRAINT `enrollments_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `enrollments` ADD CONSTRAINT `enrollments_course_id_courses_id_fk` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `enrollments` ADD CONSTRAINT `enrollments_course_code_id_course_codes_id_fk` FOREIGN KEY (`course_code_id`) REFERENCES `course_codes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `lessons` ADD CONSTRAINT `lessons_course_id_courses_id_fk` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `otps` ADD CONSTRAINT `otps_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `questions` ADD CONSTRAINT `questions_course_id_courses_id_fk` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `questions` ADD CONSTRAINT `questions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `quiz_answers` ADD CONSTRAINT `quiz_answers_attempt_id_quiz_attempts_id_fk` FOREIGN KEY (`attempt_id`) REFERENCES `quiz_attempts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `quiz_answers` ADD CONSTRAINT `quiz_answers_question_id_quiz_questions_id_fk` FOREIGN KEY (`question_id`) REFERENCES `quiz_questions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `quiz_attempts` ADD CONSTRAINT `quiz_attempts_quiz_id_quizzes_id_fk` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `quiz_attempts` ADD CONSTRAINT `quiz_attempts_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `quiz_choices` ADD CONSTRAINT `quiz_choices_question_id_quiz_questions_id_fk` FOREIGN KEY (`question_id`) REFERENCES `quiz_questions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `quiz_questions` ADD CONSTRAINT `quiz_questions_quiz_id_quizzes_id_fk` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `quiz_questions` ADD CONSTRAINT `quiz_questions_image_id_uploads_id_fk` FOREIGN KEY (`image_id`) REFERENCES `uploads`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `quizzes` ADD CONSTRAINT `quizzes_course_id_courses_id_fk` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `replies` ADD CONSTRAINT `replies_question_id_questions_id_fk` FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `replies` ADD CONSTRAINT `replies_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `saved_courses` ADD CONSTRAINT `saved_courses_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `saved_courses` ADD CONSTRAINT `saved_courses_course_id_courses_id_fk` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `enrollments_user_course_idx` ON `enrollments` (`user_id`,`course_id`);--> statement-breakpoint
CREATE INDEX `otps_email_purpose_idx` ON `otps` (`email`,`purpose`);--> statement-breakpoint
CREATE INDEX `otps_code_idx` ON `otps` (`code`);--> statement-breakpoint
CREATE INDEX `questions_course_idx` ON `questions` (`course_id`);--> statement-breakpoint
CREATE INDEX `quiz_attempts_quiz_user_idx` ON `quiz_attempts` (`quiz_id`,`user_id`);