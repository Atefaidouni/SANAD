/**
 * App-facing domain types. These mirror the Drizzle row shapes in
 * `lib/db/schema.ts` (`typeof table.$inferSelect`) but use plain JS
 * `Date`/string ids so the mock store and the UI can share one vocabulary.
 */

export type Role = "student" | "teacher" | "admin";
export type Locale = "en" | "ar";
export type Theme = "light" | "dark" | "system";
export type CodeStatus = "available" | "used" | "revoked";
export type EnrollmentStatus = "saved" | "active";
export type OtpPurpose = "signup" | "reset" | "join";
export type DeliveryType = "home" | "office" | "pickup";
export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered";
export type Level = "middle" | "high" | "exam" | "university";
export type QuizStatus = "draft" | "published";
export type QuizQuestionType = "single" | "multiple" | "true_false";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  role: Role;
  isVerified: boolean;
  /** Teachers require admin approval before they can manage their courses.
   *  Students and admins are always approved. */
  approved: boolean;
  locale: Locale;
  theme: Theme;
  avatar?: string | null;
  phone?: string | null;
  age?: number | null;
  wilaya?: string | null;
  baladiya?: string | null;
  bio?: string | null;
  createdAt: string; // ISO
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  titleAr?: string;
  /** Link to the recorded video (Zoom/YouTube/etc.). Records are videos. */
  videoUrl?: string;
  durationMin: number;
  order: number;
  isPreview: boolean;
}

export interface Course {
  id: string;
  title: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  subject: string;
  subjectAr?: string;
  level: Level;
  division?: string;
  price: number;
  teacherName: string;
  /** Exact email of the assigned teacher — grants them course management +
   *  forum-reply access to this course. */
  teacherEmail?: string;
  zoomUrl?: string;
  thumbnail?: string;
  tags: string[];
  isPopular: boolean;
  isGoldPack: boolean;
  rating: number; // 0..5 (one decimal)
  durationHours: number;
  studentsCount: number;
  createdAt: string;
}

export interface CourseCode {
  id: string;
  courseId: string;
  code: string;
  label: string; // e.g. "#35"
  status: CodeStatus;
  boundUserId?: string | null;
  createdAt: string;
  usedAt?: string | null;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  courseCodeId?: string | null;
  status: EnrollmentStatus;
  progressPercent: number;
  completedLessonIds: string[];
  createdAt: string;
}

export interface BookOrder {
  id: string;
  enrollmentId?: string | null;
  userId: string;
  courseId: string;
  fullName: string;
  phone: string;
  wilaya: string;
  baladiya: string;
  deliveryType: DeliveryType;
  status: OrderStatus;
  createdAt: string;
}

export interface Question {
  id: string;
  courseId: string;
  userId: string;
  title: string;
  body: string;
  resolved: boolean;
  createdAt: string;
}

export interface Reply {
  id: string;
  questionId: string;
  userId: string;
  body: string;
  createdAt: string;
}

export interface Quiz {
  id: string;
  courseId: string;
  title: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  timeLimitMin?: number | null;
  passingScore: number;
  maxAttempts?: number | null;
  availableFrom?: string | null;
  availableUntil?: string | null;
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  showAnswersAfterSubmit: boolean;
  showExplanationsAfterSubmit: boolean;
  status: QuizStatus;
  createdAt: string;
  updatedAt: string;
}

export interface QuizChoice {
  id: string;
  questionId: string;
  text: string;
  textAr?: string;
  /** Only present for admin / the owning teacher, or in a graded attempt result. */
  isCorrect?: boolean;
  order: number;
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  type: QuizQuestionType;
  text: string;
  textAr?: string;
  imageId?: string | null;
  points: number;
  order: number;
  /** Only present for admin / the owning teacher, or in a graded attempt result. */
  explanation?: string | null;
  explanationAr?: string | null;
  choices: QuizChoice[];
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  attemptNumber: number;
  startedAt: string;
  submittedAt?: string | null;
  score?: number | null;
  maxScore: number;
  percentage?: number | null;
  passed?: boolean | null;
  timeSpentSec?: number | null;
}

export interface QuizAnswer {
  id: string;
  attemptId: string;
  questionId: string;
  selectedChoiceIds: string[];
  isCorrect: boolean;
  pointsEarned: number;
}

/** Sanitized question set (no `isCorrect`/`explanation`) returned when a student starts an attempt. */
export interface QuizAttemptSet {
  attempt: QuizAttempt;
  quiz: Quiz;
  questions: QuizQuestion[];
}

/** Fully graded result — correct answers + explanations included — returned right after submit. */
export interface QuizAttemptReview {
  attempt: QuizAttempt;
  answers: QuizAnswer[];
  questions: QuizQuestion[]; // includes isCorrect/explanation
}

/** Shared shape for creating/editing a question — used by the store and the builder UI. */
export interface QuizQuestionInput {
  type: QuizQuestionType;
  text: string;
  textAr?: string;
  imageId?: string | null;
  points?: number;
  explanation?: string;
  explanationAr?: string;
  choices: { text: string; textAr?: string; isCorrect: boolean }[];
}

export interface QuizWithMeta extends Quiz {
  questionCount: number;
  totalPoints: number;
  myAttempts: QuizAttempt[];
}

export interface Notification {
  id: string;
  userId: string;
  titleKey: string;
  bodyKey: string;
  meta: Record<string, string>;
  read: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  userId?: string | null;
  authorName: string;
  authorRole?: string;
  rating: number;
  body: string;
  bodyAr?: string;
  createdAt: string;
}

export interface Otp {
  id: string;
  userId?: string | null;
  email: string;
  code: string;
  purpose: OtpPurpose;
  expiresAt: string;
  used: boolean;
}

/** A lightweight session object shaped like an Auth.js session. */
export interface Session {
  user: Pick<User, "id" | "firstName" | "lastName" | "email" | "role" | "avatar" | "locale">;
}

/* --------- Derived view models used across surfaces --------- */

export interface CourseWithMeta extends Course {
  lessons: Lesson[];
  totalLessons: number;
  totalCodes: number;
  usedCodes: number;
  availableCodes: number;
}

export interface EnrolledCourse {
  enrollment: Enrollment;
  course: Course;
  code?: CourseCode | null;
}

export interface StudentRow {
  user: User;
  course: Course;
  code?: CourseCode | null;
  enrollment: Enrollment;
}

export interface QuestionThread {
  question: Question;
  author: User;
  replies: Array<{ reply: Reply; author: User }>;
}

export interface BookOrderRow {
  order: BookOrder;
  user: User;
  course: Course;
}
