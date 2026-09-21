import { cn } from "@/lib/utils";

interface RarityStarsProps {
  count: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Component hiển thị sao phẩm cấp đơn giản, không màu mè
 * 
 * @param count - Số sao (1-5)
 * @param size - Kích thước: sm (12px), md (14px), lg (16px)
 * @param className - Class CSS bổ sung
 */
export function RarityStars({ count, size = "md", className }: RarityStarsProps) {
  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm", 
    lg: "text-base"
  };

  const starColor = count >= 5 ? "text-yellow-500" : count === 4 ? "text-purple-400" : "text-blue-400";

  return (
    <div className={cn("flex items-center gap-0.5", className)} aria-label={`${count} sao`}>
      {Array.from({ length: count }).map((_, i) => (
        <span 
          key={i}
          className={cn(
            sizeClasses[size],
            starColor
          )}
        >
          ★
        </span>
      ))}
    </div>
  );
}