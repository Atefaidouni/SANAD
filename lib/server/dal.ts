/**
 * Server data-access layer. The real backend: Drizzle queries + mutations,
 * with authorization enforced from the *session* (never trusting client args).
 *
 * - `buildSnapshot(current)` returns a role-scoped, sanitized copy of the DB
 *   that the client store caches and reads from (no password hashes, no codes
 *   the user shouldn't see, no other users' PII).
 * - The mutation functions mirror the old mock-store method names so the client
 *   can call them by name through `/api/rpc`.
 */
import "server-only";
import { and, eq, inArray } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { hashPassword, verifyPassword } from "./auth";
import {
  mapCode,
  mapCourse,
  mapEnrollment,
  mapLesson,
  mapNotification,
  mapOrder,
  mapPublicUser,
  mapQuestion,
  mapQuiz,
  mapQuizAnswer,
  mapQuizAttempt,
  mapQuizQuestion,
  mapReply,
  mapReview,
  mapUser,
} from "./map";
import { generateAccessCode } from "@/lib/utils";
import type { Database } from "@/lib/mock/seed";
import type {
  DeliveryType,
  Level,
  QuizQuestionType,
  Role,
  Session,
  User,
} from "@/lib/types";

export interface Result<T = unknown> {
  ok: boolean;
  error?: string;
  data?: T;
}

const ok = <T,>(data?: T): Result<T> => ({ ok: true, data });
const fail = (error: string): Result<never> => ({ ok: false, error });

class AuthError extends Error {}
function requireAuth(current: User | null): User {
  if (!current) throw new AuthError("unauthorized");
  return current;
}
function requireAdmin(current: User | null): User {
  const u = requireAuth(current);
  if (u.role !== "admin") throw new AuthError("forbidden");
  return u;
}

export async function getUserById(id: string): Promise<User | null> {
  const rows = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
  return rows[0] ? mapUser(rows[0]) : null;
}

export function sessionFor(user: User | null): Session | null {
  if (!user) return null;
  return {
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      locale: user.locale,
    },
  };
}

/* =========================== SNAPSHOT (reads) =========================== */

export async function buildSnapshot(current: User | null): Promise<Database> {
  const [
    userRows,
    courseRows,
    lessonRows,
    codeRows,
    enrollmentRows,
    orderRows,
    questionRows,
    replyRows,
    reviewRows,
    notificationRows,
    quizRows,
    quizQuestionRows,
    quizChoiceRows,
    quizAttemptRows,
  ] = await Promise.all([
    db.select().from(schema.users),
    db.select().from(schema.courses),
    db.select().from(schema.lessons),
    db.select().from(schema.courseCodes),
    db.select().from(schema.enrollments),
    db.select().from(schema.bookOrders),
    db.select().from(schema.questions),
    db.select().from(schema.replies),
    db.select().from(schema.reviews),
    current
      ? db.select().from(schema.notifications).where(eq(schema.notifications.userId, current.id))
      : Promise.resolve([] as (typeof schema.notifications.$inferSelect)[]),
    db.select().from(schema.quizzes),
    db.select().from(schema.quizQuestions),
    db.select().from(schema.quizChoices),
    db.select().from(schema.quizAttempts),
  ]);

  const isAdmin = current?.role === "admin";
  const isTeacher = current?.role === "teacher";
  const myEmail = current?.email?.toLowerCase();

  // Active-enrollment count per course → Course.studentsCount.
  const activeCount = new Map<string, number>();
  for (const e of enrollmentRows) {
    if (e.status === "active") activeCount.set(e.courseId, (activeCount.get(e.courseId) ?? 0) + 1);
  }

  // Course ids the current teacher is assigned to.
  const teacherCourseIds = new Set(
    isTeacher && myEmail
      ? courseRows.filter((c) => c.teacherEmail?.toLowerCase() === myEmail).map((c) => c.id)
      : []
  );
  // Course ids the current student is actively enrolled in (for video access).
  const myActiveCourseIds = new Set(
    current
      ? enrollmentRows
          .filter((e) => e.userId === current.id && e.status === "active")
          .map((e) => e.courseId)
      : []
  );

  /* --- users: admin sees all (no hash); others see self + public authors --- */
  const users: User[] = userRows.map((r) => {
    if (isAdmin || r.id === current?.id) return { ...mapUser(r), passwordHash: "" };
    return mapPublicUser(r);
  });

  /* --- courses: catalog for everyone; hide teacherEmail from students/anon --- */
  const courses = courseRows.map((r) => {
    const c = mapCourse(r, activeCount.get(r.id) ?? 0);
    if (!isAdmin && !isTeacher) c.teacherEmail = undefined;
    return c;
  });

  /* --- lessons: gate videoUrl to preview / enrolled / managers --- */
  const lessons = lessonRows.map((r) => {
    const l = mapLesson(r);
    const canSeeVideo =
      isAdmin || teacherCourseIds.has(r.courseId) || l.isPreview || myActiveCourseIds.has(r.courseId);
    if (!canSeeVideo) l.videoUrl = undefined;
    return l;
  });

  /* --- codes: admin all / teacher own courses / student own bound codes --- */
  const courseCodes = codeRows
    .filter((r) => {
      if (isAdmin) return true;
      if (isTeacher) return teacherCourseIds.has(r.courseId);
      return current ? r.boundUserId === current.id : false;
    })
    .map(mapCode);

  /* --- enrollments: admin all / teacher own courses / student own --- */
  const enrollments = enrollmentRows
    .filter((r) => {
      if (isAdmin) return true;
      if (isTeacher) return teacherCourseIds.has(r.courseId);
      return current ? r.userId === current.id : false;
    })
    .map(mapEnrollment);

  /* --- book orders: admin all / student own --- */
  const bookOrders = orderRows
    .filter((r) => (isAdmin ? true : current ? r.userId === current.id : false))
    .map(mapOrder);

  // Forum is shared per course; reviews are public; notifications already scoped.
  const questions = questionRows.map(mapQuestion);
  const replies = replyRows.map(mapReply);
  const reviews = reviewRows.map(mapReview);
  const notifications = notificationRows.map(mapNotification);

  /* --- quizzes: admin all / teacher own-course / student published+enrolled --- */
  const quizzes = quizRows
    .filter((r) => {
      if (isAdmin) return true;
      if (isTeacher) return teacherCourseIds.has(r.courseId);
      return r.status === "published" && myActiveCourseIds.has(r.courseId);
    })
    .map(mapQuiz);
  const visibleQuizIds = new Set(quizzes.map((q) => q.id));

  /* --- quiz question content: admin / owning teacher ONLY. Students never
   *  get question content through the passive snapshot — only through the
   *  sanitized `startQuizAttempt` result and the graded `submitQuizAttempt`
   *  result, so a student can't just read the DB snapshot to see answers. --- */
  const quizQuestions =
    isAdmin || isTeacher
      ? quizQuestionRows
          .filter((r) => visibleQuizIds.has(r.quizId))
          .sort((a, b) => a.order - b.order)
          .map((r) => mapQuizQuestion(r, quizChoiceRows, /* redact */ false))
      : [];

  /* --- quiz attempts: admin all / teacher own-quizzes / student own --- */
  const quizAttempts = quizAttemptRows
    .filter((r) => {
      if (isAdmin) return true;
      if (isTeacher) return visibleQuizIds.has(r.quizId);
      return current ? r.userId === current.id : false;
    })
    .map(mapQuizAttempt);

  return {
    users,
    courses,
    lessons,
    courseCodes,
    enrollments,
    bookOrders,
    questions,
    replies,
    notifications,
    reviews,
    otps: [], // OTP rows are never exposed to the client.
    quizzes,
    quizQuestions,
    quizAttempts,
  };
}

