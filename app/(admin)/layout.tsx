import { AuthGuard } from "@/components/auth/auth-guard";

export default function AdminGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard requireRole="admin">{children}</AuthGuard>;
}
