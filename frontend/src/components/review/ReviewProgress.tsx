import React, { useEffect, useState } from "react";
import { CheckCircle2, CircleDashed, Loader2 } from "lucide-react";

const STAGES = [
  "Parsing draft text & sentence structure...",
  "Running deterministic repetition, weasel word & readability checks...",
  "Querying Google Gemini for statistical & factual claim extraction...",
  "Cross-examining claims against supplied reference evidence...",
  "Auditing tone consistency, search intent & content gaps...",
  "Compiling executive audit scorecard..."
];

export function ReviewProgress() {
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStage((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm max-w-xl mx-auto my-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">Auditing Content Quality & Factuality</h3>
          <p className="text-xs text-slate-500">Combining deterministic NLP with Google Gemini reasoning</p>
        </div>
      </div>

      <div className="space-y-3.5">
        {STAGES.map((stage, idx) => {
          const isDone = idx < currentStage;
          const isCurrent = idx === currentStage;

          return (
            <div key={idx} className="flex items-center gap-3 text-sm transition-all duration-300">
              {isDone ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="h-4 w-4 text-brand-600 animate-spin shrink-0" />
              ) : (
                <CircleDashed className="h-4 w-4 text-slate-300 shrink-0" />
              )}
              <span
                className={`transition-colors ${
                  isDone
                    ? "text-slate-600"
                    : isCurrent
                    ? "text-brand-700 font-medium"
                    : "text-slate-400"
                }`}
              >
                {stage}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
