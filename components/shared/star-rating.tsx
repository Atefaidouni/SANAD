import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  rating,
  showValue = false,
  size = "sm",
  className,
}: {
  rating: number;
  showValue?: boolean;
  size?: "sm" | "md";
  className?: string;
}) {
  const starSize = size === "sm" ? "size-3.5" : "size-4";
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <span className="flex" dir="ltr">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              starSize,
              i < Math.round(rating)
                ? "fill-brand-gold text-brand-gold"
                : "fill-muted text-muted"
            )}
          />
        ))}
      </span>
      {showValue && (
        <span className="text-xs font-semibold text-muted-foreground">
          {rating.toFixed(1)}
        </span>
      )}
    </span>
  );
}
