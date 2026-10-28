import React, { useState, useMemo } from "react";
import { Finding, ContentReviewResponse } from "@/types/api";
import { FindingCard } from "./FindingCard";
import { Button } from "@/components/ui/Button";
import { exportReviewAsJson, exportReviewAsMarkdown } from "@/lib/exportUtils";
import {
  Search,
  Filter,
  Download,
  FileCode,
  FileText,
  SlidersHorizontal,
  XCircle,
  Check
} from "lucide-react";

interface FindingsListProps {
  review: ContentReviewResponse;
}

export function FindingsList({ review }: FindingsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [sourceFilter, setSourceFilter] = useState<string>("All");
  const [evidenceFilter, setEvidenceFilter] = useState<string>("All");

  const [copiedMd, setCopiedMd] = useState(false);

  // Extract unique categories present in review findings
  const availableCategories = useMemo(() => {
    const cats = new Set(review.findings.map((f) => f.category));
    return Array.from(cats);
  }, [review.findings]);

  // Filter findings based on active criteria
  const filteredFindings = useMemo(() => {
    return review.findings.filter((f) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          f.excerpt.toLowerCase().includes(q) ||
          f.explanation.toLowerCase().includes(q) ||
          f.suggested_action.toLowerCase().includes(q) ||
          f.category.toLowerCase().includes(q) ||
          (f.evidence_notes && f.evidence_notes.toLowerCase().includes(q));
        if (!matchesQuery) return false;
      }

      // Priority Filter
      if (priorityFilter !== "All" && f.priority.toLowerCase() !== priorityFilter.toLowerCase()) {
        return false;
      }

      // Category Filter
      if (categoryFilter !== "All" && f.category !== categoryFilter) {
        return false;
      }

      // Source Filter
      if (sourceFilter === "ai" && f.source !== "Gemini AI Analysis") return false;
      if (sourceFilter === "det" && f.source !== "Deterministic Check") return false;

      // Evidence Status Filter
      if (evidenceFilter !== "All") {
        if (evidenceFilter === "supported" && !f.evidence_status.toLowerCase().includes("supported")) return false;
        if (evidenceFilter === "contradicted" && !f.evidence_status.toLowerCase().includes("contradict")) return false;
        if (evidenceFilter === "unverified" && !f.evidence_status.toLowerCase().includes("unverified")) return false;
      }

      return true;
    });
  }, [review.findings, searchQuery, priorityFilter, categoryFilter, sourceFilter, evidenceFilter]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setPriorityFilter("All");
    setCategoryFilter("All");
    setSourceFilter("All");
    setEvidenceFilter("All");
  };

  const isFiltering =
    searchQuery.trim() !== "" ||
    priorityFilter !== "All" ||
    categoryFilter !== "All" ||
    sourceFilter !== "All" ||
    evidenceFilter !== "All";

  return (
    <div className="space-y-4">
      {/* Controls Bar & Export Buttons */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Filter className="h-4 w-4 text-brand-600" />
              Detailed Audit Findings ({filteredFindings.length} of {review.findings.length})
            </h3>
            <p className="text-[11px] text-slate-500">
              Filter by priority, claim verification, or source engine
            </p>
          </div>

          {/* Export Buttons */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => exportReviewAsMarkdown(review)}
              className="text-xs h-8 gap-1.5"
            >
              <FileText className="h-3.5 w-3.5 text-brand-600" />
              Export .MD
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => exportReviewAsJson(review)}
              className="text-xs h-8 gap-1.5"
            >
              <FileCode className="h-3.5 w-3.5 text-purple-600" />
              Export .JSON
            </Button>
          </div>
        </div>

        {/* Search & Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 pt-1">
          {/* Live Search Input */}
          <div className="relative md:col-span-2">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search excerpt, explanation, or fix..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Priority Select */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full py-1.5 px-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="All">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>

          {/* Source Select */}
          <div>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full py-1.5 px-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="All">All Engines</option>
              <option value="ai">Gemini AI Only</option>
              <option value="det">Deterministic Rules</option>
            </select>
          </div>

          {/* Evidence Status Select */}
          <div>
            <select
              value={evidenceFilter}
              onChange={(e) => setEvidenceFilter(e.target.value)}
              className="w-full py-1.5 px-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="All">All Evidence States</option>
              <option value="supported">Supported Claims</option>
              <option value="contradicted">Contradicted Claims</option>
              <option value="unverified">Unverified Claims</option>
            </select>
          </div>
        </div>

        {/* Active Filter Reset Pill */}
        {isFiltering && (
          <div className="flex items-center justify-between text-xs pt-1 text-slate-500 border-t border-slate-100">
            <span>Showing {filteredFindings.length} matched finding(s)</span>
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-brand-600 hover:text-brand-800 font-medium flex items-center gap-1"
            >
              <XCircle className="h-3.5 w-3.5" />
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Findings Feed */}
      {filteredFindings.length > 0 ? (
        <div className="space-y-3">
          {filteredFindings.map((finding, idx) => (
            <FindingCard key={finding.id || idx} finding={finding} index={idx + 1} />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 bg-white">
          <p className="text-sm font-semibold text-slate-800">No findings matched your filter criteria.</p>
          <p className="text-xs text-slate-500 mt-1">Try clearing your search query or selecting &lsquo;All Priorities&rsquo;.</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetFilters}
            className="mt-4 text-xs"
          >
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );
}
