import React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, AlertTriangle, Info, RefreshCw } from "lucide-react";
import { Button } from "./Button";

interface AlertProps {
  variant?: "error" | "warning" | "success" | "info";
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function Alert({ variant = "info", title, message, onRetry, className }: AlertProps) {
  const configs = {
    error: {
      border: "border-red-200 bg-red-50 text-red-900",
      icon: <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />,
    },
    warning: {
      border: "border-amber-200 bg-amber-50 text-amber-900",
      icon: <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />,
    },
    success: {
      border: "border-emerald-200 bg-emerald-50 text-emerald-900",
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />,
    },
    info: {
      border: "border-blue-200 bg-blue-50 text-blue-900",
      icon: <Info className="h-5 w-5 text-blue-600 shrink-0" />,
    },
  };

  const { border, icon } = configs[variant];

  return (
    <div className={cn("flex items-start gap-3 p-4 rounded-xl border text-sm", border, className)}>
      {icon}
      <div className="flex-1">
        {title && <h5 className="font-semibold text-slate-900 mb-0.5">{title}</h5>}
        <p className="text-slate-700 leading-relaxed">{message}</p>
      </div>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="shrink-0 bg-white hover:bg-slate-50 text-xs border-slate-300"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1" />
          Retry
        </Button>
      )}
    </div>
  );
}
