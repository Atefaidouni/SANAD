/**
 * SanadStore — the client-side cache + data-access facade.
 *
 * Reads are served synchronously from an in-memory snapshot (works with
 * React's useSyncExternalStore). The snapshot is hydrated from the server
 * (`/api/bootstrap`) and refreshed after every mutation. Writes go to the
 * backend: auth via `/api/auth/*`, everything else via `/api/rpc`. The server
 * is the source of truth; this class just mirrors a role-scoped view of it.
 */
import { toast } from "sonner";
import type {
  BookOrderRow,
  Course,
  CourseCode,
  CourseWithMeta,
  DeliveryType,
  EnrolledCourse,
  Enrollment,
  Level,
  QuestionThread,
  Quiz,
  QuizAttempt,
  QuizAttemptReview,
  QuizAttemptSet,
  QuizQuestion,
  QuizQuestionInput,
  QuizWithMeta,
  Review,
  Role,
  Session,
  StudentRow,
  User,
} from "@/lib/types";
import { createSeedData, type Database } from "./seed";

export interface Result<T = void> {
  ok: boolean;
  error?: string;
  data?: T;
}

interface ServerPayload {
  snapshot?: Database;
  session?: Session | null;
  result?: Result<unknown>;
  ok?: boolean;
  error?: string;
}

class SanadStore {
  private db: Database = createSeedData();
  private session: Session | null = null;
  private hydrated = false;
  private listeners = new Set<() => void>();
  private snapshotVersion = 0;
  private cachedSnapshot = { v: 0, db: this.db, session: this.session };

