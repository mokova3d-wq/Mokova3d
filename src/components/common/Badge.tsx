import React, { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "quote" | "haggle" | "verified" | "neutral" | "warning";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "neutral",
  size = "md",
  children,
  ...props
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center font-medium uppercase tracking-wider rounded-full select-none";

  const sizeStyles = {
    sm: "text-[10px] px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
  };

  const variantStyles = {
    quote: "bg-sky-950/80 text-sky-400 border border-sky-800/60",
    haggle: "bg-amber-950/80 text-amber-400 border border-amber-800/60",
    verified: "bg-emerald-950/80 text-emerald-400 border border-emerald-800/60",
    neutral: "bg-slate-800/80 text-slate-300 border border-slate-700/60",
    warning: "bg-orange-950/80 text-orange-400 border border-orange-800/60",
  };

  return (
    <span
      className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
}
