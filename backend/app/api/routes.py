import datetime
import logging
from fastapi import APIRouter, HTTPException, Response
from backend.app.core.config import settings
from backend.app.models.schemas import (
    ContentReviewRequest,
    ContentReviewResponse
)
from backend.app.services.deterministic_checker import run_deterministic_analysis
from backend.app.services.gemini_analyzer import analyze_with_gemini
from backend.app.services.report_generator import (
    calculate_review_summary,
    generate_markdown_report
)

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/health")
async def health_check():
    """Health check endpoint providing service and model configuration status."""
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "gemini_configured": bool(settings.GEMINI_API_KEY),
        "configured_model": settings.GEMINI_MODEL
    }

@router.post("/content/review", response_model=ContentReviewResponse)
async def review_content(request: ContentReviewRequest):
    """
    Evaluates draft content against factual evidence, editorial guidelines,
    search intent, and deterministic writing quality rules.
    """
    draft = request.draft_text.strip()
    if len(draft) < settings.MIN_DRAFT_CHARS:
        raise HTTPException(
            status_code=400,
            detail=f"Draft text too short. Minimum length is {settings.MIN_DRAFT_CHARS} characters."
        )
    if len(draft) > settings.MAX_DRAFT_CHARS:
        raise HTTPException(
            status_code=400,
            detail=f"Draft text exceeds maximum allowed limit of {settings.MAX_DRAFT_CHARS} characters."
        )

    # 1. Run deterministic checks (repetition, weasel words, readability, keyword density)
    det_findings, stats = run_deterministic_analysis(
        draft_text=draft,
        target_keyword=request.target_keyword
    )

    # 2. Run Gemini AI analysis (claims, evidence verification, tone, intent mismatch, gaps)
    ai_findings, ai_summary, model_used, warning_notice = analyze_with_gemini(
        draft_text=draft,
        audience=request.audience,
        content_goal=request.content_goal,
        target_keyword=request.target_keyword,
        search_intent=request.search_intent,
        brand_guidelines=request.brand_guidelines,
        reference_evidence=request.reference_evidence
    )

    # 3. Calculate scores and executive summary
    summary = calculate_review_summary(
        deterministic_findings=det_findings,
        ai_findings=ai_findings,
        stats=stats,
        ai_summary_text=ai_summary
    )

    # Combined findings with High priority first, then Medium, then Low
    combined_findings = det_findings + ai_findings
    priority_order = {"High": 0, "Medium": 1, "Low": 2}
    combined_findings.sort(key=lambda f: priority_order.get(f.priority.value, 1))

    timestamp_str = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

    return ContentReviewResponse(
        status="success",
        summary=summary,
        stats=stats,
        findings=combined_findings,
        model_used=model_used or settings.GEMINI_MODEL,
        timestamp=timestamp_str,
        warning_notice=warning_notice
    )

@router.post("/content/export-markdown")
async def export_markdown(review: ContentReviewResponse):
    """Exports a review response as a downloadable Markdown document."""
    markdown_content = generate_markdown_report(review)
    return Response(
        content=markdown_content,
        media_type="text/markdown",
        headers={"Content-Disposition": "attachment; filename=content-quality-report.md"}
    )