  /* ----------------------- external-store plumbing ---------------------- */

  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  };

  getSnapshot = () => {
    if (this.cachedSnapshot.v !== this.snapshotVersion) {
      this.cachedSnapshot = { v: this.snapshotVersion, db: this.db, session: this.session };
    }
    return this.cachedSnapshot;
  };

  /** Stable server snapshot (seed only) to avoid hydration mismatch. */
  private serverSnapshot = { v: -1, db: this.db, session: null as Session | null };
  getServerSnapshot = () => this.serverSnapshot;

  isHydrated = () => this.hydrated;

  private commit() {
    this.snapshotVersion++;
    this.listeners.forEach((l) => l());
  }

  private applyServer(json: ServerPayload) {
    if (json.snapshot) this.db = json.snapshot;
    if ("session" in json) this.session = json.session ?? null;
    this.commit();
  }

  /** Load the current session + role-scoped snapshot from the server. */
  hydrate = async () => {
    try {
      const r = await fetch("/api/bootstrap", { cache: "no-store" });
      const json = (await r.json()) as ServerPayload;
      if (!r.ok || !json.snapshot) {
        // The server couldn't be read (e.g. the database is down) — don't let
        // this silently masquerade as "no courses/users exist yet". Keep
        // whatever we already had in memory and surface the failure instead.
        toast.error("Couldn't reach the server — showing the last known data. Please refresh in a moment.");
        this.session = json.session ?? this.session;
        this.hydrated = true;
        this.commit();
        return;
      }
      this.db = json.snapshot;
      this.session = json.session ?? null;
    } catch {
      toast.error("Couldn't reach the server — showing the last known data. Please refresh in a moment.");
      /* offline/unreachable: keep whatever snapshot we already have so the app still renders */
    }
    this.hydrated = true;
    this.commit();
  };

  /** Re-pull everything from the server. */
  refresh = async () => {
    await this.hydrate();
  };

  /* ----------------------------- server I/O ----------------------------- */

  private async post(url: string, body: unknown): Promise<ServerPayload> {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return (await r.json()) as ServerPayload;
  }

  /** Run a server mutation, apply the returned snapshot, return its result. */
  private async rpc<T = void>(method: string, args: Record<string, unknown>): Promise<Result<T>> {
    try {
      const json = await this.post("/api/rpc", { method, args });
      this.applyServer(json);
      return (json.result ?? { ok: false, error: "server_error" }) as Result<T>;
    } catch {
      return { ok: false, error: "network_error" };
    }
  }

  /** Fire a mutation in the background; surface a toast if it fails. */
  private fire(method: string, args: Record<string, unknown>): Result {
    this.rpc(method, args).then((res) => {
      if (!res.ok) toast.error("Couldn't save your change. Please try again.");
    });
    return { ok: true };
  }

  /* ------------------------------- helpers ------------------------------ */

  getUser(id?: string | null): User | undefined {
    if (!id) return undefined;
    return this.db.users.find((u) => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.db.users.find((u) => u.email === email.trim().toLowerCase());
  }

  /* -------------------------------- auth -------------------------------- */

  getSession(): Session | null {
    return this.session;
  }

  async signUp(input: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role?: Role;
  }): Promise<Result<{ userId?: string }>> {
    try {
      const json = await this.post("/api/auth/signup", input);
      if (json.snapshot) this.applyServer(json);
      if (!json.ok) return { ok: false, error: json.error };
      return { ok: true };
    } catch {
      return { ok: false, error: "network_error" };
    }
  }

  async login(email: string, password: string): Promise<Result<Session>> {
    try {
      const json = await this.post("/api/auth/login", { email, password });
      if (json.snapshot) this.applyServer(json);
      if (!json.ok) return { ok: false, error: json.error ?? "invalid_credentials" };
      return { ok: true, data: this.session! };
    } catch {
      return { ok: false, error: "network_error" };
    }
  }

  async logout(): Promise<void> {
    try {
      const json = await this.post("/api/auth/logout", {});
      this.applyServer(json);
    } catch {
      this.session = null;
      this.commit();
    }
  }

  async resetPassword(email: string, newPassword: string): Promise<Result> {
    try {
      const json = await this.post("/api/auth/reset", { email, newPassword });
      return { ok: !!json.ok, error: json.error };
    } catch {
      return { ok: false, error: "network_error" };
    }
  }

  /* ------------------------------ profile ------------------------------- */

  async updateProfile(_userId: string, patch: Partial<User>): Promise<Result> {
    return this.rpc("updateProfile", { patch });
  }

  async updatePassword(_userId: string, current: string, next: string): Promise<Result> {
    return this.rpc("updatePassword", { current, next });
  }

  /* ------------------------------ courses ------------------------------- */

  getCourses(): Course[] {
    return [...this.db.courses].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  getCourse(id: string): Course | undefined {
    return this.db.courses.find((c) => c.id === id);
  }

  getCourseWithMeta(id: string): CourseWithMeta | undefined {
    const course = this.getCourse(id);
    if (!course) return undefined;
    const lessons = this.db.lessons
      .filter((l) => l.courseId === id)
      .sort((a, b) => a.order - b.order);
    const codes = this.db.courseCodes.filter((c) => c.courseId === id);
    return {
      ...course,
      lessons,
      totalLessons: lessons.length,
      totalCodes: codes.length,
      usedCodes: codes.filter((c) => c.status === "used").length,
      availableCodes: codes.filter((c) => c.status === "available").length,
    };
  }

  async createCourse(input: {
    title: string;
    titleAr?: string;
    subject: string;
    level: Level;
    division?: string;
    price: number;
    teacherName: string;
    teacherEmail?: string;
    zoomUrl?: string;
    thumbnail?: string;
    tags?: string[];
    description?: string;
    isPopular?: boolean;
    isGoldPack?: boolean;
    codeCount?: number;
  }): Promise<Result<{ courseId: string }>> {
    return this.rpc<{ courseId: string }>("createCourse", { input });
  }

  updateCourse(id: string, patch: Partial<Course>): Result {
    return this.fire("updateCourse", { id, patch });
  }

  async deleteCourse(id: string): Promise<Result> {
    return this.rpc("deleteCourse", { id });
  }

  getCoursesByTeacherEmail(email?: string | null): Course[] {
    if (!email) return [];
    const e = email.trim().toLowerCase();
    return this.getCourses().filter((c) => c.teacherEmail === e);
  }

  canManageCourse(userId: string | undefined, courseId: string): boolean {
    const u = this.getUser(userId);
    if (!u) return false;
    if (u.role === "admin") return true;
    const course = this.getCourse(courseId);
    return (
      u.role === "teacher" &&
      u.approved &&
      !!course?.teacherEmail &&
      course.teacherEmail === u.email
    );
  }

  /** Resolve a course from a secret code (book code identifies the course).
   *  Local lookup only works when the snapshot contains the code (admins);
   *  students use `resolveCourseByCode` which asks the server. */
  findCourseByCode(code: string): { course: Course; code: CourseCode } | null {
    const c = this.db.courseCodes.find(
      (x) => x.code.trim().toUpperCase() === code.trim().toUpperCase()
    );
    if (!c) return null;
    const course = this.getCourse(c.courseId);
    if (!course) return null;
    return { course, code: c };
  }

  /** Ask the server which course a code belongs to (does not expose the pool). */
  async resolveCourseByCode(code: string): Promise<{ courseId: string } | null> {
    try {
      const json = (await this.post("/api/resolve-code", { code })) as ServerPayload & {
        courseId?: string;
      };
      return json.ok && json.courseId ? { courseId: json.courseId } : null;
    } catch {
      return null;
    }
  }

  /* ----------------------------- lessons -------------------------------- */

  addLesson(
    courseId: string,
    input: { title: string; titleAr?: string; videoUrl?: string; durationMin: number }
  ): Result {
    return this.fire("addLesson", { courseId, input });
  }

  removeLesson(lessonId: string): Result {
    return this.fire("removeLesson", { lessonId });
  }

  /* ----------------------------- quizzes -------------------------------- */

  private withQuizMeta(q: Quiz): QuizWithMeta {
    const questions = this.db.quizQuestions.filter((qq) => qq.quizId === q.id);
    const myAttempts = this.session
      ? this.db.quizAttempts.filter((a) => a.quizId === q.id && a.userId === this.session!.user.id)
      : [];
    return {
      ...q,
      questionCount: questions.length,
      totalPoints: questions.reduce((s, x) => s + x.points, 0),
      myAttempts,
    };
  }

  getQuizzes(courseId: string): QuizWithMeta[] {
    return this.db.quizzes
      .filter((q) => q.courseId === courseId)
      .map((q) => this.withQuizMeta(q))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  getQuiz(id: string): QuizWithMeta | undefined {
    const q = this.db.quizzes.find((x) => x.id === id);
    return q ? this.withQuizMeta(q) : undefined;
  }

  /** Full question content (with choices) — only populated in the snapshot
   *  for admin / the owning teacher; empty for students. */
  getQuizQuestions(quizId: string): QuizQuestion[] {
    return this.db.quizQuestions
      .filter((q) => q.quizId === quizId)
      .sort((a, b) => a.order - b.order);
  }

  getQuizAttempts(quizId: string): QuizAttempt[] {
    return this.db.quizAttempts.filter((a) => a.quizId === quizId);
  }

  getQuizAnalytics(quizId: string) {
    const attempts = this.getQuizAttempts(quizId).filter((a) => a.submittedAt);
    const count = attempts.length;
    const avgScore = count ? Math.round(attempts.reduce((s, a) => s + (a.percentage ?? 0), 0) / count) : 0;
    const highScore = count ? Math.max(...attempts.map((a) => a.percentage ?? 0)) : 0;
    const lowScore = count ? Math.min(...attempts.map((a) => a.percentage ?? 0)) : 0;
    const passRate = count ? Math.round((attempts.filter((a) => a.passed).length / count) * 100) : 0;
    return { attemptsCount: count, avgScore, highScore, lowScore, passRate };
  }

  async createQuiz(courseId: string, title: string): Promise<Result<{ quizId: string }>> {
    return this.rpc<{ quizId: string }>("createQuiz", { courseId, title });
  }

  updateQuiz(id: string, patch: Partial<Quiz>): Result {
    return this.fire("updateQuiz", { id, patch });
  }

  async deleteQuiz(id: string): Promise<Result> {
    return this.rpc("deleteQuiz", { id });
  }

  async duplicateQuiz(id: string): Promise<Result<{ quizId: string }>> {
    return this.rpc<{ quizId: string }>("duplicateQuiz", { id });
  }

  async addQuizQuestion(quizId: string, input: QuizQuestionInput): Promise<Result<{ id: string }>> {
    return this.rpc<{ id: string }>("addQuizQuestion", { quizId, input });
  }

  async updateQuizQuestion(id: string, input: QuizQuestionInput): Promise<Result> {
    return this.rpc("updateQuizQuestion", { id, input });
  }

  async removeQuizQuestion(id: string): Promise<Result> {
    return this.rpc("removeQuizQuestion", { id });
  }

  async reorderQuizQuestions(quizId: string, orderedIds: string[]): Promise<Result> {
    return this.rpc("reorderQuizQuestions", { quizId, orderedIds });
  }

  /** Starts (or resumes) an attempt. The question set arrives sanitized
   *  (no correct answers) — those only ever come back via `submitQuizAttempt`. */
  async startQuizAttempt(quizId: string): Promise<Result<QuizAttemptSet>> {
    const res = await this.rpc<{ attempt: QuizAttempt; questions: QuizQuestion[] }>("startQuizAttempt", { quizId });
    if (!res.ok || !res.data) return res as Result<QuizAttemptSet>;
    const quiz = this.getQuiz(quizId);
    if (!quiz) return { ok: false, error: "not_found" };
    return { ok: true, data: { attempt: res.data.attempt, quiz, questions: res.data.questions } };
  }

  async submitQuizAttempt(
    attemptId: string,
    answers: { questionId: string; selectedChoiceIds: string[] }[]
  ): Promise<Result<QuizAttemptReview>> {
    return this.rpc<QuizAttemptReview>("submitQuizAttempt", { attemptId, answers });
  }

  /** Re-fetches the graded review for a past submitted attempt (not just
   *  the instant it was submitted). */
  async getQuizAttemptReview(attemptId: string): Promise<Result<QuizAttemptReview>> {
    return this.rpc<QuizAttemptReview>("getQuizAttemptReview", { attemptId });
  }

  /* ----------------------------- teachers ------------------------------- */

  getTeachers(): User[] {
    return this.db.users
      .filter((u) => u.role === "teacher")
      .sort((a, b) => Number(a.approved) - Number(b.approved));
  }

  setTeacherApproved(userId: string, approved: boolean): Result {
    return this.fire("setTeacherApproved", { userId, approved });
  }

  deleteTeacher(userId: string): Result {
    return this.fire("deleteTeacher", { userId });
  }

  /* --------------------------- book orders ------------------------------ */

  getBookOrders(): BookOrderRow[] {
    return [...this.db.bookOrders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((order) => ({
        order,
        user: this.getUser(order.userId)!,
        course: this.getCourse(order.courseId)!,
      }))
      .filter((r) => r.user && r.course);
  }

  /* --------------------------- secret codes ----------------------------- */

  getCodes(courseId: string): CourseCode[] {
    return this.db.courseCodes
      .filter((c) => c.courseId === courseId)
      .sort((a, b) => Number(a.label.slice(1)) - Number(b.label.slice(1)));
  }

  addCodes(courseId: string, count: number): Result {
    return this.fire("addCodes", { courseId, count });
  }

  regenerateCodes(courseId: string): Result {
    return this.fire("regenerateCodes", { courseId });
  }

  revokeCode(codeId: string): Result {
    return this.fire("revokeCode", { codeId });
  }

  /* ----------------------------- enroll --------------------------------- */

  getEnrollments(userId: string): EnrolledCourse[] {
    return this.db.enrollments
      .filter((e) => e.userId === userId)
      .map((enrollment) => ({
        enrollment,
        course: this.getCourse(enrollment.courseId)!,
        code: enrollment.courseCodeId
          ? this.db.courseCodes.find((c) => c.id === enrollment.courseCodeId) ?? null
          : null,
      }))
      .filter((e) => e.course);
  }

  getEnrollment(userId: string, courseId: string): Enrollment | undefined {
    return this.db.enrollments.find(
      (e) => e.userId === userId && e.courseId === courseId
    );
  }

  saveCourse(_userId: string, courseId: string): Result {
    return this.fire("saveCourse", { courseId });
  }

  unsaveCourse(_userId: string, courseId: string): Result {
    return this.fire("unsaveCourse", { courseId });
  }

  isSaved(userId: string, courseId: string): boolean {
    return this.getEnrollment(userId, courseId)?.status === "saved";
  }

  /** CORE MECHANIC — redeem a secret code to join a course (server-validated). */
  async joinCourse(input: {
    userId: string;
    courseId: string;
    code: string;
  }): Promise<Result<{ enrollmentId: string }>> {
    return this.rpc<{ enrollmentId: string }>("joinCourse", {
      courseId: input.courseId,
      code: input.code,
    });
  }

  async requestBook(input: {
    userId: string;
    courseId: string;
    fullName: string;
    phone: string;
    wilaya: string;
    baladiya: string;
    deliveryType: DeliveryType;
  }): Promise<Result<{ orderId: string }>> {
    return this.rpc<{ orderId: string }>("requestBook", {
      courseId: input.courseId,
      fullName: input.fullName,
      phone: input.phone,
      wilaya: input.wilaya,
      baladiya: input.baladiya,
      deliveryType: input.deliveryType,
    });
  }

  completeLesson(_userId: string, courseId: string, lessonId: string): Result {
    return this.fire("completeLesson", { courseId, lessonId });
  }

  /* ----------------------- admin: students table ------------------------ */

  getStudentRows(courseId?: string): StudentRow[] {
    return this.db.enrollments
      .filter((e) => e.status === "active" && (!courseId || e.courseId === courseId))
      .map((enrollment) => {
        const user = this.getUser(enrollment.userId)!;
        const course = this.getCourse(enrollment.courseId)!;
        const code = enrollment.courseCodeId
          ? this.db.courseCodes.find((c) => c.id === enrollment.courseCodeId) ?? null
          : null;
        return { user, course, code, enrollment };
      })
      .filter((r) => r.user && r.course)
      .sort((a, b) => new Date(b.enrollment.createdAt).getTime() - new Date(a.enrollment.createdAt).getTime());
  }

  getAdminStats() {
    const activeEnrollments = this.db.enrollments.filter((e) => e.status === "active");
    const used = this.db.courseCodes.filter((c) => c.status === "used");
    const students = new Set(activeEnrollments.map((e) => e.userId)).size;
    const revenue = activeEnrollments.reduce(
      (sum, e) => sum + (this.getCourse(e.courseId)?.price ?? 0),
      0
    );
    return {
      totalCourses: this.db.courses.length,
      totalStudents: students,
      totalCodes: this.db.courseCodes.length,
      usedCodes: used.length,
      revenue,
    };
  }

  /* -------------------------------- forum ------------------------------- */

  getThreads(courseId: string): QuestionThread[] {
    return this.db.questions
      .filter((q) => q.courseId === courseId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((question) => ({
        question,
        author: this.getUser(question.userId)!,
        replies: this.db.replies
          .filter((r) => r.questionId === question.id)
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
          .map((reply) => ({ reply, author: this.getUser(reply.userId)! })),
      }));
  }

  askQuestion(input: { courseId: string; userId: string; title: string; body: string }): Result {
    return this.fire("askQuestion", { courseId: input.courseId, title: input.title, body: input.body });
  }

  replyToQuestion(input: { questionId: string; userId: string; body: string }): Result {
    return this.fire("replyToQuestion", { questionId: input.questionId, body: input.body });
  }

  toggleResolved(questionId: string): Result {
    return this.fire("toggleResolved", { questionId });
  }

  /* --------------------------- notifications ---------------------------- */

  getNotifications(userId: string) {
    return this.db.notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  markNotificationRead(id: string): Result {
    return this.fire("markNotificationRead", { id });
  }

  markAllNotificationsRead(_userId: string): Result {
    return this.fire("markAllNotificationsRead", {});
  }

  /* ------------------------------ reviews ------------------------------- */

  getReviews(): Review[] {
    return this.db.reviews;
  }
}

/** Module-level singleton — shared across the whole client app. */
export const store = new SanadStore();
export type { Database };
