import React, { useState } from "react";
import { ContentReviewRequest } from "@/types/api";
import { SAMPLE_PRESETS } from "@/lib/sampleDrafts";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import {
  FileText,
  Sparkles,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Target,
  BookOpen,
  Send,
  HelpCircle
} from "lucide-react";

interface DraftInputFormProps {
  onSubmit: (data: ContentReviewRequest) => void;
  isLoading: boolean;
}

export function DraftInputForm({ onSubmit, isLoading }: DraftInputFormProps) {
  const [draftText, setDraftText] = useState("");
  const [audience, setAudience] = useState("");
  const [contentGoal, setContentGoal] = useState("");
  const [targetKeyword, setTargetKeyword] = useState("");
  const [searchIntent, setSearchIntent] = useState("");
  const [brandGuidelines, setBrandGuidelines] = useState("");
  const [referenceEvidence, setReferenceEvidence] = useState("");
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const wordCount = draftText.trim() ? draftText.trim().split(/\s+/).length : 0;
  const charCount = draftText.length;
  const isTooShort = charCount > 0 && charCount < 15;
  const isTooLong = charCount > 25000;

  const handleLoadSample = (presetId: string) => {
    const preset = SAMPLE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setDraftText(preset.data.draft_text);
    setAudience(preset.data.audience || "");
    setContentGoal(preset.data.content_goal || "");
    setTargetKeyword(preset.data.target_keyword || "");
    setSearchIntent(preset.data.search_intent || "");
    setBrandGuidelines(preset.data.brand_guidelines || "");
    setReferenceEvidence(preset.data.reference_evidence || "");
    setShowAdvanced(true);
    setValidationError(null);
  };

  const handleReset = () => {
    setDraftText("");
    setAudience("");
    setContentGoal("");
    setTargetKeyword("");
    setSearchIntent("");
    setBrandGuidelines("");
    setReferenceEvidence("");
    setValidationError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftText.trim() || draftText.trim().length < 15) {
      setValidationError("Please enter at least 15 characters of draft content to analyze.");
      return;
    }
    if (draftText.length > 25000) {
      setValidationError("Draft text exceeds maximum allowed limit of 25,000 characters.");
      return;
    }
    setValidationError(null);

    onSubmit({
      draft_text: draftText,
      audience: audience.trim() || undefined,
      content_goal: contentGoal.trim() || undefined,
      target_keyword: targetKeyword.trim() || undefined,
      search_intent: searchIntent.trim() || undefined,
      brand_guidelines: brandGuidelines.trim() || undefined,
      reference_evidence: referenceEvidence.trim() || undefined,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <Card className="border-slate-200/90 shadow-sm overflow-hidden">
      <CardHeader className="bg-slate-50/60 border-b border-slate-100 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="text-xl flex items-center gap-2 text-slate-900">
              <FileText className="h-5 w-5 text-brand-600" />
              Content Review & Factuality Checker
            </CardTitle>
            <CardDescription className="mt-1">
              Paste your article or draft below. Cross-examine claims against supplied evidence and detect editorial flaws.
            </CardDescription>
          </div>

          {/* Sample Preset Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Load Sample:</span>
            <button
              type="button"
              onClick={() => handleLoadSample("cloud-saas")}
              className="text-xs px-2.5 py-1.5 rounded-md font-medium bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition-colors shadow-2xs"
            >
              Enterprise SaaS
            </button>
            <button
              type="button"
              onClick={() => handleLoadSample("fintech-security")}
              className="text-xs px-2.5 py-1.5 rounded-md font-medium bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition-colors shadow-2xs"
            >
              FinTech Brief
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Main Draft Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="draftText" className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Draft Content <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span>{wordCount} words</span>
                <span>•</span>
                <span className={isTooShort ? "text-amber-600 font-medium" : isTooLong ? "text-red-600 font-bold" : ""}>
                  {charCount.toLocaleString()} / 25,000 chars
                </span>
              </div>
            </div>

            <textarea
              id="draftText"
              rows={11}
              value={draftText}
              onChange={(e) => {
                setDraftText(e.target.value);
                if (validationError) setValidationError(null);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Paste draft text here (articles, whitepapers, blog posts, landing page copy, or product guides)..."
              className={`w-full rounded-xl border p-4 text-sm font-normal text-slate-900 leading-relaxed placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all ${
                isTooShort || isTooLong ? "border-amber-400 bg-amber-50/20" : "border-slate-200 bg-white"
              }`}
            />

            {validationError && (
              <p className="text-xs font-medium text-red-600 mt-1 flex items-center gap-1">
                <span>⚠️</span> {validationError}
              </p>
            )}
          </div>

          {/* Collapsible Metadata Accordion */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/40">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-semibold text-slate-700 hover:bg-slate-100/70 transition-colors"
            >
              <span className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-brand-600" />
                Optional Editorial Context & Evidence Grounding
                {(audience || targetKeyword || referenceEvidence) && (
                  <span className="h-2 w-2 rounded-full bg-brand-600" />
                )}
              </span>
              <span className="text-slate-400 flex items-center gap-1 text-xs font-normal">
                {showAdvanced ? "Hide Context" : "Customize Audience, Keywords & Reference Sources"}
                {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </span>
            </button>

            {showAdvanced && (
              <div className="p-4 pt-2 border-t border-slate-200 space-y-4 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Audience */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Target Audience</label>
                    <input
                      type="text"
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                      placeholder="e.g. Enterprise CTOs, Junior Developers, B2B Procurement"
                      className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>

                  {/* Content Goal */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Primary Content Goal</label>
                    <input
                      type="text"
                      value={contentGoal}
                      onChange={(e) => setContentGoal(e.target.value)}
                      placeholder="e.g. Educate technical buyers, drive free trials, SEO authority"
                      className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>

                  {/* Target Keyword */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center justify-between">
                      <span>Target SEO Keyword</span>
                      <span className="text-[10px] text-slate-400">Audits density & overuse</span>
                    </label>
                    <input
                      type="text"
                      value={targetKeyword}
                      onChange={(e) => setTargetKeyword(e.target.value)}
                      placeholder="e.g. enterprise cloud migration"
                      className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>

                  {/* Search Intent */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Search Intent</label>
                    <input
                      type="text"
                      value={searchIntent}
                      onChange={(e) => setSearchIntent(e.target.value)}
                      placeholder="e.g. Informational, Commercial, Transactional"
                      className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Brand Guidelines */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Brand Voice & Editorial Constraints</label>
                  <textarea
                    rows={2}
                    value={brandGuidelines}
                    onChange={(e) => setBrandGuidelines(e.target.value)}
                    placeholder="e.g. Professional, authoritative tone. Avoid buzzwords like 'synergy' or 'game-changing'. Ground claims in metrics."
                    className="w-full text-xs rounded-lg border border-slate-200 p-2.5 text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                {/* Reference Evidence Sources */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center justify-between">
                    <span className="font-semibold text-brand-900 flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5 text-brand-600" />
                      Reference Evidence / Primary Source Citations
                    </span>
                    <span className="text-[10px] text-slate-400">Claims cross-examined against this text</span>
                  </label>
                  <textarea
                    rows={3}
                    value={referenceEvidence}
                    onChange={(e) => setReferenceEvidence(e.target.value)}
                    placeholder="Paste verified benchmark figures, study findings, whitepaper citations, or SLA specs here. The AI will classify claims as Supported, Contradicted, or Unverified."
                    className="w-full text-xs rounded-lg border border-slate-200 p-2.5 text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500 focus:outline-none bg-brand-50/20"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Form Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={isLoading || (!draftText && !audience)}
                className="text-xs text-slate-600"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                Clear
              </Button>
              <span className="text-xs text-slate-400 hidden sm:inline">
                Press <kbd className="px-1.5 py-0.5 rounded-md bg-slate-100 border text-[10px] font-mono">Ctrl+Enter</kbd> to audit
              </span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              disabled={!draftText.trim() || isTooShort || isTooLong}
              className="w-full sm:w-auto px-6 font-semibold shadow-md shadow-brand-600/20"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Run Comprehensive Audit
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
