/**
 * Sanad Academy — Drizzle schema (source of truth for the data model).
 *
 * The client-side store (`lib/mock/store.ts`) mirrors these row shapes for its
 * cache, but reads/writes for real go through Drizzle queries in
 * `lib/server/dal.ts` against this schema (MySQL, via `drizzle-orm/mysql2`).
 *
 * MySQL has no native UUID column type, so ids are `varchar(36)` generated in
 * application code (`crypto.randomUUID()`) at insert time rather than a
 * database-side default — see `newId()` in `lib/server/dal.ts`.
 */
import { relations } from "drizzle-orm";
import {
  boolean,
  customType,
  index,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

/** UUID string primary/foreign key — see file header. */
const id36 = () => varchar("id", { length: 36 });
const fk36 = (name: string) => varchar(name, { length: 36 });

/** Raw bytes column — used to store uploaded image data directly in the
 *  database so it works with no extra storage service. LONGBLOB comfortably
 *  covers the 3MB upload limit enforced in app/api/uploads/route.ts. */
const blob = customType<{ data: Buffer; driverData: Buffer }>({
  dataType() {
    return "longblob";
  },
});

export const users = mysqlTable("users", {
  id: id36().primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: mysqlEnum("role", ["student", "teacher", "admin"]).notNull().default("student"),
  isVerified: boolean("is_verified").notNull().default(false),
  approved: boolean("approved").notNull().default(true),
  locale: mysqlEnum("locale", ["en", "ar"]).notNull().default("en"),
  theme: mysqlEnum("theme", ["light", "dark", "system"]).notNull().default("system"),
  avatar: text("avatar"),
  phone: text("phone"),
  age: int("age"),
  // Profile fields the app stores flat on the user (matches lib/types User).
  wilaya: text("wilaya"),
  baladiya: text("baladiya"),
  bio: text("bio"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const courses = mysqlTable("courses", {
  id: id36().primaryKey(),
  title: text("title").notNull(),
  titleAr: text("title_ar"),
  description: text("description"),
  descriptionAr: text("description_ar"),
  subject: text("subject").notNull(),
  subjectAr: text("subject_ar"),
  level: mysqlEnum("level", ["middle", "high", "exam"]).notNull(),
  division: text("division"),
  price: int("price").notNull().default(0),
  teacherName: text("teacher_name").notNull(),
  teacherEmail: text("teacher_email"),
  zoomUrl: text("zoom_url"),
  thumbnail: text("thumbnail"),
  tags: json("tags").$type<string[]>().default([]),
  isPopular: boolean("is_popular").notNull().default(false),
  isGoldPack: boolean("is_gold_pack").notNull().default(false),
  rating: int("rating").notNull().default(5), // 0..5 (app uses whole stars)
  durationHours: int("duration_hours").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const lessons = mysqlTable("lessons", {
  id: id36().primaryKey(),
  courseId: fk36("course_id").notNull().references(() => courses.id),
  title: text("title").notNull(),
  titleAr: text("title_ar"),
  videoUrl: text("video_url"),
  durationMin: int("duration_min").notNull().default(0),
  order: int("order").notNull().default(0),
  isPreview: boolean("is_preview").notNull().default(false),
});

/**
 * CourseCode — auto-generated per course. One code = one course = one access.
 * single-use: redeeming binds exactly one student and flips status to 'used'.
 */
export const courseCodes = mysqlTable("course_codes", {
  id: id36().primaryKey(),
  courseId: fk36("course_id").notNull().references(() => courses.id),
  code: varchar("code", { length: 64 }).notNull().unique(),
  label: text("label").notNull(), // e.g. "#35"
  status: mysqlEnum("status", ["available", "used", "revoked"]).notNull().default("available"),
  boundUserId: fk36("bound_user_id").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  usedAt: timestamp("used_at"),
});

export const enrollments = mysqlTable("enrollments", {
  id: id36().primaryKey(),
  userId: fk36("user_id").notNull().references(() => users.id),
  courseId: fk36("course_id").notNull().references(() => courses.id),
  courseCodeId: fk36("course_code_id").references(() => courseCodes.id),
  status: mysqlEnum("status", ["saved", "active"]).notNull().default("active"),
  progressPercent: int("progress_percent").notNull().default(0),
  completedLessonIds: json("completed_lesson_ids").$type<string[]>().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  // Every enrollment lookup filters by this pair (join-course, complete-lesson,
  // save-course, start-quiz, ...) — without it, each is a full table scan.
  index("enrollments_user_course_idx").on(table.userId, table.courseId),
]);

export const savedCourses = mysqlTable("saved_courses", {
  id: id36().primaryKey(),
  userId: fk36("user_id").notNull().references(() => users.id),
  courseId: fk36("course_id").notNull().references(() => courses.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const bookOrders = mysqlTable("book_orders", {
  id: id36().primaryKey(),
  enrollmentId: fk36("enrollment_id").references(() => enrollments.id),
  userId: fk36("user_id").notNull().references(() => users.id),
  courseId: fk36("course_id").notNull().references(() => courses.id),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  wilaya: text("wilaya").notNull(),
  baladiya: text("baladiya").notNull(),
  deliveryType: mysqlEnum("delivery_type", ["home", "office", "pickup"]).notNull().default("home"),
  status: mysqlEnum("status", ["pending", "confirmed", "shipped", "delivered"]).notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const questions = mysqlTable("questions", {
  id: id36().primaryKey(),
  courseId: fk36("course_id").notNull().references(() => courses.id),
  userId: fk36("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  resolved: boolean("resolved").notNull().default(false),
}, (table) => [
  index("questions_course_idx").on(table.courseId),
]);

export const replies = mysqlTable("replies", {
  id: id36().primaryKey(),
  questionId: fk36("question_id").notNull().references(() => questions.id),
  userId: fk36("user_id").notNull().references(() => users.id),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/** Generic uploaded-file store (bytes live in the database — no external
 *  storage service). Currently only used for quiz question images. */
export const uploads = mysqlTable("uploads", {
  id: id36().primaryKey(),
  mime: text("mime").notNull(),
  data: blob("data").notNull(),
  size: int("size").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const quizzes = mysqlTable("quizzes", {
  id: id36().primaryKey(),
  courseId: fk36("course_id").notNull().references(() => courses.id),
  title: text("title").notNull(),
  titleAr: text("title_ar"),
  description: text("description"),
  descriptionAr: text("description_ar"),
  timeLimitMin: int("time_limit_min"), // null = untimed
  passingScore: int("passing_score").notNull().default(60), // percent
  maxAttempts: int("max_attempts"), // null = unlimited
  availableFrom: timestamp("available_from"),
  availableUntil: timestamp("available_until"),
  shuffleQuestions: boolean("shuffle_questions").notNull().default(false),
  shuffleAnswers: boolean("shuffle_answers").notNull().default(false),
  showAnswersAfterSubmit: boolean("show_answers_after_submit").notNull().default(true),
  showExplanationsAfterSubmit: boolean("show_explanations_after_submit").notNull().default(true),
  status: mysqlEnum("status", ["draft", "published"]).notNull().default("draft"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const quizQuestions = mysqlTable("quiz_questions", {
  id: id36().primaryKey(),
  quizId: fk36("quiz_id").notNull().references(() => quizzes.id),
  type: mysqlEnum("type", ["single", "multiple", "true_false"]).notNull().default("single"),
  text: text("text").notNull(),
  textAr: text("text_ar"),
  imageId: fk36("image_id").references(() => uploads.id),
  points: int("points").notNull().default(1),
  order: int("order").notNull().default(0),
  explanation: text("explanation"),
  explanationAr: text("explanation_ar"),
});

export const quizChoices = mysqlTable("quiz_choices", {
  id: id36().primaryKey(),
  questionId: fk36("question_id").notNull().references(() => quizQuestions.id),
  text: text("text").notNull(),
  textAr: text("text_ar"),
  isCorrect: boolean("is_correct").notNull().default(false),
  order: int("order").notNull().default(0),
});

export const quizAttempts = mysqlTable("quiz_attempts", {
  id: id36().primaryKey(),
  quizId: fk36("quiz_id").notNull().references(() => quizzes.id),
  userId: fk36("user_id").notNull().references(() => users.id),
  attemptNumber: int("attempt_number").notNull().default(1),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  submittedAt: timestamp("submitted_at"), // null = in progress
  score: int("score"),
  maxScore: int("max_score").notNull().default(0),
  percentage: int("percentage"),
  passed: boolean("passed"),
  timeSpentSec: int("time_spent_sec"),
}, (table) => [
  index("quiz_attempts_quiz_user_idx").on(table.quizId, table.userId),
]);

export const quizAnswers = mysqlTable("quiz_answers", {
  id: id36().primaryKey(),
  attemptId: fk36("attempt_id").notNull().references(() => quizAttempts.id),
  questionId: fk36("question_id").notNull().references(() => quizQuestions.id),
  selectedChoiceIds: json("selected_choice_ids").$type<string[]>().default([]),
  isCorrect: boolean("is_correct").notNull().default(false),
  pointsEarned: int("points_earned").notNull().default(0),
});

export const notifications = mysqlTable("notifications", {
  id: id36().primaryKey(),
  userId: fk36("user_id").notNull().references(() => users.id),
  titleKey: text("title_key").notNull(),
  bodyKey: text("body_key").notNull(),
  meta: json("meta").$type<Record<string, string>>().default({}),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const reviews = mysqlTable("reviews", {
  id: id36().primaryKey(),
  userId: fk36("user_id").references(() => users.id),
  authorName: text("author_name").notNull(),
  authorRole: text("author_role"),
  rating: int("rating").notNull().default(5),
  body: text("body").notNull(),
  bodyAr: text("body_ar"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const otps = mysqlTable("otps", {
  id: id36().primaryKey(),
  userId: fk36("user_id").references(() => users.id),
  email: varchar("email", { length: 255 }).notNull(),
  code: varchar("code", { length: 512 }).notNull(),
  purpose: mysqlEnum("purpose", ["signup", "reset", "join"]).notNull(),
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
