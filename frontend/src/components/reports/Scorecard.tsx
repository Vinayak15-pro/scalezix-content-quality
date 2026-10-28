import React, { useState } from "react";
import { ReviewSummary } from "@/types/api";
import { Badge } from "@/components/ui/Badge";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Check,
  Copy,
  Info,
  TrendingUp,
  FileCheck2
} from "lucide-react";

interface ScorecardProps {
  summary: ReviewSummary;
  modelUsed?: string;
}

export function Scorecard({ summary, modelUsed }: ScorecardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopySummary = () => {
    navigator.clipboard.writeText(summary.executive_summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (score >= 60) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-2">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileCheck2 className="h-5 w-5 text-brand-600" />
            Audit Executive Scorecard
          </h2>
          <p className="text-xs text-slate-500">Comprehensive synthesis of editorial quality and empirical factuality</p>
        </div>
        {modelUsed && (
          <div className="text-[11px] font-medium text-slate-500 bg-slate-50 border px-2.5 py-1 rounded-md">
            Audited via <span className="text-brand-700 font-semibold">{modelUsed}</span>
          </div>
        )}
      </div>

      {/* Primary Score Meters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Quality Score */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between ${getScoreColor(summary.overall_quality_score)}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider">Quality Score</span>
            <TrendingUp className="h-4 w-4 opacity-70" />
          </div>
          <div className="my-2">
            <span className="text-3xl font-extrabold tracking-tight">{summary.overall_quality_score}</span>
            <span className="text-xs opacity-75"> / 100</span>
          </div>
          <div className="text-[11px] opacity-90">
            {summary.overall_quality_score >= 80 ? "Editorial Polish: Excellent" : summary.overall_quality_score >= 60 ? "Editorial Polish: Moderate Revisions Needed" : "Major Restructuring Required"}
          </div>
        </div>

        {/* Factuality Score */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between ${getScoreColor(summary.factuality_score)}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider">Factuality Score</span>
            <ShieldCheck className="h-4 w-4 opacity-70" />
          </div>
          <div className="my-2">
            <span className="text-3xl font-extrabold tracking-tight">{summary.factuality_score}</span>
            <span className="text-xs opacity-75"> / 100</span>
          </div>
          <div className="text-[11px] opacity-90">
            {summary.contradicted_claims_count > 0 ? "Contains Conflicting Claims" : summary.unverified_claims_count > 0 ? "Contains Unverified Claims" : "Fully Backed by Evidence"}
          </div>
        </div>

        {/* Priority Breakdown Card */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Findings Priority</span>
          <div className="flex items-center gap-2 my-2">
            <span className="text-2xl font-bold text-slate-900">{summary.total_findings}</span>
            <span className="text-xs text-slate-500">total issues</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant="high" className="text-[10px] px-2">
              {summary.high_priority_count} High
            </Badge>
            <Badge variant="medium" className="text-[10px] px-2">
              {summary.medium_priority_count} Med
            </Badge>
            <Badge variant="low" className="text-[10px] px-2">
              {summary.low_priority_count} Low
            </Badge>
          </div>
        </div>

        {/* Evidence Verification Status Card */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Evidence Claims</span>
          <div className="flex items-center gap-2 my-2">
            <span className="text-2xl font-bold text-slate-900">
              {summary.supported_claims_count + summary.contradicted_claims_count + summary.unverified_claims_count}
            </span>
            <span className="text-xs text-slate-500">empirical claims</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant="supported" className="text-[10px] px-2">
              {summary.supported_claims_count} Supported
            </Badge>
            {summary.contradicted_claims_count > 0 && (
              <Badge variant="contradicted" className="text-[10px] px-2">
                {summary.contradicted_claims_count} Clashes
              </Badge>
            )}
            <Badge variant="unverified" className="text-[10px] px-2">
              {summary.unverified_claims_count} Unverified
            </Badge>
          </div>
        </div>
      </div>

      {/* Executive Summary Callout */}
      <div className="rounded-xl border border-brand-100 bg-brand-50/40 p-4 relative group">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-900 flex items-center gap-1">
              <Info className="h-3.5 w-3.5 text-brand-600" />
              Executive Audit Synthesis
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopySummary}
            className="text-xs font-medium text-brand-700 hover:text-brand-900 flex items-center gap-1 transition-colors bg-white px-2 py-1 rounded-md border border-brand-200 shadow-2xs"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied!" : "Copy Synthesis"}
          </button>
        </div>
        <p className="text-xs text-slate-700 leading-relaxed font-normal">
          {summary.executive_summary}
        </p>
      </div>
    </div>
  );
}
