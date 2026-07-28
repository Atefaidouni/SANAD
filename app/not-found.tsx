import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <Logo size="lg" />
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">404</p>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Page not found · الصفحة غير موجودة
        </h1>
        <p className="mx-auto max-w-md text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has moved.
          <br />
          الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
        </p>
      </div>
      <Button asChild variant="brand" size="lg">
        <Link href="/">Back to home · العودة للرئيسية</Link>
      </Button>
    </div>
  );
}
