/**
 * Row mappers: Drizzle row (Date timestamps) → app domain types (ISO strings).
 * Server-only. Keeps the client/UI vocabulary identical to the old mock store.
 */
import "server-only";
import * as s from "@/lib/db/schema";
import type {
  BookOrder,
  Course,
  CourseCode,
  Enrollment,
  Lesson,
  Notification,
  Question,
  Reply,
  Review,
  User,
} from "@/lib/types";

type UserRow = typeof s.users.$inferSelect;
type CourseRow = typeof s.courses.$inferSelect;
type LessonRow = typeof s.lessons.$inferSelect;
type CodeRow = typeof s.courseCodes.$inferSelect;
type EnrollmentRow = typeof s.enrollments.$inferSelect;
type OrderRow = typeof s.bookOrders.$inferSelect;
type QuestionRow = typeof s.questions.$inferSelect;
type ReplyRow = typeof s.replies.$inferSelect;
type NotificationRow = typeof s.notifications.$inferSelect;
type ReviewRow = typeof s.reviews.$inferSelect;

const iso = (d: Date | null | undefined) => (d ? d.toISOString() : undefined);

export function mapUser(r: UserRow): User {
  return {
    id: r.id,
    firstName: r.firstName,
    lastName: r.lastName,
    email: r.email,
    passwordHash: r.passwordHash,
    role: r.role,
    isVerified: r.isVerified,
    approved: r.approved,
    locale: r.locale,
    theme: r.theme,
    avatar: r.avatar,
    phone: r.phone,
    age: r.age,
    wilaya: r.wilaya,
    baladiya: r.baladiya,
    bio: r.bio,
    createdAt: r.createdAt.toISOString(),
  };
}

/** Public projection — safe to expose to any signed-in user (forum/review authors). */
export function mapPublicUser(r: UserRow): User {
  return {
    ...mapUser(r),
    // Hide everything sensitive; keep only what the UI renders for authors.
    passwordHash: "",
    email: "",
    phone: null,
    age: null,
    wilaya: null,
    baladiya: null,
    bio: null,
    isVerified: true,
  };
}

export function mapCourse(r: CourseRow, studentsCount = 0): Course {
  return {
    id: r.id,
    title: r.title,
    titleAr: r.titleAr ?? undefined,
    description: r.description ?? undefined,
    descriptionAr: r.descriptionAr ?? undefined,
    subject: r.subject,
    subjectAr: r.subjectAr ?? undefined,
    level: r.level,
    division: r.division ?? undefined,
    price: r.price,
    teacherName: r.teacherName,
    teacherEmail: r.teacherEmail ?? undefined,
    zoomUrl: r.zoomUrl ?? undefined,
    thumbnail: r.thumbnail ?? undefined,
    tags: r.tags ?? [],
    isPopular: r.isPopular,
    isGoldPack: r.isGoldPack,
    rating: r.rating,
    durationHours: r.durationHours,
    studentsCount,
    createdAt: r.createdAt.toISOString(),
  };
}

export function mapLesson(r: LessonRow): Lesson {
  return {
    id: r.id,
    courseId: r.courseId,
    title: r.title,
    titleAr: r.titleAr ?? undefined,
    videoUrl: r.videoUrl ?? undefined,
    durationMin: r.durationMin,
    order: r.order,
    isPreview: r.isPreview,
  };
}

export function mapCode(r: CodeRow): CourseCode {
  return {
    id: r.id,
    courseId: r.courseId,
    code: r.code,
    label: r.label,
    status: r.status,
    boundUserId: r.boundUserId,
    createdAt: r.createdAt.toISOString(),
    usedAt: iso(r.usedAt) ?? null,
  };
}

export function mapEnrollment(r: EnrollmentRow): Enrollment {
  return {
    id: r.id,
    userId: r.userId,
    courseId: r.courseId,
    courseCodeId: r.courseCodeId,
    status: r.status,
    progressPercent: r.progressPercent,
    completedLessonIds: r.completedLessonIds ?? [],
    createdAt: r.createdAt.toISOString(),
  };
}

export function mapOrder(r: OrderRow): BookOrder {
  return {
    id: r.id,
    enrollmentId: r.enrollmentId,
    userId: r.userId,
    courseId: r.courseId,
    fullName: r.fullName,
    phone: r.phone,
    wilaya: r.wilaya,
    baladiya: r.baladiya,
    deliveryType: r.deliveryType,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
  };
}

export function mapQuestion(r: QuestionRow): Question {
  return {
    id: r.id,
    courseId: r.courseId,
    userId: r.userId,
    title: r.title,
    body: r.body,
    resolved: r.resolved,
    createdAt: r.createdAt.toISOString(),
  };
}

export function mapReply(r: ReplyRow): Reply {
  return {
    id: r.id,
    questionId: r.questionId,
    userId: r.userId,
    body: r.body,
    createdAt: r.createdAt.toISOString(),
  };
}

export function mapNotification(r: NotificationRow): Notification {
  return {
    id: r.id,
    userId: r.userId,
    titleKey: r.titleKey,
    bodyKey: r.bodyKey,
    meta: r.meta ?? {},
    read: r.read,
    createdAt: r.createdAt.toISOString(),
  };
}

export function mapReview(r: ReviewRow): Review {
  return {
    id: r.id,
    userId: r.userId,
    authorName: r.authorName,
    authorRole: r.authorRole ?? undefined,
    rating: r.rating,
    body: r.body,
    bodyAr: r.bodyAr ?? undefined,
    createdAt: r.createdAt.toISOString(),
  };
}
