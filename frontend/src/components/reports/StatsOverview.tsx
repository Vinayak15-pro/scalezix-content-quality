import React from "react";
import { DeterministicStats } from "@/types/api";
import { BookOpen, Clock, FileText, Gauge, Hash, Repeat } from "lucide-react";

interface StatsOverviewProps {
  stats: DeterministicStats;
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Gauge className="h-4 w-4 text-brand-600" />
            Linguistic & Readability Metrics (Deterministic Engine)
          </h3>
          <p className="text-[11px] text-slate-500">Calculated objectively via rule-based statistical analysis</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Word Count */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
          <span className="text-[10px] font-semibold uppercase text-slate-500 flex items-center gap-1">
            <FileText className="h-3 w-3" /> Words
          </span>
          <span className="text-lg font-bold text-slate-900 mt-1">{stats.word_count.toLocaleString()}</span>
          <span className="text-[10px] text-slate-400">{stats.char_count.toLocaleString()} chars</span>
        </div>

        {/* Reading Time */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
          <span className="text-[10px] font-semibold uppercase text-slate-500 flex items-center gap-1">
            <Clock className="h-3 w-3" /> Reading Time
          </span>
          <span className="text-lg font-bold text-slate-900 mt-1">{stats.reading_time_minutes} min</span>
          <span className="text-[10px] text-slate-400">@ 200 WPM</span>
        </div>

        {/* Avg Sentence Length */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
          <span className="text-[10px] font-semibold uppercase text-slate-500 flex items-center gap-1">
            <Hash className="h-3 w-3" /> Sentence Length
          </span>
          <span className="text-lg font-bold text-slate-900 mt-1">{stats.avg_sentence_length_words}</span>
          <span className="text-[10px] text-slate-400">words/sentence ({stats.sentence_count} total)</span>
        </div>

        {/* Flesch Reading Ease */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
          <span className="text-[10px] font-semibold uppercase text-slate-500 flex items-center gap-1">
            <BookOpen className="h-3 w-3" /> Reading Ease
          </span>
          <span className="text-lg font-bold text-slate-900 mt-1">{stats.flesch_reading_ease} / 100</span>
          <span className="text-[10px] text-slate-500 truncate" title={stats.readability_label}>
            {stats.readability_label}
          </span>
        </div>

        {/* Flesch-Kincaid Grade */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
          <span className="text-[10px] font-semibold uppercase text-slate-500 flex items-center gap-1">
            <BookOpen className="h-3 w-3" /> Grade Level
          </span>
          <span className="text-lg font-bold text-slate-900 mt-1">Grade {stats.flesch_kincaid_grade}</span>
          <span className="text-[10px] text-slate-400">Target: Grade 7-10</span>
        </div>

        {/* Keyword Density / Repetitions */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
          <span className="text-[10px] font-semibold uppercase text-slate-500 flex items-center gap-1">
            <Repeat className="h-3 w-3" /> Repetitions
          </span>
          <span className="text-lg font-bold text-slate-900 mt-1">{stats.repetition_findings_count}</span>
          <span className="text-[10px] text-slate-400">
            {stats.target_keyword_occurrences > 0 ? `${stats.target_keyword_density_percent}% KW density` : "Phrases flagged"}
          </span>
        </div>
      </div>
    </div>
  );
}
