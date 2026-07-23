import { AuthGuard } from "@/components/auth/auth-guard";
import { TeacherGate } from "@/components/teacher/teacher-gate";

export default function TeacherGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requireRole="teacher">
      <TeacherGate>{children}</TeacherGate>
    </AuthGuard>
  );
}
