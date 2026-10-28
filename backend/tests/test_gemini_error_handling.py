from unittest.mock import patch, MagicMock
from backend.app.services.gemini_analyzer import (
    analyze_with_gemini,
    extract_json_from_response,
    parse_category,
    parse_priority
)
from backend.app.models.schemas import FindingCategory, PriorityLevel

def test_extract_json_from_raw_and_fenced_markdown():
    # Plain JSON
    raw = '{"findings": [], "executive_summary": "All good"}'
    assert extract_json_from_response(raw)["executive_summary"] == "All good"

    # Markdown fence
    fenced = '```json\n{"findings": [], "executive_summary": "Fenced"}\n```'
    assert extract_json_from_response(fenced)["executive_summary"] == "Fenced"

    # JSON with surrounding prose
    surrounded = 'Here is the audit result:\n{"findings": [], "executive_summary": "Surrounded"}\nHope this helps.'
    assert extract_json_from_response(surrounded)["executive_summary"] == "Surrounded"

def test_parse_category_helpers():
    assert parse_category("Factuality & Evidence") == FindingCategory.factuality_and_evidence
    assert parse_category("tone") == FindingCategory.inconsistent_tone
    assert parse_category("search intent") == FindingCategory.search_intent_mismatch
    assert parse_category("missing sections") == FindingCategory.missing_sections
    assert parse_category("vague wording") == FindingCategory.vague_wording

def test_parse_priority_helpers():
    assert parse_priority("High") == PriorityLevel.high
    assert parse_priority("MEDIUM") == PriorityLevel.medium
    assert parse_priority("low") == PriorityLevel.low
    assert parse_priority("unknown") == PriorityLevel.medium

def test_gemini_missing_api_key():
    findings, summary, model, warning = analyze_with_gemini(
        draft_text="Sample draft text for evaluation.",
        api_key=""
    )
    assert findings == []
    assert "deterministic" in model.lower()
    assert warning is not None

@patch("google.genai.Client")
def test_gemini_api_exception_fallback(mock_client_class):
    # Mock client throwing exception
    mock_instance = MagicMock()
    mock_instance.models.generate_content.side_effect = Exception("Rate limit or connection error")
    mock_client_class.return_value = mock_instance

    findings, summary, model, warning = analyze_with_gemini(
        draft_text="Sample draft text for evaluation.",
        api_key="mock-key-12345"
    )
    assert findings == []
    assert "fallback" in model
    assert warning is not None