/* =========================== AUTH (DB side) =========================== */

export async function registerUser(input: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: Role;
}): Promise<Result<{ userId: string }>> {
  const email = input.email.trim().toLowerCase();
  const existing = await db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.email, email)).limit(1);
  if (existing.length) return fail("email_exists");

  const role: Role = input.role ?? "student";
  const passwordHash = await hashPassword(input.password);
  const [row] = await db
    .insert(schema.users)
    .values({
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      email,
      passwordHash,
      role,
      isVerified: true,
      approved: role !== "teacher",
      locale: "en",
      theme: "system",
    })
    .returning({ id: schema.users.id, firstName: schema.users.firstName, lastName: schema.users.lastName });

  // New teacher → notify all admins of the pending approval.
  if (role === "teacher") {
    const admins = await db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.role, "admin"));
    await pushNotifications(
      admins.map((a) => a.id),
      "notif.teacherApproval.title",
      "notif.teacherApproval.body",
      { teacher: `${row.firstName} ${row.lastName}`.trim() }
    );
  }
  return ok({ userId: row.id });
}

/** Verify credentials; returns the user id on success. */
export async function authenticate(email: string, password: string): Promise<Result<{ userId: string }>> {
  try {
    const rows = await db.select().from(schema.users).where(eq(schema.users.email, email.trim().toLowerCase())).limit(1);
    const row = rows[0];
    if (!row) return fail("invalid_credentials");
    const valid = await verifyPassword(password, row.passwordHash);
    if (!valid) return fail("invalid_credentials");
    return ok({ userId: row.id });
  } catch (err) {
    console.error("DB read failed in authenticate:", err);
    return fail("service_unavailable");
  }
}

export async function resetUserPassword(email: string, newPassword: string): Promise<Result> {
  const rows = await db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.email, email.trim().toLowerCase())).limit(1);
  if (!rows.length) return fail("user_not_found");
  const passwordHash = await hashPassword(newPassword);
  await db.update(schema.users).set({ passwordHash }).where(eq(schema.users.id, rows[0].id));
  return ok();
}

/* =========================== RPC mutations =========================== */

async function pushNotifications(
  userIds: string[],
  titleKey: string,
  bodyKey: string,
  meta: Record<string, string>
) {
  if (!userIds.length) return;
  await db.insert(schema.notifications).values(
    userIds.map((userId) => ({ userId, titleKey, bodyKey, meta }))
  );
}

async function canManageCourse(current: User, courseId: string): Promise<boolean> {
  if (current.role === "admin") return true;
  if (current.role !== "teacher" || !current.approved) return false;
  const rows = await db.select({ teacherEmail: schema.courses.teacherEmail }).from(schema.courses).where(eq(schema.courses.id, courseId)).limit(1);
  const email = rows[0]?.teacherEmail?.toLowerCase();
  return !!email && email === current.email.toLowerCase();
}

async function syncCourseDuration(courseId: string) {
  const ls = await db.select({ d: schema.lessons.durationMin }).from(schema.lessons).where(eq(schema.lessons.courseId, courseId));
  const mins = ls.reduce((s, l) => s + (l.d ?? 0), 0);
  await db.update(schema.courses).set({ durationHours: Math.max(1, Math.round(mins / 60)) }).where(eq(schema.courses.id, courseId));
}

async function nextCodeLabelStart(courseId: string): Promise<number> {
  const existing = await db.select({ id: schema.courseCodes.id }).from(schema.courseCodes).where(eq(schema.courseCodes.courseId, courseId));
  return existing.length;
}

async function generateCodes(courseId: string, count: number) {
  const start = await nextCodeLabelStart(courseId);
  const values = Array.from({ length: count }, (_, i) => ({
    courseId,
    code: generateAccessCode(),
    label: `#${start + i + 1}`,
    status: "available" as const,
  }));
  if (values.length) await db.insert(schema.courseCodes).values(values);
}

