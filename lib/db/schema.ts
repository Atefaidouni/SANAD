/**
 * Sanad Academy — Drizzle schema (source of truth for the data model).
 *
 * The client-side store (`lib/mock/store.ts`) mirrors these row shapes for its
 * cache, but reads/writes for real go through Drizzle queries in
 * `lib/server/dal.ts` against this schema (Neon in production, PGlite locally).
 */
import { relations } from "drizzle-orm";
import {
  boolean,
  customType,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

/** Raw bytes column — used to store uploaded image data directly in
 *  Postgres so it works identically on Neon, cPanel Postgres, and local
 *  PGlite, with no extra storage service. */
const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType() {
    return "bytea";
  },
});

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
export const quizStatusEnum = pgEnum("quiz_status", ["draft", "published"]);
export const quizQuestionTypeEnum = pgEnum("quiz_question_type", [
  "single",
  "multiple",
  "true_false",
]);

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
}, (table) => [
  // Every enrollment lookup filters by this pair (join-course, complete-lesson,
  // save-course, start-quiz, ...) — without it, each is a full table scan.
  index("enrollments_user_course_idx").on(table.userId, table.courseId),
]);

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
}, (table) => [
  index("questions_course_idx").on(table.courseId),
]);

export const replies = pgTable("replies", {
  id: uuid("id").defaultRandom().primaryKey(),
  questionId: uuid("question_id").notNull().references(() => questions.id),
  userId: uuid("user_id").notNull().references(() => users.id),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/** Generic uploaded-file store (bytes live in Postgres — no external storage
 *  service). Currently only used for quiz question images. */
export const uploads = pgTable("uploads", {
  id: uuid("id").defaultRandom().primaryKey(),
  mime: text("mime").notNull(),
  data: bytea("data").notNull(),
  size: integer("size").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const quizzes = pgTable("quizzes", {
  id: uuid("id").defaultRandom().primaryKey(),
  courseId: uuid("course_id").notNull().references(() => courses.id),
  title: text("title").notNull(),
  titleAr: text("title_ar"),
  description: text("description"),
  descriptionAr: text("description_ar"),
  timeLimitMin: integer("time_limit_min"), // null = untimed
  passingScore: integer("passing_score").notNull().default(60), // percent
  maxAttempts: integer("max_attempts"), // null = unlimited
  availableFrom: timestamp("available_from"),
  availableUntil: timestamp("available_until"),
  shuffleQuestions: boolean("shuffle_questions").notNull().default(false),
  shuffleAnswers: boolean("shuffle_answers").notNull().default(false),
  showAnswersAfterSubmit: boolean("show_answers_after_submit").notNull().default(true),
  showExplanationsAfterSubmit: boolean("show_explanations_after_submit").notNull().default(true),
  status: quizStatusEnum("status").notNull().default("draft"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const quizQuestions = pgTable("quiz_questions", {
  id: uuid("id").defaultRandom().primaryKey(),
  quizId: uuid("quiz_id").notNull().references(() => quizzes.id),
  type: quizQuestionTypeEnum("type").notNull().default("single"),
  text: text("text").notNull(),
  textAr: text("text_ar"),
  imageId: uuid("image_id").references(() => uploads.id),
  points: integer("points").notNull().default(1),
  order: integer("order").notNull().default(0),
  explanation: text("explanation"),
  explanationAr: text("explanation_ar"),
});

export const quizChoices = pgTable("quiz_choices", {
  id: uuid("id").defaultRandom().primaryKey(),
  questionId: uuid("question_id").notNull().references(() => quizQuestions.id),
  text: text("text").notNull(),
  textAr: text("text_ar"),
  isCorrect: boolean("is_correct").notNull().default(false),
  order: integer("order").notNull().default(0),
});

export const quizAttempts = pgTable("quiz_attempts", {
  id: uuid("id").defaultRandom().primaryKey(),
  quizId: uuid("quiz_id").notNull().references(() => quizzes.id),
  userId: uuid("user_id").notNull().references(() => users.id),
  attemptNumber: integer("attempt_number").notNull().default(1),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  submittedAt: timestamp("submitted_at"), // null = in progress
  score: integer("score"),
  maxScore: integer("max_score").notNull().default(0),
  percentage: integer("percentage"),
  passed: boolean("passed"),
  timeSpentSec: integer("time_spent_sec"),
}, (table) => [
  index("quiz_attempts_quiz_user_idx").on(table.quizId, table.userId),
]);

export const quizAnswers = pgTable("quiz_answers", {
  id: uuid("id").defaultRandom().primaryKey(),
  attemptId: uuid("attempt_id").notNull().references(() => quizAttempts.id),
  questionId: uuid("question_id").notNull().references(() => quizQuestions.id),
  selectedChoiceIds: jsonb("selected_choice_ids").$type<string[]>().default([]),
  isCorrect: boolean("is_correct").notNull().default(false),
  pointsEarned: integer("points_earned").notNull().default(0),
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
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("otps_email_purpose_idx").on(table.email, table.purpose),
  // Token redemption looks up by code alone.
  index("otps_code_idx").on(table.code),
]);

/* ----------------------------- Relations ----------------------------- */

export const coursesRelations = relations(courses, ({ many }) => ({
  lessons: many(lessons),
  codes: many(courseCodes),
  enrollments: many(enrollments),
  questions: many(questions),
  quizzes: many(quizzes),
}));

export const quizzesRelations = relations(quizzes, ({ one, many }) => ({
  course: one(courses, { fields: [quizzes.courseId], references: [courses.id] }),
  questions: many(quizQuestions),
  attempts: many(quizAttempts),
}));

export const quizQuestionsRelations = relations(quizQuestions, ({ one, many }) => ({
  quiz: one(quizzes, { fields: [quizQuestions.quizId], references: [quizzes.id] }),
  image: one(uploads, { fields: [quizQuestions.imageId], references: [uploads.id] }),
  choices: many(quizChoices),
}));

export const quizChoicesRelations = relations(quizChoices, ({ one }) => ({
  question: one(quizQuestions, { fields: [quizChoices.questionId], references: [quizQuestions.id] }),
}));

export const quizAttemptsRelations = relations(quizAttempts, ({ one, many }) => ({
  quiz: one(quizzes, { fields: [quizAttempts.quizId], references: [quizzes.id] }),
  user: one(users, { fields: [quizAttempts.userId], references: [users.id] }),
  answers: many(quizAnswers),
}));

export const quizAnswersRelations = relations(quizAnswers, ({ one }) => ({
  attempt: one(quizAttempts, { fields: [quizAnswers.attemptId], references: [quizAttempts.id] }),
  question: one(quizQuestions, { fields: [quizAnswers.questionId], references: [quizQuestions.id] }),
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
