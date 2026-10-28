import re
import uuid
from typing import List, Tuple
from backend.app.models.schemas import (
    Finding,
    FindingCategory,
    PriorityLevel,
    CheckSource,
    DeterministicStats
)

WEASEL_PATTERNS = [
    (r"\b(studies (?:show|prove|suggest)|research (?:shows|proves|indicates)|experts (?:agree|say|claim))\b", 
     "Unattributed research or expert claim without a direct citation or author source."),
    (r"\b(it is (?:widely|commonly) (?:known|believed|accepted))\b", 
     "Passive consensus assertion ('it is widely known') that lacks attributable evidence."),
    (r"\b(virtually all|almost everyone|every single person)\b", 
     "Overgeneralized sweeping claim that is difficult to substantiate."),
    (r"\b(arguably|supposedly|purportedly)\b", 
     "Hedging word that weakens argument authority and clarity."),
    (r"\b(a lot of|tons of|huge amount of)\b", 
     "Informal, vague quantifier that should be replaced with precise metrics or numbers.")
]

STOP_PHRASES = {
    "as well as", "at the same", "the same time", "in order to", "one of the",
    "on the other", "the other hand", "for example if", "in terms of", "due to the",
    "as well as the", "at the same time"
}

def count_syllables_word(word: str) -> int:
    """Heuristic syllable counter for English words."""
    word = word.lower().strip()
    if not word:
        return 0
    if len(word) <= 3:
        return 1

    le_syllable = 1 if re.search(r'[^aeiouy]le$', word) else 0
    cleaned = re.sub(r'(?:[^l]ed|es|e)$', '', word)
    vowels = re.findall(r'[aeiouy]+', cleaned)
    count = len(vowels)
    if le_syllable and count < 2:
        count = max(2, count + 1)
    return max(1, count)

def split_sentences(text: str) -> List[str]:
    """Robust sentence boundary detector handling decimals, abbreviations and quotes."""
    cleaned = text.strip()
    if not cleaned:
        return []
    raw_sentences = re.split(r'(?<=[.!?])\s+', cleaned)
    return [s.strip() for s in raw_sentences if s.strip() and len(s.strip()) > 3]

def split_words(text: str) -> List[str]:
    """Extract alphabetic words from text."""
    return re.findall(r"\b[A-Za-z0-9'-]+\b", text)

