from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field

class PriorityLevel(str, Enum):
    high = "High"
    medium = "Medium"
    low = "Low"

class CheckSource(str, Enum):
    deterministic = "Deterministic Check"
    ai = "Gemini AI Analysis"

class FindingCategory(str, Enum):
    factuality_and_evidence = "Factuality & Evidence"
    repetition_and_redundancy = "Repetition & Redundancy"
    vague_wording = "Vague & Weasel Wording"
    unclear_sentences = "Unclear & Run-on Sentences"
    inconsistent_tone = "Tone & Brand Inconsistency"
    keyword_overuse = "Keyword Overuse & SEO"
    search_intent_mismatch = "Search Intent & Goal Mismatch"
    missing_sections = "Missing Sections & Gaps"

class EvidenceStatus(str, Enum):
    supported = "Supported by supplied evidence"
    contradicted = "Potentially contradicted"
    unverified = "Unverified"
    not_applicable = "Not Applicable"

class ClaimType(str, Enum):
    statistic = "Statistic / Numerical Claim"
    date = "Date / Timeline Claim"
    product_claim = "Product / Feature Claim"
    metric_or_data = "Performance Metric"
    general_fact = "General Factual Claim"
    not_applicable = "Not Applicable"

class ContentReviewRequest(BaseModel):
    draft_text: str = Field(..., min_length=15, max_length=25000, description="The content draft to evaluate")
    audience: Optional[str] = Field(None, max_length=500, description="Target readership, e.g., 'B2B Enterprise CTOs'")
    content_goal: Optional[str] = Field(None, max_length=500, description="Primary goal, e.g., 'In-depth educational guide to boost conversions'")
    target_keyword: Optional[str] = Field(None, max_length=200, description="Primary SEO target keyword or phrase")
    search_intent: Optional[str] = Field(None, max_length=200, description="User search intent, e.g., 'Informational', 'Commercial', 'Transactional'")
    brand_guidelines: Optional[str] = Field(None, max_length=2000, description="Brand voice, formatting constraints, or disallowed terms")
    reference_evidence: Optional[str] = Field(None, max_length=10000, description="Supplied reference sources, trusted benchmark facts, or citations")

class Finding(BaseModel):
    id: str = Field(..., description="Unique finding ID")
    category: FindingCategory
    priority: PriorityLevel
    source: CheckSource
    excerpt: str = Field(..., description="Exact or closely identified excerpt from the draft")
    explanation: str = Field(..., description="Why this was flagged")
    suggested_action: str = Field(..., description="Actionable recommendation to fix or improve the draft")
    claim_type: ClaimType = ClaimType.not_applicable
    evidence_status: EvidenceStatus = EvidenceStatus.not_applicable
    evidence_notes: Optional[str] = Field(None, description="Matching or conflicting snippet from reference evidence")

class DeterministicStats(BaseModel):
    word_count: int
    char_count: int
    sentence_count: int
    paragraph_count: int
    avg_sentence_length_words: float
    reading_time_minutes: float
    flesch_reading_ease: float
    flesch_kincaid_grade: float
    readability_label: str
    target_keyword_occurrences: int
    target_keyword_density_percent: float
    repetition_findings_count: int

class ReviewSummary(BaseModel):
    overall_quality_score: int = Field(..., ge=0, le=100)
    factuality_score: int = Field(..., ge=0, le=100)
    total_findings: int
    high_priority_count: int
    medium_priority_count: int
    low_priority_count: int
    supported_claims_count: int
    contradicted_claims_count: int
    unverified_claims_count: int
    executive_summary: str

class ContentReviewResponse(BaseModel):
    status: str = "success"
    summary: ReviewSummary
    stats: DeterministicStats
    findings: List[Finding]
    model_used: str
    timestamp: str
    warning_notice: Optional[str] = None
