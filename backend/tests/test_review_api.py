from unittest.mock import patch
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.models.schemas import (
    Finding,
    FindingCategory,
    PriorityLevel,
    CheckSource,
    EvidenceStatus,
    ClaimType
)

client = TestClient(app)

def test_review_validation_too_short():
    response = client.post("/api/content/review", json={"draft_text": "Too short"})
    assert response.status_code == 422 or response.status_code == 400

@patch("backend.app.api.routes.analyze_with_gemini")
def test_review_endpoint_success(mock_gemini):
    # Mock Gemini returning 3 structured findings
    mock_ai_findings = [
        Finding(
            id="ai-test-1",
            category=FindingCategory.factuality_and_evidence,
            priority=PriorityLevel.high,
            source=CheckSource.ai,
            excerpt="Global SaaS spending reached $850B in 2024.",
            explanation="Claim directly contradicts supplied benchmark showing $240B in 2024.",
            suggested_action="Correct the figure to $240B as verified by Gartner report.",
            claim_type=ClaimType.statistic,
            evidence_status=EvidenceStatus.contradicted,
            evidence_notes="Supplied reference: Gartner states 2024 worldwide SaaS spending was $247.2B."
        ),
        Finding(
            id="ai-test-2",
            category=FindingCategory.factuality_and_evidence,
            priority=PriorityLevel.low,
            source=CheckSource.ai,
            excerpt="99.99% uptime SLA guaranteed under enterprise tier.",
            explanation="Claim matches SLA specification in supplied reference documents.",
            suggested_action="No change needed; accurately verified.",
            claim_type=ClaimType.product_claim,
            evidence_status=EvidenceStatus.supported,
            evidence_notes="Supplied reference: Section 4.1 guarantees 99.99% SLA."
        ),
        Finding(
            id="ai-test-3",
            category=FindingCategory.factuality_and_evidence,
            priority=PriorityLevel.medium,
            source=CheckSource.ai,
            excerpt="Customers experience a 400% ROI within the first 6 weeks.",
            explanation="Unverified marketing claim. Supplied reference does not contain ROI benchmarks.",
            suggested_action="Cite specific case study or qualify as 'up to 400% in select customer trials'.",
            claim_type=ClaimType.statistic,
            evidence_status=EvidenceStatus.unverified,
            evidence_notes=None
        )
    ]
    mock_gemini.return_value = (
        mock_ai_findings,
        "Audit completed. One high-priority contradiction identified.",
        "gemini-3.5-flash",
        None
    )

    payload = {
        "draft_text": (
            "In 2024, our enterprise cloud platform delivers unprecedented reliability. "
            "Global SaaS spending reached $850B in 2024. Furthermore, our enterprise tier "
            "guarantees a 99.99% uptime SLA guaranteed under enterprise tier. "
            "Customers experience a 400% ROI within the first 6 weeks. "
            "Research shows that teams adopting modern DevOps improve deployment velocity significantly."
        ),
        "audience": "Enterprise CTOs",
        "content_goal": "Educate and build trust",
        "target_keyword": "enterprise cloud platform",
        "search_intent": "Informational",
        "brand_guidelines": "Tone must be authoritative and backed by data.",
        "reference_evidence": "Gartner states 2024 worldwide SaaS spending was $247.2B. Section 4.1 guarantees 99.99% SLA."
    }

    response = client.post("/api/content/review", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    
    # Check Summary
    summary = data["summary"]
    assert summary["high_priority_count"] >= 1
    assert summary["supported_claims_count"] == 1
    assert summary["contradicted_claims_count"] == 1
    assert summary["unverified_claims_count"] == 1
    assert summary["overall_quality_score"] > 0
    assert summary["factuality_score"] < 100

    # Check Findings
    findings = data["findings"]
    assert len(findings) >= 3
    # Check that both deterministic and AI findings exist
    sources = {f["source"] for f in findings}
    assert "Gemini AI Analysis" in sources
    assert "Deterministic Check" in sources

    # Test Markdown Export endpoint
    export_resp = client.post("/api/content/export-markdown", json=data)
    assert export_resp.status_code == 200
    assert "# Scalezix Content Quality & Factuality Audit Report" in export_resp.text
    assert "Global SaaS spending reached $850B" in export_resp.text
