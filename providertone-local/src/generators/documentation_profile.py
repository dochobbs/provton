"""
Generate website-compatible DocumentationStyleProfile from analysis.
"""

from typing import Dict, Any, List


def generate_documentation_profile(analysis: Dict[str, Any]) -> Dict[str, Any]:
    """
    Convert raw analysis into website-compatible DocumentationStyleProfile.

    Args:
        analysis: Raw analysis from documentation_analyzer

    Returns:
        DocumentationStyleProfile dict matching website schema
    """
    structural = analysis.get('structural_patterns', {})
    voice = analysis.get('voice_dimensions', {})
    phrasings = analysis.get('standard_phrasings', {})
    distinctive = analysis.get('distinctive_patterns', {})
    visit_analyses = analysis.get('visit_type_analyses', {})

    # Build structural patterns
    structural_patterns = {
        'noteOrganization': structural.get('overall_organization', 'SOAP'),
        'hpiConstruction': format_hpi_style(structural),
        'assessmentSection': format_assessment_style(structural),
        'planSection': format_plan_style(structural),
        'physicalExam': 'Focused documentation of pertinent findings',
        'ros': 'Selective, relevant systems only',
    }

    # Build voice dimensions
    voice_dimensions = {}
    voice_map = {
        'verbosity': 'verbosity',
        'reasoningVisibility': 'reasoning_visibility',
        'formality': 'formality',
        'certaintyExpression': 'certainty_expression',
        'patientCenteredness': 'patient_centeredness',
        'defensiveness': 'defensiveness',
    }

    for web_key, analysis_key in voice_map.items():
        score = voice.get(analysis_key, 5)
        if isinstance(score, dict):
            score = score.get('score', 5)
        score = round(float(score))
        voice_dimensions[web_key] = {
            'score': max(1, min(10, score)),
            'description': generate_voice_description(web_key, score)
        }

    # Build negative constraints
    negative_constraints = {
        'neverUsePhrases': distinctive.get('avoided_patterns', [])[:5],
        'neverUsePatterns': [],
        'avoid': extract_doc_avoidances(analysis),
    }

    # Build standard phrasings
    standard_phrasings = {
        'hpiOpenings': phrasings.get('hpi_openings', [])[:5],
        'transitionPhrases': phrasings.get('transition_phrases', [])[:5],
        'assessmentLanguage': phrasings.get('assessment_language', [])[:5],
        'planLanguage': phrasings.get('plan_language', [])[:5],
        'closingSafetyNet': phrasings.get('safety_net_phrases', [])[:5],
    }

    # Build visit type variations
    visit_type_variations = {
        'acuteVisits': extract_visit_style(visit_analyses, 'acute'),
        'chronicFollowUp': extract_visit_style(visit_analyses, 'chronic_followup'),
        'wellVisits': extract_visit_style(visit_analyses, 'well_visit'),
        'mentalHealth': extract_visit_style(visit_analyses, 'mental_health'),
        'complexDiagnostic': 'Shows clinical reasoning chain',
    }

    # Build signature moves
    signature_moves = distinctive.get('signature_moves', [])[:5]
    if not signature_moves:
        signature_moves = ["Consistent documentation structure"]

    # Build voice summary
    voice_summary = generate_doc_voice_summary(analysis)

    # Example fragments from phrasings
    example_fragments = []
    for key in ['hpi_openings', 'assessment_language', 'plan_language']:
        example_fragments.extend(phrasings.get(key, [])[:2])

    return {
        'structuralPatterns': structural_patterns,
        'voiceDimensions': voice_dimensions,
        'negativeConstraints': negative_constraints,
        'standardPhrasings': standard_phrasings,
        'visitTypeVariations': visit_type_variations,
        'signatureMoves': signature_moves,
        'voiceSummary': voice_summary,
        'exampleFragments': example_fragments[:8],
    }


def format_hpi_style(structural: Dict) -> str:
    """Format HPI style description."""
    hpi_format = structural.get('hpi_format', 'narrative')
    return f"{hpi_format.title()} style with contextual detail"


def format_assessment_style(structural: Dict) -> str:
    """Format assessment style description."""
    style = structural.get('assessment_format', 'diagnosis_only')
    style_map = {
        'diagnosis_only': 'Diagnosis with brief supporting rationale',
        'with_rationale': 'Diagnosis with detailed clinical reasoning',
        'differential_focused': 'Differential-oriented with reasoning for working diagnosis',
    }
    return style_map.get(style, 'Problem-focused assessment')


