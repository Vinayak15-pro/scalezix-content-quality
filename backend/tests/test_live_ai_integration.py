import os
import pytest
from backend.app.core.config import settings
from backend.app.services.gemini_analyzer import analyze_with_gemini

@pytest.mark.skipif(
    not settings.GEMINI_API_KEY or os.environ.get("RUN_LIVE_AI_TESTS") != "true",
    reason="Live AI integration test skipped unless RUN_LIVE_AI_TESTS=true and GEMINI_API_KEY is present."
)
def test_live_gemini_integration():
    draft = (
        "In Q3 2024, our cloud infrastructure maintained 99.999% uptime according to internal telemetry. "
        "Global cyberattacks grew by 320% in 2024. Our company was founded in 1995 in Seattle."
    )
    evidence = (
        "Internal Telemetry Report: Q3 2024 uptime was exactly 99.999%. "
        "Cybersecurity Alliance 2024 Report: Worldwide cyberattacks surged 38% in 2024."
    )
    findings, summary, model, warning = analyze_with_gemini(
        draft_text=draft,
        reference_evidence=evidence,
        audience="IT Security Directors",
        content_goal="Establish authority",
        api_key=settings.GEMINI_API_KEY,
        model_name=settings.GEMINI_MODEL
    )
    assert len(findings) > 0
    assert model in ["gemini-3.5-flash", "gemini-3.8-flash"]
    # Check that at least one finding has evidence status classified
    statuses = [f.evidence_status.value for f in findings]
    assert any("evidence" in s.lower() or "contradict" in s.lower() or "unverified" in s.lower() for s in statuses)
