"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DraftInputForm } from "@/components/review/DraftInputForm";
import { ReviewProgress } from "@/components/review/ReviewProgress";
import { Scorecard } from "@/components/reports/Scorecard";
import { StatsOverview } from "@/components/reports/StatsOverview";
import { FindingsList } from "@/components/reports/FindingsList";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import {
  ContentReviewRequest,
  ContentReviewResponse
} from "@/types/api";
import { submitContentReview, checkBackendHealth } from "@/lib/apiClient";
import {
  ShieldCheck,
  Repeat,
  Target,
  FileText,
  ArrowLeft,
  Sparkles,
  Layers,
  Cpu
} from "lucide-react";

export default function Home() {
  const [reviewResult, setReviewResult] = useState<ContentReviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastPayload, setLastPayload] = useState<ContentReviewRequest | null>(null);

  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [modelUsed, setModelUsed] = useState<string>("gemini-3.5-flash");

  useEffect(() => {
    checkBackendHealth()
      .then((data) => {
        setIsHealthy(data.status === "ok");
        if (data.model) setModelUsed(data.model);
      })
      .catch(() => {
        setIsHealthy(false);
      });
  }, []);

  const handleReviewSubmit = async (payload: ContentReviewRequest) => {
    setIsLoading(true);
    setErrorMessage(null);
    setLastPayload(payload);

    try {
      const result = await submitContentReview(payload);
      setReviewResult(result);
      if (result.model_used) setModelUsed(result.model_used);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setErrorMessage(
        err.message || "An unexpected error occurred while communicating with the audit service."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (lastPayload) {
      handleReviewSubmit(lastPayload);
    }
  };

  const handleResetToForm = () => {
    setReviewResult(null);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70">
      <Header isHealthy={isHealthy} modelUsed={modelUsed} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Error Alert Banner */}
        {errorMessage && (
          <Alert
            variant="error"
            title="Content Audit Failed"
            message={errorMessage}
            onRetry={lastPayload ? handleRetry : undefined}
          />
        )}

        {/* Warning Notice Banner (e.g. if fallback was triggered) */}
        {reviewResult?.warning_notice && (
          <Alert
            variant="warning"
            title="Notice"
            message={reviewResult.warning_notice}
          />
        )}

        {/* Loading State */}
        {isLoading && <ReviewProgress />}

        {/* Results State */}
        {!isLoading && reviewResult ? (
          <div className="space-y-6">
            {/* Top Navigation & Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetToForm}
                className="self-start text-xs text-slate-700 hover:text-slate-900 border-slate-300"
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                Back to Draft Editor
              </Button>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Audited at {reviewResult.timestamp}</span>
              </div>
            </div>

            {/* Scorecard */}
            <Scorecard summary={reviewResult.summary} modelUsed={reviewResult.model_used} />

            {/* Deterministic Stats */}
            <StatsOverview stats={reviewResult.stats} />

            {/* Findings List with Search and Filtering */}
            <FindingsList review={reviewResult} />
          </div>
        ) : (
          !isLoading && (
            <div className="space-y-8">
              {/* Draft Input Form */}
              <DraftInputForm onSubmit={handleReviewSubmit} isLoading={isLoading} />

              {/* Informational Feature Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2">
                  <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900">Empirical Claim Grounding</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Cross-examines numerical metrics, statistics, and product specs against supplied sources. Claims are objectively classified as Supported, Contradicted, or Unverified.
                  </p>
                </div>

                <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2">
                  <div className="h-8 w-8 rounded-lg bg-cyan-50 text-cyan-700 flex items-center justify-center">
                    <Cpu className="h-4 w-4" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900">Deterministic NLP Engine</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Executes exact rule-based evaluations for repetitive phrases, consecutive duplicate words, weasel wording, sentence length, and keyword stuffing penalties.
                  </p>
                </div>

                <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2">
                  <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900">Editorial & Intent Alignment</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Leverages Google Gemini to verify audience resonance, brand voice constraints, search intent mismatch, and omitted topic coverage.
                  </p>
                </div>
              </div>
            </div>
          )
        )}
      </main>

      <Footer />
    </div>
  );
}
