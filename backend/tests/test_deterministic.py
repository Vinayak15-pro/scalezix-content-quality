import pytest
from app.services.deterministic_checker import (
    run_deterministic_analysis,
    split_sentences,
    split_words,
    count_syllables_word
)
from app.models.schemas import FindingCategory, PriorityLevel

def test_syllable_counter():
    assert count_syllables_word("the") == 1
    assert count_syllables_word("simple") == 2
    assert count_syllables_word("information") >= 3

def test_split_sentences():
    text = "Artificial intelligence is advancing rapidly. According to Dr. Smith, 45.5% of teams adopt it. Is this true?"
    sentences = split_sentences(text)
    assert len(sentences) >= 2

def test_detect_consecutive_duplicate_words():
    draft = "This is a draft where the the writer accidentally typed duplicate words."
    findings, stats = run_deterministic_analysis(draft)
    dup_findings = [f for f in findings if f.category == FindingCategory.repetition_and_redundancy and "duplicate word" in f.explanation]
    assert len(dup_findings) >= 1
    assert "the" in dup_findings[0].explanation

def test_detect_repeated_phrases():
    draft = (
        "In the digital realm, organizations must innovate. In the digital realm, teams often struggle. "
        "Furthermore, in the digital realm, security is paramount for all users."
    )
    findings, stats = run_deterministic_analysis(draft)
    rep_findings = [f for f in findings if f.category == FindingCategory.repetition_and_redundancy and "digital" in f.excerpt.lower()]
    assert len(rep_findings) >= 1

def test_detect_weasel_words():
    draft = "Studies show that adoption has surged. Research proves our product is number one. Arguably everyone loves it."
    findings, stats = run_deterministic_analysis(draft)
    weasel_findings = [f for f in findings if f.category == FindingCategory.vague_wording]
    assert len(weasel_findings) >= 2

def test_keyword_density_checks():
    draft_stuffing = (
        "Cloud security is vital. Cloud security protects data. Every business needs cloud security. "
        "Our cloud security engineers build cloud security software for modern cloud security operations."
    )
    findings, stats = run_deterministic_analysis(draft_stuffing, target_keyword="cloud security")
    assert stats.target_keyword_occurrences >= 5
    assert stats.target_keyword_density_percent > 2.5
    kw_findings = [f for f in findings if f.category == FindingCategory.keyword_overuse and f.priority == PriorityLevel.high]
    assert len(kw_findings) >= 1

def test_runon_sentence_detection():
    long_sentence = (
        "When companies decide to expand their global footprint across international borders while managing fluctuating "
        "currency rates, diverse regulatory frameworks, fragmented communication platforms, multiple conflicting stakeholder priorities, "
        "unpredictable supply chains, and evolving geopolitical circumstances, they frequently discover that their operational resilience is tested."
    )
    findings, stats = run_deterministic_analysis(long_sentence)
    runon_findings = [f for f in findings if f.category == FindingCategory.unclear_sentences]
    assert len(runon_findings) >= 1
    assert "Run-on sentence" in runon_findings[0].explanation
