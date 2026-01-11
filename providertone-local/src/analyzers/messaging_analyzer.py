"""
Analyze portal messages to extract communication style patterns.
"""

import json
from pathlib import Path
from typing import Dict, List, Any

from ..llm import get_llm_client, BaseLLMClient


def analyze_messaging_style(
    categorized_samples: Dict[str, List[Dict]],
    llm: str = "claude",
    verbose: bool = False
) -> Dict[str, Any]:
    """
    Analyze sampled messages to extract style patterns.

    Args:
        categorized_samples: Messages grouped by type (anxious, routine, etc.)
        llm: Which LLM to use ("claude" or "local")
        verbose: Print progress

    Returns:
        Analysis dictionary with extracted patterns
    """
    client = get_llm_client(llm)

    # Load prompt template
    prompt_path = Path(__file__).parent.parent / "llm" / "prompts" / "messaging_analysis.txt"
    prompt_template = prompt_path.read_text()

    # Analyze each category separately
    category_analyses = {}
    for category, messages in categorized_samples.items():
        if not messages:
            continue

        if verbose:
            print(f"  Analyzing {category} ({len(messages)} messages)...")

        analysis = analyze_message_category(
            messages=messages,
            category=category,
            client=client,
            prompt_template=prompt_template
        )
        category_analyses[category] = analysis

    # Aggregate across categories
    aggregated = aggregate_message_analyses(category_analyses)
    aggregated["category_analyses"] = category_analyses
    aggregated["total_messages_analyzed"] = sum(
        len(msgs) for msgs in categorized_samples.values()
    )

    return aggregated


def analyze_message_category(
    messages: List[Dict],
    category: str,
    client: BaseLLMClient,
    prompt_template: str
) -> Dict[str, Any]:
    """Analyze a single category of messages."""

    # Format messages for prompt
    formatted = format_messages_for_prompt(messages)

    # Build prompt
    prompt = f"""Category: {category.upper()} messages

{prompt_template.replace('{messages}', formatted)}"""

    # Get analysis
    response = client.analyze(prompt)

    # Parse JSON response
    try:
        return json.loads(response)
    except json.JSONDecodeError:
        # Try to extract JSON from response
        import re
        json_match = re.search(r'\{[\s\S]*\}', response)
        if json_match:
            return json.loads(json_match.group())
        raise ValueError(f"Could not parse analysis response for {category}")


def format_messages_for_prompt(messages: List[Dict], max_messages: int = 30) -> str:
    """Format messages for inclusion in prompt."""
    formatted_parts = []

    for i, msg in enumerate(messages[:max_messages], 1):
        body = msg.get("body", msg.get("content", ""))
        subject = msg.get("subject", "")
        date = msg.get("sent_at", "")[:10] if msg.get("sent_at") else ""

        formatted_parts.append(f"""
--- Message {i} ---
Date: {date}
Subject: {subject}

{body}
""")

    return "\n".join(formatted_parts)