def format_plan_style(structural: Dict) -> str:
    """Format plan style description."""
    org = structural.get('plan_organization', 'numbered')
    org_map = {
        'numbered': 'Numbered action items',
        'categorized': 'Organized by category (meds, labs, follow-up)',
        'free_text': 'Narrative plan format',
    }
    return org_map.get(org, 'Organized action items')


def generate_voice_description(dimension: str, score: int) -> str:
    """Generate description for voice dimension."""
    descriptions = {
        'verbosity': {
            (1, 3): "Concise, essential information only",
            (4, 6): "Balanced detail appropriate to visit complexity",
            (7, 10): "Comprehensive documentation with full context"
        },
        'reasoningVisibility': {
            (1, 3): "Documents conclusions without explicit reasoning",
            (4, 6): "Shows key reasoning for significant decisions",
            (7, 10): "Thoroughly documents clinical thought process"
        },
        'formality': {
            (1, 3): "Conversational documentation style",
            (4, 6): "Professional medical documentation",
            (7, 10): "Formal, structured clinical language"
        },
        'certaintyExpression': {
            (1, 3): "Frequently qualifies with uncertainty",
            (4, 6): "Balanced confidence with appropriate hedging",
            (7, 10): "Confident diagnostic statements"
        },
        'patientCenteredness': {
            (1, 3): "Clinical focus without patient perspective",
            (4, 6): "Includes relevant patient context",
            (7, 10): "Centers patient voice and perspective"
        },
        'defensiveness': {
            (1, 3): "Minimal medicolegal language",
            (4, 6): "Appropriate documentation of discussions and consent",
            (7, 10): "Detailed defensive documentation"
        },
    }

    for (low, high), desc in descriptions.get(dimension, {}).items():
        if low <= score <= high:
            return desc

    return f"Moderate {dimension}"


def extract_doc_avoidances(analysis: Dict) -> List[str]:
    """Extract documentation patterns to avoid."""
    avoidances = []

    voice = analysis.get('voice_dimensions', {})
    verbosity = voice.get('verbosity', 5)
    if isinstance(verbosity, dict):
        verbosity = verbosity.get('score', 5)

    if verbosity >= 7:
        avoidances.append("Overly brief notes that lack context")
    elif verbosity <= 3:
        avoidances.append("Excessive detail that obscures key findings")

    return avoidances


def extract_visit_style(visit_analyses: Dict, visit_type: str) -> str:
    """Extract style description for specific visit type."""
    if visit_type not in visit_analyses:
        defaults = {
            'acute': 'Focused, efficient documentation',
            'chronic_followup': 'Comprehensive status update with trend data',
            'well_visit': 'Structured with developmental milestones and anticipatory guidance',
            'mental_health': 'Thoughtful documentation with patient perspective',
        }
        return defaults.get(visit_type, 'Standard documentation approach')

    analysis = visit_analyses[visit_type]

    # Try to extract from structural patterns
    if 'structural_patterns' in analysis:
        sp = analysis['structural_patterns']
        hpi = sp.get('hpi_style', {})
        length = hpi.get('typical_length', 'moderate') if isinstance(hpi, dict) else 'moderate'
        return f"{length.title()} detail with focused assessment"

    return 'Consistent documentation approach'


def generate_doc_voice_summary(analysis: Dict) -> str:
    """Generate prose summary of documentation voice."""
    structural = analysis.get('structural_patterns', {})
    voice = analysis.get('voice_dimensions', {})

    def get_score(dim):
        val = voice.get(dim, 5)
        return val.get('score', 5) if isinstance(val, dict) else val

    verbosity = get_score('verbosity')
    reasoning = get_score('reasoning_visibility')
    formality = get_score('formality')

    sentences = []

    # Overall structure
    org = structural.get('overall_organization', 'SOAP')
    sentences.append(f"This provider uses a {org} format for clinical documentation.")

    # Verbosity
    if verbosity >= 7:
        sentences.append("Notes are comprehensive with thorough contextual detail.")
    elif verbosity <= 3:
        sentences.append("Documentation is concise, focusing on essential findings.")
    else:
        sentences.append("Notes balance thoroughness with efficiency.")

    # Reasoning
    if reasoning >= 7:
        sentences.append("Clinical reasoning is explicitly documented.")
    elif reasoning <= 3:
        sentences.append("Documentation focuses on findings and conclusions.")

    # Formality
    if formality >= 7:
        sentences.append("Language is formal and structured throughout.")
    elif formality <= 3:
        sentences.append("Documentation style is conversational and accessible.")

    return " ".join(sentences[:4])
