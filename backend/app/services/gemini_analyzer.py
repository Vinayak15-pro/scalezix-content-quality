import json
import logging
import re
import uuid
from typing import List, Optional, Tuple
from google import genai
from google.genai import types

try:
    from backend.app.core.config import settings
    from backend.app.models.schemas import (
        Finding,
        FindingCategory,
        PriorityLevel,
        CheckSource,
        EvidenceStatus,
        ClaimType
    )
except ModuleNotFoundError:
    from app.core.config import settings
    from app.models.schemas import (
        Finding,
        FindingCategory,
        PriorityLevel,
        CheckSource,
        EvidenceStatus,
        ClaimType
    )

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are an expert AI Content Quality & Factuality Auditor for high-stakes publications, enterprise brands, and SEO teams.
Your job is to objectively evaluate a draft against editorial standards, brand guidelines, audience goals, search intent, and supplied reference evidence.

CRITICAL RULES:
1. FACTUAL CLAIMS & EVIDENCE:
   - Identify specific factual claims requiring proof: statistics, numerical figures, percentages, dates, timelines, product feature claims, and performance claims.
   - If reference evidence was provided, evaluate each claim against it:
     * "Supported by supplied evidence": The exact claim or figure is substantiated by the supplied reference.
     * "Potentially contradicted": The claim directly conflicts with or contradicts figures/facts in the supplied reference.
     * "Unverified": A claim was made, but the supplied reference does not cover or prove it, or no reference evidence was supplied.
   - STRICT CONSTRAINT: NEVER invent citations, URLs, or external data. If evidence is missing, mark it as "Unverified" and note what specific verification is needed. Missing evidence does NOT imply false, only unverified.
2. EDITORIAL & QUALITY CHECKS:
   - "Tone & Brand Inconsistency": Check if voice clashes with stated brand guidelines, audience expectations, or formality level.
   - "Search Intent & Goal Mismatch": Check if the draft satisfies the stated search intent (e.g. Informational vs Commercial vs Transactional) and content goal.
   - "Missing Sections & Gaps": Identify critical sections, counterarguments, or prerequisite explanations omitted from the draft.
   - "Vague & Weasel Wording": Identify nuanced semantic vagueness that rule-based checks might miss.
   - "Unclear & Run-on Sentences": Flag semantically convoluted phrasing or jarring transitions.
3. OUTPUT FORMAT:
   - You MUST output strictly valid JSON matching this schema:
   {
     "executive_summary": "High-level summary of draft strengths, factuality status, and top 2-3 areas to improve.",
     "findings": [
       {
         "category": "Factuality & Evidence" | "Tone & Brand Inconsistency" | "Search Intent & Goal Mismatch" | "Missing Sections & Gaps" | "Vague & Weasel Wording" | "Unclear & Run-on Sentences",
         "priority": "High" | "Medium" | "Low",
         "excerpt": "Exact sentence or excerpt from the draft",
         "explanation": "Clear explanation of the problem or claim status",
         "suggested_action": "Concrete, actionable step to fix or refine",
         "claim_type": "Statistic / Numerical Claim" | "Date / Timeline Claim" | "Product / Feature Claim" | "Performance Metric" | "General Factual Claim" | "Not Applicable",
         "evidence_status": "Supported by supplied evidence" | "Potentially contradicted" | "Unverified" | "Not Applicable",
         "evidence_notes": "Quote from supplied reference evidence, or explanation of what proof is missing."
       }
     ]
   }