/** Cascades a full quiz deletion (choices → questions, answers → attempts → quiz). */
async function deleteQuizForId(quizId: string) {
  const qRows = await db.select({ id: schema.quizQuestions.id }).from(schema.quizQuestions).where(eq(schema.quizQuestions.quizId, quizId));
  const questionIds = qRows.map((r) => r.id);
  if (questionIds.length) {
    await db.delete(schema.quizChoices).where(inArray(schema.quizChoices.questionId, questionIds));
  }
  const aRows = await db.select({ id: schema.quizAttempts.id }).from(schema.quizAttempts).where(eq(schema.quizAttempts.quizId, quizId));
  const attemptIds = aRows.map((r) => r.id);
  if (attemptIds.length) {
    await db.delete(schema.quizAnswers).where(inArray(schema.quizAnswers.attemptId, attemptIds));
  }
  await db.delete(schema.quizQuestions).where(eq(schema.quizQuestions.quizId, quizId));
  await db.delete(schema.quizAttempts).where(eq(schema.quizAttempts.quizId, quizId));
  await db.delete(schema.quizzes).where(eq(schema.quizzes.id, quizId));
}

/** Cascades quiz deletion for every quiz belonging to the given courses (used when a course is deleted). */
async function deleteQuizzesForCourses(courseIds: string[]) {
  if (!courseIds.length) return;
  const quizRows = await db.select({ id: schema.quizzes.id }).from(schema.quizzes).where(inArray(schema.quizzes.courseId, courseIds));
  for (const q of quizRows) await deleteQuizForId(q.id);
}

