/**
 * Sanad Academy — Drizzle schema (source of truth for the data model).
 *
 * NOTE (mock-first): The app currently reads/writes through an in-memory store
 * (`lib/mock/store.ts`) that implements the SAME row shapes inferred from these
 * tables. To go live, wire a Postgres driver to `db` and replace the store's
 * functions with Drizzle queries — the types below already match.
 */
import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["student", "teacher", "admin"]);
export const localeEnum = pgEnum("locale", ["en", "ar"]);
export const themeEnum = pgEnum("theme", ["light", "dark", "system"]);
export const codeStatusEnum = pgEnum("code_status", ["available", "used", "revoked"]);
export const enrollmentStatusEnum = pgEnum("enrollment_status", ["saved", "active"]);
export const otpPurposeEnum = pgEnum("otp_purpose", ["signup", "reset", "join"]);
export const deliveryTypeEnum = pgEnum("delivery_type", ["home", "office", "pickup"]);
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
]);
export const levelEnum = pgEnum("level", ["middle", "high", "exam"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull().default("student"),
  isVerified: boolean("is_verified").notNull().default(false),
  approved: boolean("approved").notNull().default(true),
  locale: localeEnum("locale").notNull().default("en"),
  theme: themeEnum("theme").notNull().default("system"),
  avatar: text("avatar"),
  phone: text("phone"),
  age: integer("age"),
  // Profile fields the app stores flat on the user (matches lib/types User).
  wilaya: text("wilaya"),
  baladiya: text("baladiya"),
  bio: text("bio"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const courses = pgTable("courses", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  titleAr: text("title_ar"),
  description: text("description"),
  descriptionAr: text("description_ar"),
  subject: text("subject").notNull(),
  subjectAr: text("subject_ar"),
  level: levelEnum("level").notNull(),
  division: text("division"),
  price: integer("price").notNull().default(0),
  teacherName: text("teacher_name").notNull(),
  teacherEmail: text("teacher_email"),
  zoomUrl: text("zoom_url"),
  thumbnail: text("thumbnail"),
  tags: jsonb("tags").$type<string[]>().default([]),
  isPopular: boolean("is_popular").notNull().default(false),
  isGoldPack: boolean("is_gold_pack").notNull().default(false),
  rating: integer("rating").notNull().default(5), // 0..5 (app uses whole stars)
  durationHours: integer("duration_hours").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const lessons = pgTable("lessons", {
  id: uuid("id").defaultRandom().primaryKey(),
  courseId: uuid("course_id").notNull().references(() => courses.id),
  title: text("title").notNull(),
  titleAr: text("title_ar"),
  videoUrl: text("video_url"),
  durationMin: integer("duration_min").notNull().default(0),
  order: integer("order").notNull().default(0),
  isPreview: boolean("is_preview").notNull().default(false),
});

/**
 * CourseCode — auto-generated per course. One code = one course = one access.
 * single-use: redeeming binds exactly one student and flips status to 'used'.
 */
export const courseCodes = pgTable("course_codes", {
  id: uuid("id").defaultRandom().primaryKey(),
  courseId: uuid("course_id").notNull().references(() => courses.id),
  code: text("code").notNull().unique(),
  label: text("label").notNull(), // e.g. "#35"
  status: codeStatusEnum("status").notNull().default("available"),
  boundUserId: uuid("bound_user_id").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  usedAt: timestamp("used_at"),
});

export const enrollments = pgTable("enrollments", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id),
  courseId: uuid("course_id").notNull().references(() => courses.id),
  courseCodeId: uuid("course_code_id").references(() => courseCodes.id),
  status: enrollmentStatusEnum("status").notNull().default("active"),
  progressPercent: integer("progress_percent").notNull().default(0),
  completedLessonIds: jsonb("completed_lesson_ids").$type<string[]>().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const savedCourses = pgTable("saved_courses", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id),
  courseId: uuid("course_id").notNull().references(() => courses.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const bookOrders = pgTable("book_orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  enrollmentId: uuid("enrollment_id").references(() => enrollments.id),
  userId: uuid("user_id").notNull().references(() => users.id),
  courseId: uuid("course_id").notNull().references(() => courses.id),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  wilaya: text("wilaya").notNull(),
  baladiya: text("baladiya").notNull(),
  deliveryType: deliveryTypeEnum("delivery_type").notNull().default("home"),
  status: orderStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const questions = pgTable("questions", {
  id: uuid("id").defaultRandom().primaryKey(),
  courseId: uuid("course_id").notNull().references(() => courses.id),
  userId: uuid("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  resolved: boolean("resolved").notNull().default(false),
});

export const replies = pgTable("replies", {
  id: uuid("id").defaultRandom().primaryKey(),
  questionId: uuid("question_id").notNull().references(() => questions.id),
  userId: uuid("user_id").notNull().references(() => users.id),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id),
  titleKey: text("title_key").notNull(),
  bodyKey: text("body_key").notNull(),
  meta: jsonb("meta").$type<Record<string, string>>().default({}),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  authorName: text("author_name").notNull(),
  authorRole: text("author_role"),
  rating: integer("rating").notNull().default(5),
  body: text("body").notNull(),
  bodyAr: text("body_ar"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const otps = pgTable("otps", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  email: text("email").notNull(),
  code: text("code").notNull(),
  purpose: otpPurposeEnum("purpose").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").notNull().default(false),
});

/* ----------------------------- Relations ----------------------------- */

export const coursesRelations = relations(courses, ({ many }) => ({
  lessons: many(lessons),
  codes: many(courseCodes),
  enrollments: many(enrollments),
  questions: many(questions),
}));

export const courseCodesRelations = relations(courseCodes, ({ one }) => ({
  course: one(courses, { fields: [courseCodes.courseId], references: [courses.id] }),
  boundUser: one(users, { fields: [courseCodes.boundUserId], references: [users.id] }),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  course: one(courses, { fields: [enrollments.courseId], references: [courses.id] }),
  user: one(users, { fields: [enrollments.userId], references: [users.id] }),
  code: one(courseCodes, { fields: [enrollments.courseCodeId], references: [courseCodes.id] }),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  course: one(courses, { fields: [questions.courseId], references: [courses.id] }),
  author: one(users, { fields: [questions.userId], references: [users.id] }),
  replies: many(replies),
}));