"""

def extract_json_from_response(text: str) -> dict:
    """Robustly parse JSON object from LLM response text."""
    text = text.strip()
    # Try direct parse
    try:
        return json.loads(text)
    except Exception:
        pass
    
    # Try finding markdown code fences
    fence_pattern = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if fence_pattern:
        try:
            return json.loads(fence_pattern.group(1).strip())
        except Exception:
            pass

    # Try finding outer curly braces
    brace_start = text.find("{")
    brace_end = text.rfind("}")
    if brace_start != -1 and brace_end != -1 and brace_end > brace_start:
        try:
            return json.loads(text[brace_start:brace_end + 1])
        except Exception:
            pass

    raise ValueError("Could not decode valid JSON structure from Gemini response.")

def build_user_prompt(
    draft_text: str,
    audience: Optional[str] = None,
    content_goal: Optional[str] = None,
    target_keyword: Optional[str] = None,
    search_intent: Optional[str] = None,
    brand_guidelines: Optional[str] = None,
    reference_evidence: Optional[str] = None
) -> str:
    parts = ["### CONTENT DRAFT TO REVIEW:"]
    parts.append(draft_text.strip())
    parts.append("\n### METADATA & CONSTRAINTS:")
    parts.append(f"- Target Audience: {audience.strip() if audience else 'General / Not Specified'}")
    parts.append(f"- Content Goal: {content_goal.strip() if content_goal else 'Inform & Engage / Not Specified'}")
    parts.append(f"- Target Keyword: {target_keyword.strip() if target_keyword else 'Not Specified'}")
    parts.append(f"- Search Intent: {search_intent.strip() if search_intent else 'Informational / Not Specified'}")
    parts.append(f"- Brand Guidelines: {brand_guidelines.strip() if brand_guidelines else 'Maintain professional, authoritative tone'}")
    parts.append("\n### SUPPLIED REFERENCE EVIDENCE / SOURCES:")
    if reference_evidence and reference_evidence.strip():
        parts.append(reference_evidence.strip())
    else:
        parts.append("NO REFERENCE EVIDENCE WAS SUPPLIED. (Every factual claim requiring evidence must be marked as 'Unverified').")

    parts.append("\nPerform your audit now. Output JSON only.")
    return "\n".join(parts)

def parse_category(cat_str: str) -> FindingCategory:
    for cat in FindingCategory:
        if cat.value.lower() == cat_str.lower() or cat.name.lower() == cat_str.lower():
            return cat
    if "fact" in cat_str.lower() or "evidence" in cat_str.lower():
        return FindingCategory.factuality_and_evidence
    if "tone" in cat_str.lower() or "brand" in cat_str.lower():
        return FindingCategory.inconsistent_tone
    if "intent" in cat_str.lower() or "goal" in cat_str.lower():
        return FindingCategory.search_intent_mismatch
    if "missing" in cat_str.lower() or "gap" in cat_str.lower():
        return FindingCategory.missing_sections
    if "vague" in cat_str.lower() or "weasel" in cat_str.lower():
        return FindingCategory.vague_wording
    if "sentence" in cat_str.lower() or "unclear" in cat_str.lower() or "run-on" in cat_str.lower():
        return FindingCategory.unclear_sentences
    return FindingCategory.factuality_and_evidence

def parse_priority(pri_str: str) -> PriorityLevel:
    pri_clean = pri_str.strip().capitalize()
    if pri_clean in [p.value for p in PriorityLevel]:
        return PriorityLevel(pri_clean)
    return PriorityLevel.medium

def parse_evidence_status(status_str: str) -> EvidenceStatus:
    s_lower = status_str.strip().lower()
    if "supported" in s_lower:
        return EvidenceStatus.supported
    if "contradict" in s_lower:
        return EvidenceStatus.contradicted
    if "unverified" in s_lower:
        return EvidenceStatus.unverified
    return EvidenceStatus.not_applicable

def parse_claim_type(ct_str: str) -> ClaimType:
    ct_lower = ct_str.strip().lower()
    if "statistic" in ct_lower or "number" in ct_lower or "percent" in ct_lower:
        return ClaimType.statistic
    if "date" in ct_lower or "timeline" in ct_lower:
        return ClaimType.date
    if "product" in ct_lower or "feature" in ct_lower:
        return ClaimType.product_claim
    if "metric" in ct_lower or "performance" in ct_lower:
        return ClaimType.metric_or_data
    if "fact" in ct_lower:
        return ClaimType.general_fact
    return ClaimType.not_applicable

def analyze_with_gemini(
    draft_text: str,
    audience: Optional[str] = None,
    content_goal: Optional[str] = None,
    target_keyword: Optional[str] = None,
    search_intent: Optional[str] = None,
    brand_guidelines: Optional[str] = None,
    reference_evidence: Optional[str] = None,
    api_key: Optional[str] = None,
    model_name: Optional[str] = None
) -> Tuple[List[Finding], str, str, Optional[str]]:
    """
    Executes Gemini AI analysis using google-genai SDK.
    Returns: (findings, executive_summary, model_used, warning_notice)
    """
    key = settings.GEMINI_API_KEY if api_key is None else api_key
    if not key or not key.strip():
        logger.warning("No Gemini API key configured. Returning deterministic fallback.")
        return (
            [],
            "Gemini API key is not configured. Deterministic rules (repetition, readability, weasel words, and keyword density) were executed successfully.",
            "deterministic-only",
            "Gemini API key not configured. Only deterministic checks were run."
        )

    client = genai.Client(api_key=key, http_options=types.HttpOptions(timeout=25000))
    prompt = build_user_prompt(
        draft_text=draft_text,
        audience=audience,
        content_goal=content_goal,
        target_keyword=target_keyword,
        search_intent=search_intent,
        brand_guidelines=brand_guidelines,
        reference_evidence=reference_evidence
    )

    models_to_try = []
    primary_model = model_name or settings.GEMINI_MODEL or "gemini-3.5-flash"
    models_to_try.append(primary_model)
    # If primary model is not gemini-3.5-flash, add gemini-3.5-flash as fast fallback
    if primary_model != "gemini-3.5-flash":
        models_to_try.append("gemini-3.5-flash")

    last_error = None
    response_payload = None
    model_succeeded = None
    warning_notice = None

    for m in models_to_try:
        try:
            logger.info(f"Invoking Gemini model: {m}")
            response = client.models.generate_content(
                model=m,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_PROMPT,
                    temperature=0.2,
                    response_mime_type="application/json"
                )
            )
            if response and response.text:
                response_payload = extract_json_from_response(response.text)
                model_succeeded = m
                break
        except Exception as e:
            logger.warning(f"Error querying Gemini with model {m}: {type(e).__name__}: {e}")
            last_error = e

    if not response_payload:
        warning_msg = f"Gemini API analysis unavailable ({type(last_error).__name__}). Returned rule-based deterministic checks."
        logger.error(warning_msg)
        return (
            [],
            "AI Factuality analysis was temporarily unavailable due to upstream provider timeout or quota limits. Complete deterministic analysis was executed.",
            "deterministic-fallback",
            warning_msg
        )

    # Process and convert JSON payload into typed Finding objects
    raw_findings = response_payload.get("findings", [])
    exec_summary = response_payload.get("executive_summary", "Review completed successfully.")
    
    findings: List[Finding] = []
    for item in raw_findings:
        if not isinstance(item, dict):
            continue
        excerpt = item.get("excerpt", "").strip()
        explanation = item.get("explanation", "").strip()
        suggested_action = item.get("suggested_action", "").strip()
        if not excerpt or not explanation:
            continue

        cat = parse_category(str(item.get("category", "")))
        pri = parse_priority(str(item.get("priority", "Medium")))
        claim_type = parse_claim_type(str(item.get("claim_type", "")))
        evidence_status = parse_evidence_status(str(item.get("evidence_status", "")))
        evidence_notes = item.get("evidence_notes")

        findings.append(Finding(
            id=f"ai-{uuid.uuid4().hex[:6]}",
            category=cat,
            priority=pri,
            source=CheckSource.ai,
            excerpt=excerpt,
            explanation=explanation,
            suggested_action=suggested_action or "Review and revise this section accordingly.",
            claim_type=claim_type,
            evidence_status=evidence_status,
            evidence_notes=str(evidence_notes) if evidence_notes else None
        ))

    return findings, exec_summary, model_succeeded, warning_notice
