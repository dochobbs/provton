"""
Analyze clinical notes to extract documentation style patterns.
"""

import json
from pathlib import Path
from typing import Dict, List, Any

from ..llm import get_llm_client, BaseLLMClient


def analyze_documentation_style(
    categorized_samples: Dict[str, List[Dict]],
    llm: str = "claude",
    verbose: bool = False
) -> Dict[str, Any]:
    """
    Analyze sampled clinical notes to extract documentation patterns.

    Args:
        categorized_samples: Notes grouped by visit type (acute, chronic, etc.)
        llm: Which LLM to use

    Returns:
        Analysis dictionary with extracted patterns
    """
    client = get_llm_client(llm)

    # Load prompt template
    prompt_path = Path(__file__).parent.parent / "llm" / "prompts" / "documentation_analysis.txt"
    prompt_template = prompt_path.read_text()

    # Analyze each visit type
    visit_type_analyses = {}
    for visit_type, notes in categorized_samples.items():
        if not notes:
            continue

        if verbose:
            print(f"  Analyzing {visit_type} ({len(notes)} notes)...")

        analysis = analyze_note_category(
            notes=notes,
            visit_type=visit_type,
            client=client,
            prompt_template=prompt_template
        )
        visit_type_analyses[visit_type] = analysis

    # Aggregate
    aggregated = aggregate_documentation_analyses(visit_type_analyses)
    aggregated["visit_type_analyses"] = visit_type_analyses
    aggregated["total_notes_analyzed"] = sum(
        len(notes) for notes in categorized_samples.values()
    )

    return aggregated


def analyze_note_category(
    notes: List[Dict],
    visit_type: str,
    client: BaseLLMClient,
    prompt_template: str
) -> Dict[str, Any]:
    """Analyze notes of a specific visit type."""

    formatted = format_notes_for_prompt(notes)

    prompt = f"""Visit Type: {visit_type.upper()}

{prompt_template.replace('{notes}', formatted)}"""

    response = client.analyze(prompt)

    try:
        return json.loads(response)
    except json.JSONDecodeError:
        import re
        json_match = re.search(r'\{[\s\S]*\}', response)
        if json_match:
            return json.loads(json_match.group())
        raise ValueError(f"Could not parse analysis response for {visit_type}")


def format_notes_for_prompt(notes: List[Dict], max_notes: int = 20) -> str:
    """Format clinical notes for inclusion in prompt."""
    formatted_parts = []

    for i, note in enumerate(notes[:max_notes], 1):
        content = note.get("content", {})
        date = note.get("created_at", "")[:10] if note.get("created_at") else ""
        cc = note.get("chief_complaint", "")

        if isinstance(content, dict):
            note_text = f"""Chief Complaint: {cc}

HPI:
{content.get('hpi', '[Not documented]')}

Physical Exam:
{content.get('physical_exam', '[Not documented]')}

Assessment:
{content.get('assessment', '[Not documented]')}

Plan:
{content.get('plan', '[Not documented]')}"""
        else:
            note_text = f"""Chief Complaint: {cc}

{content}"""

        formatted_parts.append(f"""
--- Note {i} ({note.get('visit_type', 'Unknown')}) ---
Date: {date}

{note_text}
""")

    return "\n".join(formatted_parts)


