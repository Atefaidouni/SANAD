/**
 * App-facing domain types. These mirror the Drizzle row shapes in
 * `lib/db/schema.ts` but use plain JS `Date`/string ids so the mock store and
 * the UI can share one vocabulary. When swapping to Postgres, these line up
 * with `typeof table.$inferSelect`.
 */

export type Role = "student" | "teacher" | "admin";
export type Locale = "en" | "ar";
export type Theme = "light" | "dark" | "system";
export type CodeStatus = "available" | "used" | "revoked";
export type EnrollmentStatus = "saved" | "active";
export type OtpPurpose = "signup" | "reset" | "join";
export type DeliveryType = "home" | "office" | "pickup";
export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered";
export type Level = "middle" | "high" | "exam";

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