/** Loads a quiz's courseId, throwing `not_found`/`forbidden` Results via the caller. */
async function requireQuizOwner(current: User, quizId: string): Promise<{ courseId: string } | null> {
  const rows = await db.select({ courseId: schema.quizzes.courseId }).from(schema.quizzes).where(eq(schema.quizzes.id, quizId)).limit(1);
  if (!rows.length) return null;
  if (!(await canManageCourse(current, rows[0].courseId))) throw new AuthError("forbidden");
  return rows[0];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const mutations = {
  async updateProfile(current: User | null, args: { patch: Partial<User> }): Promise<Result> {
    const u = requireAuth(current);
    const p = args.patch ?? {};
    // Whitelist editable fields (never role/approved/passwordHash/email from here).
    const set: Partial<typeof schema.users.$inferInsert> = {};
    for (const k of ["firstName", "lastName", "avatar", "phone", "age", "wilaya", "baladiya", "bio", "locale", "theme"] as const) {
      if (k in p && p[k] !== undefined) (set as Record<string, unknown>)[k] = p[k];
    }
    if (Object.keys(set).length) await db.update(schema.users).set(set).where(eq(schema.users.id, u.id));
    return ok();
  },

  async updatePassword(current: User | null, args: { current: string; next: string }): Promise<Result> {
    const u = requireAuth(current);
    const rows = await db.select({ hash: schema.users.passwordHash }).from(schema.users).where(eq(schema.users.id, u.id)).limit(1);
    if (!rows.length) return fail("user_not_found");
    const valid = await verifyPassword(args.current, rows[0].hash);
    if (!valid) return fail("wrong_password");
    await db.update(schema.users).set({ passwordHash: await hashPassword(args.next) }).where(eq(schema.users.id, u.id));
    return ok();
  },

  async createCourse(current: User | null, args: { input: Record<string, unknown> }): Promise<Result<{ courseId: string }>> {
    // Admins may create a course for any teacher; an approved teacher may only
    // create a course assigned to themselves (identity is never taken from the
    // client — it's always pinned to the caller's own session).
    const actor = requireAuth(current);
    if (actor.role !== "admin" && !(actor.role === "teacher" && actor.approved)) {
      throw new AuthError("forbidden");
    }
    const input = args.input as {
      title: string; titleAr?: string; subject: string; level: Level; division?: string;
      price: number; teacherName: string; teacherEmail?: string; zoomUrl?: string;
      thumbnail?: string; tags?: string[]; description?: string; isPopular?: boolean;
      isGoldPack?: boolean; codeCount?: number;
    };
    const isAdmin = actor.role === "admin";
    const teacherName = isAdmin ? input.teacherName : `${actor.firstName} ${actor.lastName}`.trim();
    const teacherEmail = isAdmin
      ? input.teacherEmail?.trim().toLowerCase() || null
      : actor.email.toLowerCase();
    const [row] = await db.insert(schema.courses).values({
      title: input.title,
      titleAr: input.titleAr,
      description: input.description,
      subject: input.subject,
      level: input.level,
      division: input.division,
      price: input.price,
      teacherName,
      teacherEmail,
      zoomUrl: input.zoomUrl,
      thumbnail: input.thumbnail || "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=70",
      tags: input.tags ?? [],
      isPopular: input.isPopular ?? false,
      isGoldPack: input.isGoldPack ?? false,
      rating: 5,
      durationHours: 0,
    }).returning({ id: schema.courses.id });

    await generateCodes(row.id, input.codeCount ?? 10);

    const students = await db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.role, "student"));
    await pushNotifications(students.map((s) => s.id), "notif.courseAdded.title", "notif.courseAdded.body", { course: input.title });

    return ok({ courseId: row.id });
  },

  async updateCourse(current: User | null, args: { id: string; patch: Record<string, unknown> }): Promise<Result> {
    requireAdmin(current);
    const patch = { ...args.patch } as Record<string, unknown>;
    if ("teacherEmail" in patch) {
      const te = patch.teacherEmail as string | undefined;
      patch.teacherEmail = te?.trim().toLowerCase() || null;
    }
    // Drop fields that aren't real columns / shouldn't be set directly.
    delete patch.id; delete patch.createdAt; delete patch.studentsCount;
    if (Object.keys(patch).length) await db.update(schema.courses).set(patch).where(eq(schema.courses.id, args.id));
    return ok();
  },

  async deleteCourse(current: User | null, args: { id: string }): Promise<Result> {
    requireAdmin(current);
    const courseId = args.id;

    const questionRows = await db.select({ id: schema.questions.id }).from(schema.questions)
      .where(eq(schema.questions.courseId, courseId));
    const questionIds = questionRows.map((q) => q.id);
    if (questionIds.length) {
      await db.delete(schema.replies).where(inArray(schema.replies.questionId, questionIds));
    }
    await db.delete(schema.questions).where(eq(schema.questions.courseId, courseId));
    await deleteQuizzesForCourses([courseId]);
    await db.delete(schema.bookOrders).where(eq(schema.bookOrders.courseId, courseId));
    await db.delete(schema.enrollments).where(eq(schema.enrollments.courseId, courseId));
    await db.delete(schema.savedCourses).where(eq(schema.savedCourses.courseId, courseId));
    await db.delete(schema.courseCodes).where(eq(schema.courseCodes.courseId, courseId));
    await db.delete(schema.lessons).where(eq(schema.lessons.courseId, courseId));
    await db.delete(schema.courses).where(eq(schema.courses.id, courseId));

    return ok();
  },

  async addLesson(current: User | null, args: { courseId: string; input: { title: string; titleAr?: string; videoUrl?: string; durationMin: number } }): Promise<Result> {
    requireAdmin(current);
    const existing = await db.select({ id: schema.lessons.id }).from(schema.lessons).where(eq(schema.lessons.courseId, args.courseId));
    await db.insert(schema.lessons).values({
      courseId: args.courseId,
      title: args.input.title,
      titleAr: args.input.titleAr,
      videoUrl: args.input.videoUrl?.trim() || null,
      durationMin: args.input.durationMin,
      order: existing.length + 1,
      isPreview: existing.length === 0,
    });
    await syncCourseDuration(args.courseId);
    return ok();
  },

  async removeLesson(current: User | null, args: { lessonId: string }): Promise<Result> {
    requireAdmin(current);
    const rows = await db.select({ courseId: schema.lessons.courseId }).from(schema.lessons).where(eq(schema.lessons.id, args.lessonId)).limit(1);
    await db.delete(schema.lessons).where(eq(schema.lessons.id, args.lessonId));
    if (rows[0]) await syncCourseDuration(rows[0].courseId);
    return ok();
  },

  async addCodes(current: User | null, args: { courseId: string; count: number }): Promise<Result<{ count: number }>> {
    requireAdmin(current);
    await generateCodes(args.courseId, args.count);
    return ok({ count: args.count });
  },

  async regenerateCodes(current: User | null, args: { courseId: string }): Promise<Result<{ count: number }>> {
    requireAdmin(current);
    // Revoke all currently-available codes, then top the pool back up to >= 10.
    await db.update(schema.courseCodes)
      .set({ status: "revoked" })
      .where(and(eq(schema.courseCodes.courseId, args.courseId), eq(schema.courseCodes.status, "available")));
    const used = await db.select({ id: schema.courseCodes.id }).from(schema.courseCodes)
      .where(and(eq(schema.courseCodes.courseId, args.courseId), eq(schema.courseCodes.status, "used")));
    const target = Math.max(10, used.length);
    await generateCodes(args.courseId, target - used.length);
    return ok({ count: target });
  },

  async revokeCode(current: User | null, args: { codeId: string }): Promise<Result> {
    requireAdmin(current);
    const rows = await db.select({ status: schema.courseCodes.status }).from(schema.courseCodes).where(eq(schema.courseCodes.id, args.codeId)).limit(1);
    if (!rows.length) return fail("code_not_found");
    if (rows[0].status === "used") return fail("code_used");
    const next = rows[0].status === "revoked" ? "available" : "revoked";
    await db.update(schema.courseCodes).set({ status: next }).where(eq(schema.courseCodes.id, args.codeId));
    return ok();
  },

  async setTeacherApproved(current: User | null, args: { userId: string; approved: boolean }): Promise<Result> {
    requireAdmin(current);
    const rows = await db.select({ role: schema.users.role }).from(schema.users).where(eq(schema.users.id, args.userId)).limit(1);
    if (!rows.length || rows[0].role !== "teacher") return fail("user_not_found");
    await db.update(schema.users).set({ approved: args.approved }).where(eq(schema.users.id, args.userId));
    return ok();
  },

  async deleteTeacher(current: User | null, args: { userId: string }): Promise<Result> {
    requireAdmin(current);
    const rows = await db.select().from(schema.users).where(eq(schema.users.id, args.userId)).limit(1);
    const teacher = rows[0];
    if (!teacher || teacher.role !== "teacher") return fail("user_not_found");

    const courseRows = await db.select({ id: schema.courses.id }).from(schema.courses)
      .where(eq(schema.courses.teacherEmail, teacher.email.toLowerCase()));
    const courseIds = courseRows.map((c) => c.id);
    if (courseIds.length) {
      const qRows = await db.select({ id: schema.questions.id }).from(schema.questions).where(inArray(schema.questions.courseId, courseIds));
      const qIds = qRows.map((q) => q.id);
      if (qIds.length) await db.delete(schema.replies).where(inArray(schema.replies.questionId, qIds));
      await db.delete(schema.questions).where(inArray(schema.questions.courseId, courseIds));
      await deleteQuizzesForCourses(courseIds);
      await db.delete(schema.bookOrders).where(inArray(schema.bookOrders.courseId, courseIds));
      await db.delete(schema.enrollments).where(inArray(schema.enrollments.courseId, courseIds));
      await db.delete(schema.courseCodes).where(inArray(schema.courseCodes.courseId, courseIds));
      await db.delete(schema.lessons).where(inArray(schema.lessons.courseId, courseIds));
      await db.delete(schema.courses).where(inArray(schema.courses.id, courseIds));
    }
    await db.delete(schema.users).where(eq(schema.users.id, args.userId));
    return ok();
  },

  async saveCourse(current: User | null, args: { courseId: string }): Promise<Result> {
    const u = requireAuth(current);
    const existing = await db.select({ id: schema.enrollments.id }).from(schema.enrollments)
      .where(and(eq(schema.enrollments.userId, u.id), eq(schema.enrollments.courseId, args.courseId))).limit(1);
    if (existing.length) return ok();
    await db.insert(schema.enrollments).values({ userId: u.id, courseId: args.courseId, status: "saved" });
    return ok();
  },

  async unsaveCourse(current: User | null, args: { courseId: string }): Promise<Result> {
    const u = requireAuth(current);
    await db.delete(schema.enrollments).where(and(
      eq(schema.enrollments.userId, u.id),
      eq(schema.enrollments.courseId, args.courseId),
      eq(schema.enrollments.status, "saved")
    ));
    return ok();
  },

  /** CORE: atomic single-use code redemption. */
  async joinCourse(current: User | null, args: { courseId: string; code: string }): Promise<Result<{ enrollmentId: string }>> {
    const u = requireAuth(current);
    const code = args.code.trim().toUpperCase();

    // Atomically claim the code only if it's available AND for this course.
    const claimed = await db.update(schema.courseCodes)
      .set({ status: "used", boundUserId: u.id, usedAt: new Date() })
      .where(and(
        eq(schema.courseCodes.code, code),
        eq(schema.courseCodes.courseId, args.courseId),
        eq(schema.courseCodes.status, "available")
      ))
      .returning({ id: schema.courseCodes.id });

    if (!claimed.length) {
      // Diagnose why the claim failed.
      const found = await db.select().from(schema.courseCodes).where(eq(schema.courseCodes.code, code)).limit(1);
      if (!found.length) return fail("code_invalid");
      const c = found[0];
      if (c.courseId !== args.courseId) return fail("code_wrong_course");
      if (c.status === "used") return fail("code_used");
      if (c.status === "revoked") return fail("code_revoked");
      return fail("code_invalid");
    }

    const codeId = claimed[0].id;
    const existing = await db.select({ id: schema.enrollments.id }).from(schema.enrollments)
      .where(and(eq(schema.enrollments.userId, u.id), eq(schema.enrollments.courseId, args.courseId))).limit(1);

    let enrollmentId: string;
    if (existing.length) {
      enrollmentId = existing[0].id;
      await db.update(schema.enrollments).set({ status: "active", courseCodeId: codeId }).where(eq(schema.enrollments.id, enrollmentId));
    } else {
      const [ins] = await db.insert(schema.enrollments)
        .values({ userId: u.id, courseId: args.courseId, courseCodeId: codeId, status: "active" })
        .returning({ id: schema.enrollments.id });
      enrollmentId = ins.id;
    }
    return ok({ enrollmentId });
  },

  async requestBook(current: User | null, args: { courseId: string; fullName: string; phone: string; wilaya: string; baladiya: string; deliveryType: DeliveryType }): Promise<Result<{ orderId: string }>> {
    const u = requireAuth(current);
    let enrollmentId: string;
    const existing = await db.select({ id: schema.enrollments.id }).from(schema.enrollments)
      .where(and(eq(schema.enrollments.userId, u.id), eq(schema.enrollments.courseId, args.courseId))).limit(1);
    if (existing.length) {
      enrollmentId = existing[0].id;
    } else {
      const [ins] = await db.insert(schema.enrollments).values({ userId: u.id, courseId: args.courseId, status: "saved" }).returning({ id: schema.enrollments.id });
      enrollmentId = ins.id;
    }
    const [order] = await db.insert(schema.bookOrders).values({
      enrollmentId,
      userId: u.id,
      courseId: args.courseId,
      fullName: args.fullName,
      phone: args.phone,
      wilaya: args.wilaya,
      baladiya: args.baladiya,
      deliveryType: args.deliveryType,
      status: "pending",
    }).returning({ id: schema.bookOrders.id });
    return ok({ orderId: order.id });
  },

  async completeLesson(current: User | null, args: { courseId: string; lessonId: string }): Promise<Result<{ progress: number }>> {
    const u = requireAuth(current);
    const rows = await db.select().from(schema.enrollments)
      .where(and(eq(schema.enrollments.userId, u.id), eq(schema.enrollments.courseId, args.courseId))).limit(1);
    const e = rows[0];
    if (!e || e.status !== "active") return fail("not_enrolled");
    const total = (await db.select({ id: schema.lessons.id }).from(schema.lessons).where(eq(schema.lessons.courseId, args.courseId))).length || 1;
    const set = new Set(e.completedLessonIds ?? []);
    if (set.has(args.lessonId)) set.delete(args.lessonId);
    else set.add(args.lessonId);
    const completed = [...set];
    const progress = Math.round((completed.length / total) * 100);
    await db.update(schema.enrollments).set({ completedLessonIds: completed, progressPercent: progress }).where(eq(schema.enrollments.id, e.id));
    return ok({ progress });
  },

  async askQuestion(current: User | null, args: { courseId: string; title: string; body: string }): Promise<Result<{ id: string }>> {
    const u = requireAuth(current);
    const [row] = await db.insert(schema.questions).values({ courseId: args.courseId, userId: u.id, title: args.title, body: args.body, resolved: false }).returning({ id: schema.questions.id });
    return ok({ id: row.id });
  },

  async replyToQuestion(current: User | null, args: { questionId: string; body: string }): Promise<Result<{ id: string }>> {
    const u = requireAuth(current);
    const q = await db.select({ courseId: schema.questions.courseId }).from(schema.questions).where(eq(schema.questions.id, args.questionId)).limit(1);
    if (!q.length) return fail("not_found");
    // Only the assigned teacher or an admin may reply (mirrors the UI).
    if (!(await canManageCourse(u, q[0].courseId))) return fail("forbidden");
    const [row] = await db.insert(schema.replies).values({ questionId: args.questionId, userId: u.id, body: args.body }).returning({ id: schema.replies.id });
    return ok({ id: row.id });
  },

  async toggleResolved(current: User | null, args: { questionId: string }): Promise<Result> {
    const u = requireAuth(current);
    const rows = await db.select().from(schema.questions).where(eq(schema.questions.id, args.questionId)).limit(1);
    if (!rows.length) return fail("not_found");
    if (!(await canManageCourse(u, rows[0].courseId))) return fail("forbidden");
    await db.update(schema.questions).set({ resolved: !rows[0].resolved }).where(eq(schema.questions.id, args.questionId));
    return ok();
  },

  async markNotificationRead(current: User | null, args: { id: string }): Promise<Result> {
    const u = requireAuth(current);
    await db.update(schema.notifications).set({ read: true }).where(and(eq(schema.notifications.id, args.id), eq(schema.notifications.userId, u.id)));
    return ok();
  },

  async markAllNotificationsRead(current: User | null): Promise<Result> {
    const u = requireAuth(current);
    await db.update(schema.notifications).set({ read: true }).where(eq(schema.notifications.userId, u.id));
    return ok();
  },

  /* ----------------------------- Quizzes ----------------------------- */

  async createQuiz(current: User | null, args: { courseId: string; title: string }): Promise<Result<{ quizId: string }>> {
    const u = requireAuth(current);
    if (!(await canManageCourse(u, args.courseId))) return fail("forbidden");
    const [row] = await db.insert(schema.quizzes).values({
      courseId: args.courseId,
      title: args.title,
      status: "draft",
    }).returning({ id: schema.quizzes.id });
    return ok({ quizId: row.id });
  },

  async updateQuiz(current: User | null, args: { id: string; patch: Record<string, unknown> }): Promise<Result> {
    const u = requireAuth(current);
    const owner = await requireQuizOwner(u, args.id);
    if (!owner) return fail("not_found");
    const patch = { ...args.patch } as Record<string, unknown>;
    delete patch.id;
    delete patch.courseId;
    delete patch.createdAt;
    for (const k of ["availableFrom", "availableUntil"] as const) {
      if (k in patch) {
        const v = patch[k] as string | null | undefined;
        patch[k] = v ? new Date(v) : null;
      }
    }
    patch.updatedAt = new Date();
    await db.update(schema.quizzes).set(patch).where(eq(schema.quizzes.id, args.id));
    return ok();
  },

  async deleteQuiz(current: User | null, args: { id: string }): Promise<Result> {
    const u = requireAuth(current);
    const owner = await requireQuizOwner(u, args.id);
    if (!owner) return fail("not_found");
    await deleteQuizForId(args.id);
    return ok();
  },

  async duplicateQuiz(current: User | null, args: { id: string }): Promise<Result<{ quizId: string }>> {
    const u = requireAuth(current);
    const owner = await requireQuizOwner(u, args.id);
    if (!owner) return fail("not_found");
    const [src] = await db.select().from(schema.quizzes).where(eq(schema.quizzes.id, args.id)).limit(1);
    if (!src) return fail("not_found");

    const [copy] = await db.insert(schema.quizzes).values({
      courseId: src.courseId,
      title: `${src.title} (copy)`,
      titleAr: src.titleAr ? `${src.titleAr} (نسخة)` : src.titleAr,
      description: src.description,
      descriptionAr: src.descriptionAr,
      timeLimitMin: src.timeLimitMin,
      passingScore: src.passingScore,
      maxAttempts: src.maxAttempts,
      availableFrom: src.availableFrom,
      availableUntil: src.availableUntil,
      shuffleQuestions: src.shuffleQuestions,
      shuffleAnswers: src.shuffleAnswers,
      showAnswersAfterSubmit: src.showAnswersAfterSubmit,
      showExplanationsAfterSubmit: src.showExplanationsAfterSubmit,
      status: "draft",
    }).returning({ id: schema.quizzes.id });

    const questions = await db.select().from(schema.quizQuestions).where(eq(schema.quizQuestions.quizId, args.id));
    for (const q of questions) {
      const [newQ] = await db.insert(schema.quizQuestions).values({
        quizId: copy.id,
        type: q.type,
        text: q.text,
        textAr: q.textAr,
        imageId: q.imageId,
        points: q.points,
        order: q.order,
        explanation: q.explanation,
        explanationAr: q.explanationAr,
      }).returning({ id: schema.quizQuestions.id });
      const choices = await db.select().from(schema.quizChoices).where(eq(schema.quizChoices.questionId, q.id));
      if (choices.length) {
        await db.insert(schema.quizChoices).values(
          choices.map((c) => ({ questionId: newQ.id, text: c.text, textAr: c.textAr, isCorrect: c.isCorrect, order: c.order }))
        );
      }
    }
    return ok({ quizId: copy.id });
  },

  async addQuizQuestion(current: User | null, args: {
    quizId: string;
    input: {
      type: QuizQuestionType; text: string; textAr?: string; imageId?: string | null;
      points?: number; explanation?: string; explanationAr?: string;
      choices: { text: string; textAr?: string; isCorrect: boolean }[];
    };
  }): Promise<Result<{ id: string }>> {
    const u = requireAuth(current);
    const owner = await requireQuizOwner(u, args.quizId);
    if (!owner) return fail("not_found");
    const existing = await db.select({ id: schema.quizQuestions.id }).from(schema.quizQuestions).where(eq(schema.quizQuestions.quizId, args.quizId));
    const [row] = await db.insert(schema.quizQuestions).values({
      quizId: args.quizId,
      type: args.input.type,
      text: args.input.text,
      textAr: args.input.textAr,
      imageId: args.input.imageId ?? null,
      points: args.input.points ?? 1,
      order: existing.length + 1,
      explanation: args.input.explanation,
      explanationAr: args.input.explanationAr,
    }).returning({ id: schema.quizQuestions.id });
    if (args.input.choices?.length) {
      await db.insert(schema.quizChoices).values(
        args.input.choices.map((c, i) => ({ questionId: row.id, text: c.text, textAr: c.textAr, isCorrect: !!c.isCorrect, order: i }))
      );
    }
    return ok({ id: row.id });
  },

  async updateQuizQuestion(current: User | null, args: {
    id: string;
    input: {
      type: QuizQuestionType; text: string; textAr?: string; imageId?: string | null;
      points?: number; explanation?: string; explanationAr?: string;
      choices: { text: string; textAr?: string; isCorrect: boolean }[];
    };
  }): Promise<Result> {
    const u = requireAuth(current);
    const rows = await db.select({ quizId: schema.quizQuestions.quizId }).from(schema.quizQuestions).where(eq(schema.quizQuestions.id, args.id)).limit(1);
    if (!rows.length) return fail("not_found");
    const owner = await requireQuizOwner(u, rows[0].quizId);
    if (!owner) return fail("not_found");
    await db.update(schema.quizQuestions).set({
      type: args.input.type,
      text: args.input.text,
      textAr: args.input.textAr,
      imageId: args.input.imageId ?? null,
      points: args.input.points ?? 1,
      explanation: args.input.explanation,
      explanationAr: args.input.explanationAr,
    }).where(eq(schema.quizQuestions.id, args.id));
    await db.delete(schema.quizChoices).where(eq(schema.quizChoices.questionId, args.id));
    if (args.input.choices?.length) {
      await db.insert(schema.quizChoices).values(
        args.input.choices.map((c, i) => ({ questionId: args.id, text: c.text, textAr: c.textAr, isCorrect: !!c.isCorrect, order: i }))
      );
    }
    return ok();
  },

  async removeQuizQuestion(current: User | null, args: { id: string }): Promise<Result> {
    const u = requireAuth(current);
    const rows = await db.select({ quizId: schema.quizQuestions.quizId }).from(schema.quizQuestions).where(eq(schema.quizQuestions.id, args.id)).limit(1);
    if (!rows.length) return fail("not_found");
    const owner = await requireQuizOwner(u, rows[0].quizId);
    if (!owner) return fail("not_found");
    await db.delete(schema.quizChoices).where(eq(schema.quizChoices.questionId, args.id));
    await db.delete(schema.quizQuestions).where(eq(schema.quizQuestions.id, args.id));
    return ok();
  },

  async reorderQuizQuestions(current: User | null, args: { quizId: string; orderedIds: string[] }): Promise<Result> {
    const u = requireAuth(current);
    const owner = await requireQuizOwner(u, args.quizId);
    if (!owner) return fail("not_found");
    for (let i = 0; i < args.orderedIds.length; i++) {
      await db.update(schema.quizQuestions)
        .set({ order: i + 1 })
        .where(and(eq(schema.quizQuestions.id, args.orderedIds[i]), eq(schema.quizQuestions.quizId, args.quizId)));
    }
    return ok();
  },

  /** Student starts (or resumes) an attempt. Returns the question set with
   *  `isCorrect`/explanation stripped — the only other place that data
   *  reaches the client is the graded result from `submitQuizAttempt`. */
  async startQuizAttempt(current: User | null, args: { quizId: string }): Promise<Result<{ attempt: unknown; questions: unknown[] }>> {
    const u = requireAuth(current);
    const [quiz] = await db.select().from(schema.quizzes).where(eq(schema.quizzes.id, args.quizId)).limit(1);
    if (!quiz) return fail("not_found");
    if (quiz.status !== "published") return fail("quiz_not_published");

    const enrollRows = await db.select({ status: schema.enrollments.status }).from(schema.enrollments)
      .where(and(eq(schema.enrollments.userId, u.id), eq(schema.enrollments.courseId, quiz.courseId))).limit(1);
    if (!enrollRows.length || enrollRows[0].status !== "active") return fail("not_enrolled");

    const now = new Date();
    if (quiz.availableFrom && now < quiz.availableFrom) return fail("quiz_not_available_yet");
    if (quiz.availableUntil && now > quiz.availableUntil) return fail("quiz_expired");

    const priorAttempts = await db.select().from(schema.quizAttempts)
      .where(and(eq(schema.quizAttempts.quizId, args.quizId), eq(schema.quizAttempts.userId, u.id)));

    let attemptRow = priorAttempts.find((a) => !a.submittedAt);
    if (!attemptRow) {
      const submittedCount = priorAttempts.filter((a) => a.submittedAt).length;
      if (quiz.maxAttempts != null && submittedCount >= quiz.maxAttempts) return fail("no_attempts_left");

      const questionRows = await db.select({ points: schema.quizQuestions.points }).from(schema.quizQuestions).where(eq(schema.quizQuestions.quizId, args.quizId));
      const maxScore = questionRows.reduce((s, q) => s + q.points, 0);

      const [row] = await db.insert(schema.quizAttempts).values({
        quizId: args.quizId,
        userId: u.id,
        attemptNumber: submittedCount + 1,
        maxScore,
      }).returning();
      attemptRow = row;
    }

    const questionRows = await db.select().from(schema.quizQuestions).where(eq(schema.quizQuestions.quizId, args.quizId));
    const choiceRows = questionRows.length
      ? await db.select().from(schema.quizChoices).where(inArray(schema.quizChoices.questionId, questionRows.map((q) => q.id)))
      : [];

    let orderedQuestions = [...questionRows].sort((a, b) => a.order - b.order);
    if (quiz.shuffleQuestions) orderedQuestions = shuffle(orderedQuestions);

    const questions = orderedQuestions.map((q) => {
      const mapped = mapQuizQuestion(q, choiceRows, /* redact */ true);
      if (quiz.shuffleAnswers) mapped.choices = shuffle(mapped.choices);
      return mapped;
    });

    return ok({ attempt: mapQuizAttempt(attemptRow), questions });
  },

  /** Grades server-side — never trusts a client-supplied score. Returns the
   *  full graded result (correct answers + explanations) for this attempt. */
  async submitQuizAttempt(current: User | null, args: {
    attemptId: string;
    answers: { questionId: string; selectedChoiceIds: string[] }[];
  }): Promise<Result<{ attempt: unknown; answers: unknown[]; questions: unknown[] }>> {
    const u = requireAuth(current);
    const [attempt] = await db.select().from(schema.quizAttempts).where(eq(schema.quizAttempts.id, args.attemptId)).limit(1);
    if (!attempt) return fail("not_found");
    if (attempt.userId !== u.id) return fail("forbidden");
    if (attempt.submittedAt) return fail("already_submitted");

    const questionRows = await db.select().from(schema.quizQuestions).where(eq(schema.quizQuestions.quizId, attempt.quizId));
    const choiceRows = questionRows.length
      ? await db.select().from(schema.quizChoices).where(inArray(schema.quizChoices.questionId, questionRows.map((q) => q.id)))
      : [];

    const answerByQuestion = new Map((args.answers ?? []).map((a) => [a.questionId, a.selectedChoiceIds ?? []]));

    let totalScore = 0;
    const answerRows = questionRows.map((q) => {
      const correctIds = new Set(choiceRows.filter((c) => c.questionId === q.id && c.isCorrect).map((c) => c.id));
      const selected = answerByQuestion.get(q.id) ?? [];
      const selectedSet = new Set(selected);
      const isCorrect = selectedSet.size === correctIds.size && [...correctIds].every((id) => selectedSet.has(id));
      const pointsEarned = isCorrect ? q.points : 0;
      totalScore += pointsEarned;
      return { attemptId: attempt.id, questionId: q.id, selectedChoiceIds: selected, isCorrect, pointsEarned };
    });

    const insertedAnswers = answerRows.length ? await db.insert(schema.quizAnswers).values(answerRows).returning() : [];

    const maxScore = attempt.maxScore || questionRows.reduce((s, q) => s + q.points, 0);
    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    const [quizRow] = await db.select({ passingScore: schema.quizzes.passingScore }).from(schema.quizzes).where(eq(schema.quizzes.id, attempt.quizId)).limit(1);
    const passed = percentage >= (quizRow?.passingScore ?? 60);
    const timeSpentSec = Math.max(0, Math.round((Date.now() - attempt.startedAt.getTime()) / 1000));

    const [updated] = await db.update(schema.quizAttempts).set({
      submittedAt: new Date(),
      score: totalScore,
      maxScore,
      percentage,
      passed,
      timeSpentSec,
    }).where(eq(schema.quizAttempts.id, attempt.id)).returning();

    const questions = [...questionRows]
      .sort((a, b) => a.order - b.order)
      .map((q) => mapQuizQuestion(q, choiceRows, /* redact */ false));

    return ok({
      attempt: mapQuizAttempt(updated),
      answers: insertedAnswers.map(mapQuizAnswer),
      questions,
    });
  },

  /** Re-fetches the graded review for a past *submitted* attempt (the owning
   *  student, or the quiz's admin/owning teacher). Lets a student revisit an
   *  old attempt's review, not just the instant they submitted it. */
  async getQuizAttemptReview(current: User | null, args: { attemptId: string }): Promise<Result<{ attempt: unknown; answers: unknown[]; questions: unknown[] }>> {
    const u = requireAuth(current);
    const [attempt] = await db.select().from(schema.quizAttempts).where(eq(schema.quizAttempts.id, args.attemptId)).limit(1);
    if (!attempt) return fail("not_found");
    if (!attempt.submittedAt) return fail("not_submitted");

    const isOwner = attempt.userId === u.id;
    if (!isOwner) {
      const [quiz] = await db.select({ courseId: schema.quizzes.courseId }).from(schema.quizzes).where(eq(schema.quizzes.id, attempt.quizId)).limit(1);
      if (!quiz || !(await canManageCourse(u, quiz.courseId))) return fail("forbidden");
    }

    const questionRows = await db.select().from(schema.quizQuestions).where(eq(schema.quizQuestions.quizId, attempt.quizId));
    const choiceRows = questionRows.length
      ? await db.select().from(schema.quizChoices).where(inArray(schema.quizChoices.questionId, questionRows.map((q) => q.id)))
      : [];
    const answerRows = await db.select().from(schema.quizAnswers).where(eq(schema.quizAnswers.attemptId, attempt.id));

    const questions = [...questionRows].sort((a, b) => a.order - b.order).map((q) => mapQuizQuestion(q, choiceRows, false));

    return ok({
      attempt: mapQuizAttempt(attempt),
      answers: answerRows.map(mapQuizAnswer),
      questions,
    });
  },
} as const;

export type MutationName = keyof typeof mutations;

export async function runMutation(name: string, current: User | null, args: Record<string, unknown>): Promise<Result> {
  const fn = (mutations as unknown as Record<string, ((c: User | null, a: Record<string, unknown>) => Promise<Result>) | undefined>)[name];
  if (!fn) return fail("unknown_method");
  try {
    return await fn(current, args ?? {});
  } catch (err) {
    if (err instanceof AuthError) return fail(err.message);
    console.error(`[rpc:${name}]`, err);
    return fail("server_error");
  }
}