def aggregate_documentation_analyses(visit_type_analyses: Dict[str, Dict]) -> Dict[str, Any]:
    """Combine analyses from different visit types into unified patterns."""
    from collections import Counter

    # Collect patterns
    structural_votes = {
        'overall_organization': [],
        'hpi_format': [],
        'assessment_format': [],
        'plan_organization': [],
    }

    voice_scores = {
        'verbosity': [],
        'reasoning_visibility': [],
        'formality': [],
        'certainty_expression': [],
        'patient_centeredness': [],
        'defensiveness': []
    }

    all_hpi_openings = []
    all_transition_phrases = []
    all_assessment_language = []
    all_plan_language = []
    all_safety_net = []
    all_signature_moves = []
    all_avoided = []

    for visit_type, analysis in visit_type_analyses.items():
        # Structural patterns
        if 'structural_patterns' in analysis:
            sp = analysis['structural_patterns']
            if sp.get('overall_organization'):
                structural_votes['overall_organization'].append(sp['overall_organization'])
            if isinstance(sp.get('hpi_style'), dict):
                structural_votes['hpi_format'].append(sp['hpi_style'].get('format', ''))
            if isinstance(sp.get('assessment_style'), dict):
                structural_votes['assessment_format'].append(sp['assessment_style'].get('format', ''))
            if isinstance(sp.get('plan_style'), dict):
                structural_votes['plan_organization'].append(sp['plan_style'].get('organization', ''))

        # Voice dimensions
        if 'voice_dimensions' in analysis:
            for voice, data in analysis['voice_dimensions'].items():
                if voice in voice_scores:
                    score = data.get('score') if isinstance(data, dict) else data
                    if isinstance(score, (int, float)):
                        voice_scores[voice].append(score)

        # Standard phrasings
        if 'standard_phrasings' in analysis:
            sp = analysis['standard_phrasings']
            if isinstance(sp.get('hpi_openings'), list):
                all_hpi_openings.extend(sp['hpi_openings'])
            if isinstance(sp.get('transition_phrases'), list):
                all_transition_phrases.extend(sp['transition_phrases'])
            if isinstance(sp.get('assessment_language'), list):
                all_assessment_language.extend(sp['assessment_language'])
            if isinstance(sp.get('plan_language'), list):
                all_plan_language.extend(sp['plan_language'])
            if isinstance(sp.get('safety_net_phrases'), list):
                all_safety_net.extend(sp['safety_net_phrases'])

        # Distinctive patterns
        if 'distinctive_patterns' in analysis:
            dp = analysis['distinctive_patterns']
            if isinstance(dp.get('signature_moves'), list):
                all_signature_moves.extend(dp['signature_moves'])
            if isinstance(dp.get('avoided_patterns'), list):
                all_avoided.extend(dp['avoided_patterns'])

    # Helper functions
    def most_common(items: List[str]) -> str:
        if not items:
            return ""
        counts = Counter(items)
        return counts.most_common(1)[0][0]

    def rank_by_frequency(items: List[str], top_n: int = 5) -> List[str]:
        if not items:
            return []
        counts = Counter(items)
        return [item for item, _ in counts.most_common(top_n)]

    # Average voice scores
    averaged_voice = {}
    for voice, scores in voice_scores.items():
        if scores:
            avg = sum(scores) / len(scores)
            averaged_voice[voice] = round(avg, 1)
        else:
            averaged_voice[voice] = 5.0

    return {
        'structural_patterns': {
            'overall_organization': most_common(structural_votes['overall_organization']) or 'SOAP',
            'hpi_format': most_common(structural_votes['hpi_format']) or 'narrative',
            'assessment_format': most_common(structural_votes['assessment_format']) or 'diagnosis_only',
            'plan_organization': most_common(structural_votes['plan_organization']) or 'numbered',
        },
        'voice_dimensions': averaged_voice,
        'standard_phrasings': {
            'hpi_openings': rank_by_frequency(all_hpi_openings),
            'transition_phrases': rank_by_frequency(all_transition_phrases),
            'assessment_language': rank_by_frequency(all_assessment_language),
            'plan_language': rank_by_frequency(all_plan_language),
            'safety_net_phrases': rank_by_frequency(all_safety_net),
        },
        'distinctive_patterns': {
            'signature_moves': rank_by_frequency(all_signature_moves),
            'avoided_patterns': rank_by_frequency(all_avoided),
        },
        'confidence': calculate_doc_confidence(visit_type_analyses),
    }


def calculate_doc_confidence(analyses: Dict[str, Dict]) -> float:
    """Calculate confidence score for documentation analysis."""
    if len(analyses) < 2:
        return 0.5

    # Check consistency of voice scores
    voice_variances = []
    voices = ['verbosity', 'reasoning_visibility', 'formality', 'certainty_expression']

    for voice in voices:
        scores = []
        for analysis in analyses.values():
            if 'voice_dimensions' in analysis:
                data = analysis['voice_dimensions'].get(voice, {})
                score = data.get('score') if isinstance(data, dict) else data
                if isinstance(score, (int, float)):
                    scores.append(score)

        if len(scores) >= 2:
            variance = sum((s - sum(scores)/len(scores))**2 for s in scores) / len(scores)
            voice_variances.append(variance)

    if not voice_variances:
        return 0.5

    avg_variance = sum(voice_variances) / len(voice_variances)
    confidence = max(0.5, min(1.0, 1.0 - (avg_variance / 20)))

    return round(confidence, 2)
