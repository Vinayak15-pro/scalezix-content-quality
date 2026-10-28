import React from "react";
import { ShieldAlert, Cpu } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-slate-50/60 mt-16 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Cpu className="h-4 w-4 text-brand-600" />
          <span>Powered by Google Gemini & Deterministic Linguistic Auditing</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ShieldAlert className="h-4 w-4 text-amber-600" />
          <span>Missing evidence flags claims as unverified without assuming falsity.</span>
        </div>

        <div className="text-xs text-slate-400">
          © {new Date().getFullYear()} Scalezix Quality Suite. MIT Licensed.
        </div>
      </div>
    </footer>
  );
}
