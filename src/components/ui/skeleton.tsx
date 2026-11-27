import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "light" | "admin";
}

/**
 * Komponen Skeleton untuk visual loading state (Putih Modern Minimalis).
 */
export function Skeleton({
  className,
  variant = "default",
  ...props
}: SkeletonProps) {
  void variant;
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn("animate-pulse rounded-xl bg-zinc-200/70", className)}
      {...props}
    />
  );
}

/**
 * Skeleton teks beberapa baris
 */
export function SkeletonText({
  lines = 3,
  lastLineWidth = "w-3/4",
  variant = "default",
  className,
}: {
  lines?: number;
  lastLineWidth?: string;
  variant?: "default" | "light" | "admin";
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant={variant}
          className={cn("h-4", i === lines - 1 ? lastLineWidth : "w-full")}
        />
      ))}
    </div>
  );
}
