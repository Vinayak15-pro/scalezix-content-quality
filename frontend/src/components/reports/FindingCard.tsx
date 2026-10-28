import React, { useState } from "react";
import { Finding } from "@/types/api";
import { Badge } from "@/components/ui/Badge";
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  HelpCircle,
  Cpu,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  BookOpen,
  Copy,
  Check
} from "lucide-react";

interface FindingCardProps {
  finding: Finding;
  index: number;
}

export function FindingCard({ finding, index }: FindingCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = `[${finding.priority.toUpperCase()}] ${finding.category}\nExcerpt: "${finding.excerpt}"\nIssue: ${finding.explanation}\nAction: ${finding.suggested_action}${
      finding.evidence_notes ? `\nEvidence Notes: ${finding.evidence_notes}` : ""
    }`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPriorityBorder = (p: string) => {
    switch (p.toLowerCase()) {
      case "high":
        return "border-l-4 border-l-red-500";
      case "medium":
        return "border-l-4 border-l-amber-500";
      case "low":
        return "border-l-4 border-l-blue-400";
      default:
        return "border-l-4 border-l-slate-300";
    }
  };

  const getEvidenceBadgeVariant = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("supported")) return "supported";
    if (s.includes("contradict")) return "contradicted";
    if (s.includes("unverified")) return "unverified";
    return "default";
  };

  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-4 shadow-2xs transition-all ${getPriorityBorder(finding.priority)}`}>
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono font-semibold text-slate-400">#{index}</span>
          
          {/* Priority */}
          <Badge variant={finding.priority.toLowerCase() as any}>
            {finding.priority}
          </Badge>

          {/* Category */}
          <span className="text-xs font-semibold text-slate-900">
            {finding.category}
          </span>

          {/* Source Badge (Distinguishes Deterministic from Gemini AI) */}
          {finding.source === "Gemini AI Analysis" ? (
            <Badge variant="ai" className="text-[10px] gap-1">
              <Sparkles className="h-2.5 w-2.5" />
              Gemini AI
            </Badge>
          ) : (
            <Badge variant="deterministic" className="text-[10px] gap-1">
              <Cpu className="h-2.5 w-2.5" />
              Deterministic Rule
            </Badge>
          )}

          {/* Evidence Status Badge */}
          {finding.evidence_status !== "Not Applicable" && (
            <Badge variant={getEvidenceBadgeVariant(finding.evidence_status)} className="text-[10px]">
              {finding.evidence_status}
            </Badge>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleCopy}
            className="text-[11px] text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100 transition-colors flex items-center gap-1"
            title="Copy Finding"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
          </button>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[11px] text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100 transition-colors"
          >
            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Content Body */}
      {isExpanded && (
        <div className="space-y-3 mt-2 text-xs">
          {/* Excerpt */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-800 italic">
            <span className="font-semibold not-italic text-slate-500 uppercase text-[10px] block mb-1">
              Exact Excerpt
            </span>
            &ldquo;{finding.excerpt}&rdquo;
          </div>

          {/* Issue Explanation */}
          <div className="text-slate-700 leading-relaxed">
            <span className="font-semibold text-slate-900 mr-1.5">Issue:</span>
            {finding.explanation}
          </div>

          {/* Suggested Fix Action */}
          <div className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-200/70 text-emerald-950 flex items-start gap-2">
            <Lightbulb className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold text-emerald-900 mr-1">Suggested Action:</span>
              {finding.suggested_action}
            </div>
          </div>

          {/* Evidence Notes / Verification Citations */}
          {finding.evidence_notes && (
            <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-200 text-amber-950 flex items-start gap-2">
              <BookOpen className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="leading-relaxed text-[11px]">
                <span className="font-semibold text-amber-900 mr-1">Reference Evidence Grounding:</span>
                {finding.evidence_notes}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