def aggregate_message_analyses(category_analyses: Dict[str, Dict]) -> Dict[str, Any]:
    """Combine analyses from different categories into unified patterns."""
    from collections import Counter

    # Collect patterns across categories
    all_greetings = []
    all_closings = []
    all_frequent_phrases = []
    all_signature_phrases = []
    all_avoided = []

    tone_scores = {
        'warmth': [],
        'directiveness': [],
        'formality': [],
        'certainty': [],
        'thoroughness': []
    }

    behavioral = {
        'acknowledges_emotions': [],
        'provides_education': [],
        'sets_clear_expectations': [],
        'uses_patient_name': [],
        'asks_follow_up_questions': []
    }

    for category, analysis in category_analyses.items():
        # Surface patterns
        if 'surface_patterns' in analysis:
            sp = analysis['surface_patterns']
            if isinstance(sp.get('greetings'), list):
                all_greetings.extend(sp['greetings'])
            if isinstance(sp.get('closings'), list):
                all_closings.extend(sp['closings'])

        # Tone dimensions
        if 'tone_dimensions' in analysis:
            for tone, data in analysis['tone_dimensions'].items():
                if tone in tone_scores:
                    score = data.get('score') if isinstance(data, dict) else data
                    if isinstance(score, (int, float)):
                        tone_scores[tone].append(score)

        # Distinctive phrases
        if 'distinctive_phrases' in analysis:
            dp = analysis['distinctive_phrases']
            if isinstance(dp.get('frequent'), list):
                all_frequent_phrases.extend(dp['frequent'])
            if isinstance(dp.get('signature'), list):
                all_signature_phrases.extend(dp['signature'])
            if isinstance(dp.get('avoided'), list):
                all_avoided.extend(dp['avoided'])

        # Behavioral patterns
        if 'behavioral_patterns' in analysis:
            for key, value in analysis['behavioral_patterns'].items():
                if key in behavioral and isinstance(value, bool):
                    behavioral[key].append(value)

    # Deduplicate and rank by frequency
    def rank_by_frequency(items: List[str], top_n: int = 5) -> List[str]:
        if not items:
            return []
        counts = Counter(items)
        return [item for item, _ in counts.most_common(top_n)]

    # Average tone scores
    averaged_tones = {}
    for tone, scores in tone_scores.items():
        if scores:
            avg = sum(scores) / len(scores)
            averaged_tones[tone] = round(avg, 1)
        else:
            averaged_tones[tone] = 5.0

    # Majority vote for behavioral patterns
    behavioral_summary = {}
    for key, votes in behavioral.items():
        if votes:
            behavioral_summary[key] = sum(votes) > len(votes) / 2
        else:
            behavioral_summary[key] = None

    return {
        'surface_patterns': {
            'greetings': rank_by_frequency(all_greetings),
            'closings': rank_by_frequency(all_closings),
            'length_tendency': determine_length_tendency(category_analyses),
        },
        'tone_dimensions': averaged_tones,
        'distinctive_phrases': {
            'frequent': rank_by_frequency(all_frequent_phrases, 10),
            'signature': rank_by_frequency(all_signature_phrases, 5),
            'avoided': rank_by_frequency(all_avoided, 5),
        },
        'behavioral_patterns': behavioral_summary,
        'confidence': calculate_confidence(category_analyses),
    }


def determine_length_tendency(analyses: Dict[str, Dict]) -> str:
    """Determine overall length tendency from analyses."""
    tendencies = []
    for analysis in analyses.values():
        if 'surface_patterns' in analysis:
            tendency = analysis['surface_patterns'].get('length_tendency', '')
            if tendency:
                tendencies.append(tendency.lower())

    if not tendencies:
        return 'medium'

    from collections import Counter
    counts = Counter(tendencies)
    return counts.most_common(1)[0][0]


def calculate_confidence(analyses: Dict[str, Dict]) -> float:
    """Calculate confidence score based on consistency across categories."""
    if len(analyses) < 2:
        return 0.5

    # Check consistency of tone scores
    tone_variances = []
    tones = ['warmth', 'directiveness', 'formality', 'certainty', 'thoroughness']

    for tone in tones:
        scores = []
        for analysis in analyses.values():
            if 'tone_dimensions' in analysis:
                data = analysis['tone_dimensions'].get(tone, {})
                score = data.get('score') if isinstance(data, dict) else data
                if isinstance(score, (int, float)):
                    scores.append(score)

        if len(scores) >= 2:
            variance = sum((s - sum(scores)/len(scores))**2 for s in scores) / len(scores)
            tone_variances.append(variance)

    if not tone_variances:
        return 0.5

    # Lower variance = higher confidence
    avg_variance = sum(tone_variances) / len(tone_variances)
    # Variance of 0 = confidence 1.0, variance of 10 = confidence 0.5
    confidence = max(0.5, min(1.0, 1.0 - (avg_variance / 20)))

    return round(confidence, 2)
