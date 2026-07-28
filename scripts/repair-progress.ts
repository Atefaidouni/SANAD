import { db, schema } from "../lib/db";
import { eq } from "drizzle-orm";

async function main() {
  const allLessons = await db.select({ id: schema.lessons.id, courseId: schema.lessons.courseId }).from(schema.lessons);
  const lessonIdsByCourse = new Map<string, Set<string>>();
  for (const l of allLessons) {
    if (!lessonIdsByCourse.has(l.courseId)) lessonIdsByCourse.set(l.courseId, new Set());
    lessonIdsByCourse.get(l.courseId)!.add(l.id);
  }

  const enrollments = await db.select().from(schema.enrollments);
  let fixed = 0;
  for (const e of enrollments) {
    const validIds = lessonIdsByCourse.get(e.courseId) ?? new Set<string>();
    const total = validIds.size || 1;
    const completed = (e.completedLessonIds ?? []).filter((id) => validIds.has(id));
    const progress = Math.round((completed.length / total) * 100);
    const changed =
      progress !== e.progressPercent ||
      completed.length !== (e.completedLessonIds ?? []).length;
    if (changed) {
      await db.update(schema.enrollments)
        .set({ completedLessonIds: completed, progressPercent: progress })
        .where(eq(schema.enrollments.id, e.id));
      console.log(`enrollment ${e.id}: ${e.progressPercent}% -> ${progress}% (completed ${(e.completedLessonIds ?? []).length} -> ${completed.length}, total ${total})`);
      fixed++;
    }
  }
  console.log(`Done. Repaired ${fixed} of ${enrollments.length} enrollments.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