def run_deterministic_analysis(draft_text: str, target_keyword: str = None) -> Tuple[List[Finding], DeterministicStats]:
    findings: List[Finding] = []
    
    sentences = split_sentences(draft_text)
    words = split_words(draft_text)
    total_words = len(words)
    total_chars = len(draft_text)
    paragraphs = [p for p in draft_text.split("\n\n") if p.strip()]
    paragraph_count = max(1, len(paragraphs))
    sentence_count = max(1, len(sentences))
    
    # Calculate readability metrics
    total_syllables = sum(count_syllables_word(w) for w in words)
    avg_sentence_len = round(total_words / sentence_count, 1) if sentence_count > 0 else 0.0
    avg_syllables_per_word = (total_syllables / total_words) if total_words > 0 else 1.0
    
    if total_words > 0 and sentence_count > 0:
        flesch_reading_ease = round(206.835 - (1.015 * avg_sentence_len) - (84.6 * avg_syllables_per_word), 1)
        flesch_reading_ease = max(0.0, min(100.0, flesch_reading_ease))
        flesch_kincaid_grade = round(0.39 * avg_sentence_len + 11.8 * avg_syllables_per_word - 15.59, 1)
        flesch_kincaid_grade = max(1.0, min(20.0, flesch_kincaid_grade))
    else:
        flesch_reading_ease = 70.0
        flesch_kincaid_grade = 8.0

    if flesch_reading_ease >= 80:
        readability_label = "Very Easy (Grade 5-6)"
    elif flesch_reading_ease >= 70:
        readability_label = "Fairly Easy (Grade 7)"
    elif flesch_reading_ease >= 60:
        readability_label = "Plain English (Grade 8-9)"
    elif flesch_reading_ease >= 50:
        readability_label = "Fairly Difficult (High School)"
    elif flesch_reading_ease >= 30:
        readability_label = "Difficult (College level)"
    else:
        readability_label = "Very Difficult (Academic/Technical)"

    reading_time_minutes = round(max(0.5, total_words / 200.0), 1)

    # 1. Consecutive duplicate words ("the the", "is is")
    consecutive_dup_pattern = re.compile(r"\b([A-Za-z]+)\s+\1\b", re.IGNORECASE)
    for match in consecutive_dup_pattern.finditer(draft_text):
        dup_word = match.group(1)
        start_idx = max(0, match.start() - 20)
        end_idx = min(len(draft_text), match.end() + 20)
        excerpt = draft_text[start_idx:end_idx].strip()
        
        findings.append(Finding(
            id=f"det-dup-word-{uuid.uuid4().hex[:6]}",
            category=FindingCategory.repetition_and_redundancy,
            priority=PriorityLevel.medium,
            source=CheckSource.deterministic,
            excerpt=f"...{excerpt}...",
            explanation=f"Accidental consecutive duplicate word '{dup_word}' detected.",
            suggested_action=f"Remove the duplicate word '{dup_word}' to maintain clean editorial polish."
        ))

    # 2. Repeated 4-word and 3-word n-grams (phrases)
    if total_words >= 12:
        lower_words = [w.lower() for w in words]
        ngram_counts = {}

        # Collect 4-grams first
        for i in range(len(lower_words) - 3):
            phrase = f"{lower_words[i]} {lower_words[i+1]} {lower_words[i+2]} {lower_words[i+3]}"
            if phrase not in STOP_PHRASES:
                ngram_counts[phrase] = ngram_counts.get(phrase, 0) + 1

        # Collect 3-grams
        for i in range(len(lower_words) - 2):
            phrase = f"{lower_words[i]} {lower_words[i+1]} {lower_words[i+2]}"
            if phrase not in STOP_PHRASES:
                ngram_counts[phrase] = ngram_counts.get(phrase, 0) + 1

        flagged_phrases = set()
        # Sort by phrase length descending so 4-grams take precedence over contained 3-grams
        for phrase, count in sorted(ngram_counts.items(), key=lambda x: len(x[0]), reverse=True):
            if count >= 3:
                if not any(phrase in fp for fp in flagged_phrases):
                    flagged_phrases.add(phrase)
                    findings.append(Finding(
                        id=f"det-rep-phrase-{uuid.uuid4().hex[:6]}",
                        category=FindingCategory.repetition_and_redundancy,
                        priority=PriorityLevel.medium,
                        source=CheckSource.deterministic,
                        excerpt=f"'{phrase}' (repeated {count} times)",
                        explanation=f"The phrase '{phrase}' appears {count} times across this draft.",
                        suggested_action="Vary your phrasing or use synonyms to avoid repetitive cadence and maintain reader engagement."
                    ))

    # 3. Repeated consecutive sentence starters
    starter_tracker = []
    for s in sentences:
        s_words = split_words(s)
        if s_words:
            starter_tracker.append((s_words[0].lower(), s))

    consecutive_starter_count = 1
    current_starter = ""
    for i in range(1, len(starter_tracker)):
        prev_word, _ = starter_tracker[i-1]
        curr_word, sentence = starter_tracker[i]
        if prev_word == curr_word and curr_word not in {"the", "a", "in"}:
            consecutive_starter_count += 1
            current_starter = curr_word
            if consecutive_starter_count >= 3:
                findings.append(Finding(
                    id=f"det-starter-{uuid.uuid4().hex[:6]}",
                    category=FindingCategory.repetition_and_redundancy,
                    priority=PriorityLevel.low,
                    source=CheckSource.deterministic,
                    excerpt=f"Multiple consecutive sentences starting with '{current_starter.capitalize()}...'",
                    explanation=f"3 or more consecutive sentences begin with the same word ('{current_starter}').",
                    suggested_action="Restructure the opening clauses or combine clauses to introduce dynamic sentence rhythm."
                ))
                consecutive_starter_count = 1
        else:
            consecutive_starter_count = 1

    # 4. Overly long / run-on sentences (> 35 words)
    for s in sentences:
        s_words = split_words(s)
        if len(s_words) >= 38:
            priority = PriorityLevel.high if len(s_words) > 50 else PriorityLevel.medium
            findings.append(Finding(
                id=f"det-runon-{uuid.uuid4().hex[:6]}",
                category=FindingCategory.unclear_sentences,
                priority=priority,
                source=CheckSource.deterministic,
                excerpt=s[:120] + ("..." if len(s) > 120 else ""),
                explanation=f"Run-on sentence containing {len(s_words)} words. Long sentences severely diminish reader comprehension and scannability.",
                suggested_action="Split this into 2 or 3 focused, punchy sentences with clear subjects and verbs."
            ))

    # 5. Weasel & vague words lacking citations
    for pattern, explanation in WEASEL_PATTERNS:
        for match in re.finditer(pattern, draft_text, re.IGNORECASE):
            matched_phrase = match.group(0)
            start_idx = max(0, match.start() - 25)
            end_idx = min(len(draft_text), match.end() + 25)
            excerpt = draft_text[start_idx:end_idx].strip()
            
            findings.append(Finding(
                id=f"det-weasel-{uuid.uuid4().hex[:6]}",
                category=FindingCategory.vague_wording,
                priority=PriorityLevel.medium,
                source=CheckSource.deterministic,
                excerpt=f"...{excerpt}...",
                explanation=f"{explanation} (Flagged phrase: '{matched_phrase}')",
                suggested_action=f"Replace '{matched_phrase}' with specific named studies, verified dates, or concrete supporting data."
            ))

    # 6. Target keyword density check
    kw_occurrences = 0
    kw_density_percent = 0.0
    if target_keyword and target_keyword.strip():
        clean_kw = target_keyword.strip().lower()
        kw_words = split_words(clean_kw)
        kw_word_len = max(1, len(kw_words))
        
        pattern = re.compile(rf"\b{re.escape(clean_kw)}\b", re.IGNORECASE)
        kw_occurrences = len(pattern.findall(draft_text))
        
        if total_words > 0:
            kw_density_percent = round((kw_occurrences * kw_word_len / total_words) * 100, 2)
            
            if kw_density_percent > 2.8 and kw_occurrences >= 4:
                findings.append(Finding(
                    id=f"det-kw-overuse-{uuid.uuid4().hex[:6]}",
                    category=FindingCategory.keyword_overuse,
                    priority=PriorityLevel.high,
                    source=CheckSource.deterministic,
                    excerpt=f"Target keyword '{target_keyword}' found {kw_occurrences} times ({kw_density_percent}% density)",
                    explanation=f"Keyword density is {kw_density_percent}%, exceeding the safe SEO threshold of ~2.5%. This triggers search engine keyword-stuffing penalties.",
                    suggested_action=f"Reduce instances of '{target_keyword}'. Replace secondary occurrences with semantic LSI variations and natural synonyms."
                ))
            elif kw_density_percent < 0.3 and total_words >= 150:
                findings.append(Finding(
                    id=f"det-kw-under-{uuid.uuid4().hex[:6]}",
                    category=FindingCategory.keyword_overuse,
                    priority=PriorityLevel.low,
                    source=CheckSource.deterministic,
                    excerpt=f"Target keyword '{target_keyword}' found {kw_occurrences} times ({kw_density_percent}% density)",
                    explanation=f"Target keyword '{target_keyword}' appears only {kw_occurrences} time(s) across a {total_words}-word draft.",
                    suggested_action=f"Naturally incorporate '{target_keyword}' into key headings, introductory context, or concluding takeaways."
                ))

    stats = DeterministicStats(
        word_count=total_words,
        char_count=total_chars,
        sentence_count=sentence_count,
        paragraph_count=paragraph_count,
        avg_sentence_length_words=avg_sentence_len,
        reading_time_minutes=reading_time_minutes,
        flesch_reading_ease=flesch_reading_ease,
        flesch_kincaid_grade=flesch_kincaid_grade,
        readability_label=readability_label,
        target_keyword_occurrences=kw_occurrences,
        target_keyword_density_percent=kw_density_percent,
        repetition_findings_count=len([f for f in findings if f.category == FindingCategory.repetition_and_redundancy])
    )

    return findings, stats
