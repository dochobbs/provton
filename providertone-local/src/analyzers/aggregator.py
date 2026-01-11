"""
Aggregate multiple analysis results.
"""

from typing import Dict, List, Any


def aggregate_analyses(analyses: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Aggregate multiple analysis runs into a single result.

    Useful for combining results from different time periods or
    re-running analysis for confidence.

    Args:
        analyses: List of analysis dictionaries

    Returns:
        Aggregated analysis
    """
    if not analyses:
        return {}

    if len(analyses) == 1:
        return analyses[0]

    # Combine category analyses
    all_category_analyses = {}
    for analysis in analyses:
        if 'category_analyses' in analysis:
            for cat, data in analysis['category_analyses'].items():
                if cat not in all_category_analyses:
                    all_category_analyses[cat] = []
                all_category_analyses[cat].append(data)

    # Average tone scores across runs
    tone_scores = {}
    for analysis in analyses:
        if 'tone_dimensions' in analysis:
            for tone, score in analysis['tone_dimensions'].items():
                if tone not in tone_scores:
                    tone_scores[tone] = []
                if isinstance(score, (int, float)):
                    tone_scores[tone].append(score)

    averaged_tones = {
        tone: round(sum(scores) / len(scores), 1)
        for tone, scores in tone_scores.items()
        if scores
    }

    # Combine distinctive phrases
    all_phrases = []
    for analysis in analyses:
        if 'distinctive_phrases' in analysis:
            dp = analysis['distinctive_phrases']
            if isinstance(dp.get('frequent'), list):
                all_phrases.extend(dp['frequent'])

    from collections import Counter
    phrase_counts = Counter(all_phrases)
    top_phrases = [p for p, _ in phrase_counts.most_common(10)]

    # Calculate overall confidence
    confidences = [
        a.get('confidence', 0.5)
        for a in analyses
        if 'confidence' in a
    ]
    avg_confidence = sum(confidences) / len(confidences) if confidences else 0.5

    return {
        'tone_dimensions': averaged_tones,
        'distinctive_phrases': {
            'frequent': top_phrases,
        },
        'confidence': round(avg_confidence, 2),
        'num_runs': len(analyses),
        'total_messages_analyzed': sum(
            a.get('total_messages_analyzed', 0) for a in analyses
        ),
    }
