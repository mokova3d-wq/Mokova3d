import React, { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export function Card({ className, hoverEffect = false, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-slate-900/70 border border-slate-800/80 rounded-xl overflow-hidden backdrop-blur-xs",
        hoverEffect &&
          "transition-all duration-200 hover:border-slate-700 hover:bg-slate-900/90 hover:shadow-lg hover:shadow-black/40",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-5 border-b border-slate-800/60", className)} {...props}>
      {children}
    </div>
  );
}

export function CardBody({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-5", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-5 border-t border-slate-800/60 bg-slate-950/40", className)} {...props}>
      {children}
    </div>
  );
}
