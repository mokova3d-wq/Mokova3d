"use client";

import React, { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer";

    const variantStyles = {
      primary:
        "bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold shadow-sm hover:shadow-amber-500/10 active:translate-y-[0.5px]",
      secondary:
        "bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700/80 active:translate-y-[0.5px]",
      outline:
        "border border-slate-700 hover:border-slate-500 text-slate-200 hover:bg-slate-800/40 active:translate-y-[0.5px]",
      ghost:
        "text-slate-300 hover:text-white hover:bg-slate-800/60",
      danger:
        "bg-red-600 hover:bg-red-500 text-white font-medium",
    };

    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 rounded-md gap-1.5",
      md: "text-sm px-4 py-2.5 rounded-lg gap-2",
      lg: "text-base px-6 py-3.5 rounded-lg gap-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
