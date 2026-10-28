export type PriorityLevel = "High" | "Medium" | "Low";

export type CheckSource = "Deterministic Check" | "Gemini AI Analysis";

export type FindingCategory =
  | "Factuality & Evidence"
  | "Repetition & Redundancy"
  | "Vague & Weasel Wording"
  | "Unclear & Run-on Sentences"
  | "Tone & Brand Inconsistency"
  | "Keyword Overuse & SEO"
  | "Search Intent & Goal Mismatch"
  | "Missing Sections & Gaps";

export type EvidenceStatus =
  | "Supported by supplied evidence"
  | "Potentially contradicted"
  | "Unverified"
  | "Not Applicable";

export type ClaimType =
  | "Statistic / Numerical Claim"
  | "Date / Timeline Claim"
  | "Product / Feature Claim"
  | "Performance Metric"
  | "General Factual Claim"
  | "Not Applicable";

export interface Finding {
  id: string;
  category: FindingCategory;
  priority: PriorityLevel;
  source: CheckSource;
  excerpt: string;
  explanation: string;
  suggested_action: string;
  claim_type: ClaimType;
  evidence_status: EvidenceStatus;
  evidence_notes?: string | null;
}

export interface DeterministicStats {
  word_count: int;
  char_count: int;
  sentence_count: int;
  paragraph_count: int;
  avg_sentence_length_words: number;
  reading_time_minutes: number;
  flesch_reading_ease: number;
  flesch_kincaid_grade: number;
  readability_label: string;
  target_keyword_occurrences: number;
  target_keyword_density_percent: number;
  repetition_findings_count: number;
}

// In TypeScript, number is used for numbers
export type int = number;

export interface ReviewSummary {
  overall_quality_score: number;
  factuality_score: number;
  total_findings: number;
  high_priority_count: number;
  medium_priority_count: number;
  low_priority_count: number;
  supported_claims_count: number;
  contradicted_claims_count: number;
  unverified_claims_count: number;
  executive_summary: string;
}

export interface ContentReviewResponse {
  status: string;
  summary: ReviewSummary;
  stats: DeterministicStats;
  findings: Finding[];
  model_used: string;
  timestamp: string;
  warning_notice?: string | null;
}

export interface ContentReviewRequest {
  draft_text: string;
  audience?: string;
  content_goal?: string;
  target_keyword?: string;
  search_intent?: string;
  brand_guidelines?: string;
  reference_evidence?: string;
}
