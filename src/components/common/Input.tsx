"use client";

import React, { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  prefixSymbol?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, helperText, error, prefixSymbol, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-bold text-[#0e0c1d]">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {prefixSymbol && (
            <span className="absolute left-3 text-sm font-bold font-mono text-[#6a6880] select-none pointer-events-none">
              {prefixSymbol}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full bg-[#faf9f7] border border-black/15 rounded-xl py-2.5 px-3 text-xs font-semibold text-[#0e0c1d] placeholder:text-[#94a3b8]",
              "transition-colors duration-150 focus:outline-none focus:border-[#5a45ff] focus:ring-1 focus:ring-[#5a45ff]/30",
              prefixSymbol && "pl-8",
              error && "border-red-500/80 focus:border-red-500 focus:ring-red-500/30",
              className
            )}
            {...props}
          />
        </div>
        {error ? (
          <p className="text-xs text-red-600 font-bold">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-[#6a6880]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, helperText, error, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-bold text-[#0e0c1d]">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            "w-full bg-[#faf9f7] border border-black/15 rounded-xl p-3 text-xs font-semibold text-[#0e0c1d] placeholder:text-[#94a3b8]",
            "transition-colors duration-150 focus:outline-none focus:border-[#5a45ff] focus:ring-1 focus:ring-[#5a45ff]/30 resize-y min-h-[90px]",
            error && "border-red-500/80 focus:border-red-500 focus:ring-red-500/30",
            className
          )}
          {...props}
        />
        {error ? (
          <p className="text-xs text-red-600 font-bold">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-[#6a6880]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";