import datetime
from typing import List, Optional
from app.models.schemas import (
    Finding,
    FindingCategory,
    PriorityLevel,
    EvidenceStatus,
    DeterministicStats,
    ReviewSummary,
    ContentReviewResponse
)

def calculate_review_summary(
    deterministic_findings: List[Finding],
    ai_findings: List[Finding],
    stats: DeterministicStats,
    ai_summary_text: Optional[str] = None
) -> ReviewSummary:
    all_findings = deterministic_findings + ai_findings
    
    high_count = sum(1 for f in all_findings if f.priority == PriorityLevel.high)
    med_count = sum(1 for f in all_findings if f.priority == PriorityLevel.medium)
    low_count = sum(1 for f in all_findings if f.priority == PriorityLevel.low)

    supported_count = sum(1 for f in all_findings if f.evidence_status == EvidenceStatus.supported)
    contradicted_count = sum(1 for f in all_findings if f.evidence_status == EvidenceStatus.contradicted)
    unverified_count = sum(1 for f in all_findings if f.evidence_status == EvidenceStatus.unverified)
    total_claims = supported_count + contradicted_count + unverified_count

    # Calculate overall quality score (0 - 100)
    score = 100
    score -= (high_count * 12)
    score -= (med_count * 6)
    score -= (low_count * 2)

    # Mild readability bonus/penalty
    if stats.flesch_reading_ease < 35:
        score -= 5
    elif stats.flesch_reading_ease >= 65:
        score += 2

    overall_score = max(15, min(100, score))

    # Calculate Factuality Reliability Score
    if total_claims == 0:
        # No factual claims identified
        factuality_score = 90
    else:
        # Base factuality on proportion of supported vs contradicted/unverified
        fact_score = 100
        fact_score -= (contradicted_count * 35)
        fact_score -= (unverified_count * 12)
        fact_score += (supported_count * 5)
        factuality_score = max(0, min(100, fact_score))

    # Compose executive summary if AI didn't provide one
    if not ai_summary_text or "temporarily unavailable" in ai_summary_text.lower():
        claim_summary = (
            f"Factual claims: {supported_count} supported, {contradicted_count} contradicted, {unverified_count} unverified."
            if total_claims > 0 else "No strict statistical/timeline claims detected."
        )
        executive_summary = (
            f"Content Review complete ({stats.word_count} words). "
            f"Quality Score: {overall_score}/100, Factuality Score: {factuality_score}/100. "
            f"Identified {len(all_findings)} finding(s) ({high_count} High, {med_count} Medium, {low_count} Low priority). {claim_summary}"
        )
    else:
        executive_summary = ai_summary_text

    return ReviewSummary(
        overall_quality_score=overall_score,
        factuality_score=factuality_score,
        total_findings=len(all_findings),
        high_priority_count=high_count,
        medium_priority_count=med_count,
        low_priority_count=low_count,
        supported_claims_count=supported_count,
        contradicted_claims_count=contradicted_count,
        unverified_claims_count=unverified_count,
        executive_summary=executive_summary
    )

def generate_markdown_report(response: ContentReviewResponse) -> str:
    """Generates an executive-ready Markdown audit report."""
    md = []
    md.append(f"# Scalezix Content Quality & Factuality Audit Report")
    md.append(f"*Generated on: {response.timestamp} | Model: {response.model_used}*\n")
    
    md.append("## Executive Scorecard")
    md.append(f"- **Overall Content Quality Score:** {response.summary.overall_quality_score}/100")
    md.append(f"- **Factuality Reliability Score:** {response.summary.factuality_score}/100")
    md.append(f"- **Total Findings:** {response.summary.total_findings} (High: {response.summary.high_priority_count}, Med: {response.summary.medium_priority_count}, Low: {response.summary.low_priority_count})")
    md.append(f"- **Evidence Verification:** {response.summary.supported_claims_count} Supported | {response.summary.contradicted_claims_count} Potentially Contradicted | {response.summary.unverified_claims_count} Unverified\n")

    md.append("### Executive Summary")
    md.append(f"{response.summary.executive_summary}\n")

    md.append("## Text Statistics & Readability")
    s = response.stats
    md.append(f"| Metric | Value |")
    md.append(f"| :--- | :--- |")
    md.append(f"| **Word Count** | {s.word_count} words |")
    md.append(f"| **Estimated Reading Time** | {s.reading_time_minutes} min |")
    md.append(f"| **Sentence Count** | {s.sentence_count} |")
    md.append(f"| **Avg Sentence Length** | {s.avg_sentence_length_words} words |")
    md.append(f"| **Flesch Reading Ease** | {s.flesch_reading_ease} / 100 ({s.readability_label}) |")
    md.append(f"| **Flesch-Kincaid Grade** | Grade {s.flesch_kincaid_grade} |")
    if s.target_keyword_occurrences > 0:
        md.append(f"| **Target Keyword Density** | {s.target_keyword_density_percent}% ({s.target_keyword_occurrences} hits) |")
    md.append("")

    md.append("## Detailed Audit Findings")
    if not response.findings:
        md.append("*No issues detected. Content meets quality and factuality criteria.*\n")
    else:
        for idx, f in enumerate(response.findings, 1):
            md.append(f"### {idx}. [{f.priority.value.upper()}] {f.category.value}")
            md.append(f"- **Source:** {f.source.value}")
            if f.claim_type != "Not Applicable":
                md.append(f"- **Claim Type:** {f.claim_type.value}")
            if f.evidence_status != "Not Applicable":
                md.append(f"- **Evidence Status:** **{f.evidence_status.value}**")
            md.append(f"- **Excerpt:** > \"{f.excerpt}\"")
            md.append(f"- **Issue Explanation:** {f.explanation}")
            md.append(f"- **Recommended Action:** {f.suggested_action}")
            if f.evidence_notes:
                md.append(f"- **Evidence Notes:** *{f.evidence_notes}*")
            md.append("")

    md.append("---\n*Report generated by Scalezix AI Content Quality & Factuality Auditor.*")
    return "\n".join(md)

