/**
 * Client-side fallback seed — the snapshot the browser shows BEFORE it hydrates
 * from the server (`/api/bootstrap`). It must NOT contain credentials or real
 * user data, since this module is bundled to the client. Only the public
 * marketing testimonials live here; real accounts/courses come from the DB.
 *
 * The real admin accounts are seeded server-side in `lib/db/seed.ts`.
 */
import type {
  BookOrder,
  Course,
  CourseCode,
  Enrollment,
  Lesson,
  Notification,
  Otp,
  Question,
  Reply,
  Review,
  User,
} from "@/lib/types";

export interface Database {
  users: User[];
  courses: Course[];
  lessons: Lesson[];
  courseCodes: CourseCode[];
  enrollments: Enrollment[];
  bookOrders: BookOrder[];
  questions: Question[];
  replies: Reply[];
  notifications: Notification[];
  reviews: Review[];
  otps: Otp[];
}

const createdAt = new Date("2026-01-01T09:00:00.000Z").toISOString();
const iso = (daysAgo: number) =>
  new Date(Date.parse(createdAt) - daysAgo * 86400000).toISOString();

/* ------------------------- Testimonials (marketing) ----------------------
 * Social-proof shown on the landing page. These are site content (not user
 * data), so they stay even in the clean production seed.
 */
export const reviews: Review[] = [
  {
    id: "rev_1",
    authorName: "Meriem B.",
    authorRole: "BAC Sciences — 2025",
    rating: 5,
    body: "Sanad completely changed how I revise. The live sessions and the structured journey kept me on track until the exam.",
    bodyAr: "غيّرت سند طريقتي في المراجعة تمامًا. الحصص المباشرة والمسار المنظّم رافقاني حتى الامتحان.",
    createdAt: iso(15),
  },
  {
    id: "rev_2",
    authorName: "Ramzi K.",
    authorRole: "4 AM — BEM 2025",
    rating: 5,
    body: "The secret code in the book unlocked everything instantly. Lessons are clear and the teachers reply fast in the forum.",
    bodyAr: "الرمز السري في الكتاب فتح لي كل شيء فورًا. الدروس واضحة والأساتذة يردّون بسرعة في المنتدى.",
    createdAt: iso(22),
  },
  {
    id: "rev_3",
    authorName: "Sara H.",
    authorRole: "High School — Languages",
    rating: 5,
    body: "I love that it's fully in Arabic and English. Switching languages and tracking my progress is so smooth.",
    bodyAr: "أحب أنه متوفر بالعربية والإنجليزية. تبديل اللغة ومتابعة تقدّمي سلس جدًا.",
    createdAt: iso(28),
  },
  {
    id: "rev_4",
    authorName: "Yacine T.",
    authorRole: "BAC Math — 2025",
    rating: 5,
    body: "The corrected past papers and weekly revisions made the difference. I walked into the exam feeling ready.",
    bodyAr: "المواضيع السابقة المصحّحة والمراجعات الأسبوعية صنعت الفرق. دخلت الامتحان وأنا واثق وجاهز.",
    createdAt: iso(31),
  },
  {
    id: "rev_5",
    authorName: "Imene D.",
    authorRole: "4 AM — BEM 2025",
    rating: 5,
    body: "Recordings are a lifesaver — I rewatch any lesson I miss. The progress bar keeps me motivated.",
    bodyAr: "التسجيلات أنقذتني — أعيد مشاهدة أي درس يفوتني. شريط التقدّم يبقيني متحمّسة.",
    createdAt: iso(37),
  },
  {
    id: "rev_6",
    authorName: "Bilal Z.",
    authorRole: "High School — Sciences",
    rating: 5,
    body: "Joining was instant with the code from my book, and the live Zoom sessions feel like a real classroom.",
    bodyAr: "الانضمام كان فوريًا بالرمز الموجود في كتابي، وحصص Zoom المباشرة تبدو كقسم حقيقي.",
    createdAt: iso(42),
  },
  {
    id: "rev_7",
    authorName: "Nour E.",
    authorRole: "BAC Letters — 2025",
    rating: 5,
    body: "The weekly schedule kept me disciplined. I finally stopped procrastinating and watched my grades climb.",
    bodyAr: "البرنامج الأسبوعي جعلني منضبطة. توقّفت أخيرًا عن التسويف ورأيت علاماتي ترتفع.",
    createdAt: iso(45),
  },
  {
    id: "rev_8",
    authorName: "Adel M.",
    authorRole: "BAC Math — 2025",
    rating: 5,
    body: "Asking the teacher right under each lesson saved me hours. Answers come back clear and fast.",
    bodyAr: "طرح السؤال على الأستاذ أسفل كل درس وفّر عليّ ساعات. الإجابات تأتي واضحة وسريعة.",
    createdAt: iso(48),
  },
  {
    id: "rev_9",
    authorName: "Lamia B.",
    authorRole: "High School — Languages",
    rating: 5,
    body: "I study from my phone on the bus and my laptop at home — everything syncs perfectly.",
    bodyAr: "أدرس من هاتفي في الحافلة ومن حاسوبي في البيت — كل شيء يتزامن بشكل مثالي.",
    createdAt: iso(52),
  },
  {
    id: "rev_10",
    authorName: "Riad F.",
    authorRole: "BAC Sciences — 2025",
    rating: 5,
    body: "The math explanations finally made limits and integrals click for me.",
    bodyAr: "شروحات الرياضيات جعلت النهايات والتكاملات تتّضح لي أخيرًا.",
    createdAt: iso(57),
  },
  {
    id: "rev_11",
    authorName: "Sofiane A.",
    authorRole: "3 AM — Middle School",
    rating: 5,
    body: "Affordable, organized, and in my language. Exactly what I needed for the BEM.",
    bodyAr: "بسعر مناسب، منظّم، وبلغتي. تمامًا ما احتجته لشهادة التعليم المتوسط.",
    createdAt: iso(63),
  },
  {
    id: "rev_12",
    authorName: "Hiba K.",
    authorRole: "BAC Languages — 2025",
    rating: 5,
    body: "The recorded sessions let me revise at midnight before the exam. A real lifesaver.",
    bodyAr: "التسجيلات سمحت لي بالمراجعة منتصف الليل قبل الامتحان. أنقذتني فعلًا.",
    createdAt: iso(69),
  },
];

export function createSeedData(): Database {
  // Deep clone so the live store never mutates these module constants.
  return structuredClone({
    users: [] as User[],
    courses: [] as Course[],
    lessons: [] as Lesson[],
    courseCodes: [] as CourseCode[],
    enrollments: [] as Enrollment[],
    bookOrders: [] as BookOrder[],
    questions: [] as Question[],
    replies: [] as Reply[],
    notifications: [] as Notification[],
    reviews,
    otps: [] as Otp[],
  });
}
