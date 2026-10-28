import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "high" | "medium" | "low" | "supported" | "contradicted" | "unverified" | "ai" | "deterministic" | "outline";
}

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  const variantStyles = {
    default: "bg-slate-100 text-slate-800 border-slate-200",
    high: "bg-red-50 text-red-700 border-red-200 font-semibold",
    medium: "bg-amber-50 text-amber-700 border-amber-200 font-medium",
    low: "bg-blue-50 text-blue-700 border-blue-200",
    supported: "bg-emerald-50 text-emerald-700 border-emerald-200 font-medium",
    contradicted: "bg-rose-50 text-rose-700 border-rose-300 font-semibold",
    unverified: "bg-amber-50 text-amber-800 border-amber-300 font-medium",
    ai: "bg-purple-50 text-purple-700 border-purple-200 font-medium",
    deterministic: "bg-cyan-50 text-cyan-800 border-cyan-200 font-medium",
    outline: "bg-transparent text-slate-700 border-slate-300",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border tracking-tight transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
