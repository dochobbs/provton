"""
Generate website-compatible MessagingStyleProfile from analysis.
"""

from typing import Dict, Any, List


def generate_messaging_profile(analysis: Dict[str, Any]) -> Dict[str, Any]:
    """
    Convert raw analysis into website-compatible StyleProfile format.

    Args:
        analysis: Raw analysis from messaging_analyzer

    Returns:
        StyleProfile dict matching website schema exactly
    """
    surface = analysis.get('surface_patterns', {})
    tones = analysis.get('tone_dimensions', {})
    phrases = analysis.get('distinctive_phrases', {})
    behavioral = analysis.get('behavioral_patterns', {})
    category_analyses = analysis.get('category_analyses', {})

    # Build surface patterns
    surface_patterns = {
        'greetings': format_greeting_description(surface.get('greetings', [])),
        'closings': format_closing_description(surface.get('closings', [])),
        'lengthTendency': format_length_description(surface.get('length_tendency', 'medium')),
        'paragraphStructure': infer_paragraph_structure(analysis),
        'punctuationPatterns': infer_punctuation_patterns(analysis),
    }

    # Build tone dimensions (with descriptions)
    tone_dimensions = {}
    for tone_name in ['warmth', 'certainty', 'directiveness', 'formality', 'thoroughness']:
        score = tones.get(tone_name, 5)
        if isinstance(score, dict):
            score = score.get('score', 5)
        score = round(float(score))
        tone_dimensions[tone_name] = {
            'score': max(1, min(10, score)),
            'description': generate_tone_description(tone_name, score, analysis)
        }

    # Build negative constraints
    negative_constraints = {
        'neverUsePhrases': phrases.get('avoided', [])[:5],
        'neverUsePatterns': extract_avoided_patterns(analysis),
        'avoid': extract_general_avoidances(analysis),
    }

    # Build judgment patterns
    judgment_patterns = {
        'uncertaintyHandling': extract_uncertainty_pattern(analysis),
        'escalationStyle': extract_escalation_pattern(category_analyses),
        'decliningRequests': extract_decline_pattern(category_analyses),
        'emotionalResponsiveness': extract_emotional_pattern(behavioral),
        'afterHoursApproach': extract_after_hours_pattern(category_analyses),
    }

    # Build signature moves
    signature_moves = extract_signature_moves(analysis)

    # Build voice summary
    voice_summary = generate_voice_summary(analysis)

    # Build example fragments
    example_fragments = (phrases.get('signature', []) + phrases.get('frequent', []))[:8]

    return {
        'surfacePatterns': surface_patterns,
        'toneDimensions': tone_dimensions,
        'negativeConstraints': negative_constraints,
        'judgmentPatterns': judgment_patterns,
        'signatureMoves': signature_moves,
        'voiceSummary': voice_summary,
        'exampleFragments': example_fragments,
    }


def format_greeting_description(greetings: List[str]) -> str:
    """Format greeting list into natural description."""
    if not greetings:
        return "Professional greeting"

    # Clean up greetings
    clean = [g.strip() for g in greetings if g.strip()]
    if not clean:
        return "Professional greeting"

    if len(clean) == 1:
        return f'Uses "{clean[0]}"'

    examples = '", "'.join(clean[:3])
    return f'Varies greetings, commonly: "{examples}"'


def format_closing_description(closings: List[str]) -> str:
    """Format closing list into natural description."""
    if not closings:
        return "Professional sign-off"

    clean = [c.strip() for c in closings if c.strip()]
    if not clean:
        return "Professional sign-off"

    if len(clean) == 1:
        return f'Signs off with "{clean[0]}"'

    examples = '", "'.join(clean[:3])
    return f'Closing varies: "{examples}"'


def format_length_description(length: str) -> str:
    """Format length tendency into description."""
    descriptions = {
        'short': 'Brief and to the point (1-2 paragraphs)',
        'medium': 'Moderate length (2-3 paragraphs)',
        'long': 'Thorough and detailed (3+ paragraphs)',
    }
    return descriptions.get(length.lower(), 'Medium length (2-3 paragraphs)')


def infer_paragraph_structure(analysis: Dict) -> str:
    """Infer paragraph structure from analysis."""
    behavioral = analysis.get('behavioral_patterns', {})

    if behavioral.get('acknowledges_emotions'):
        return "Opens with empathy, then addresses clinical content, closes with next steps"
    elif behavioral.get('sets_clear_expectations'):
        return "Direct opening, clear information, explicit expectations"
    else:
        return "Balanced structure with greeting, content, and closing"


def infer_punctuation_patterns(analysis: Dict) -> str:
    """Infer punctuation patterns from analysis."""
    # This would ideally come from the analysis
    # For now, return a reasonable default
    return "Standard punctuation, occasional exclamation points for warmth"


def generate_tone_description(tone: str, score: int, analysis: Dict) -> str:
    """Generate natural language description of tone dimension."""
    descriptions = {
        'warmth': {
            (1, 3): "Clinical and reserved, focuses on facts over feelings",
            (4, 6): "Balanced warmth, professional but personable",
            (7, 10): "Highly warm and empathetic, prioritizes emotional connection"
        },
        'certainty': {
            (1, 3): "Frequently hedges, emphasizes uncertainty",
            (4, 6): "Appropriately confident with clear limitations",
            (7, 10): "Projects strong confidence, direct statements"
        },
        'directiveness': {
            (1, 3): "Collaborative, offers options and suggestions",
            (4, 6): "Balanced guidance with patient autonomy",
            (7, 10): "Clearly directive, tells patients what to do"
        },
        'formality': {
            (1, 3): "Casual and conversational",
            (4, 6): "Professional but approachable",
            (7, 10): "Formal and clinical"
        },
        'thoroughness': {
            (1, 3): "Brief and to the point",
            (4, 6): "Adequate detail for context",
            (7, 10): "Comprehensive, addresses multiple angles"
        }
    }

    for (low, high), desc in descriptions.get(tone, {}).items():
        if low <= score <= high:
            return desc

    return f"Moderate {tone}"


def extract_avoided_patterns(analysis: Dict) -> List[str]:
    """Extract avoided patterns from analysis."""
    patterns = []
    phrases = analysis.get('distinctive_phrases', {})

    if phrases.get('avoided'):
        # Convert avoided phrases to patterns
        for phrase in phrases['avoided'][:3]:
            patterns.append(f"Using '{phrase}'")

    return patterns


def extract_general_avoidances(analysis: Dict) -> List[str]:
    """Extract general things to avoid."""
    avoidances = []

    tones = analysis.get('tone_dimensions', {})
    formality = tones.get('formality', 5)
    if isinstance(formality, dict):
        formality = formality.get('score', 5)

    if formality >= 7:
        avoidances.append("Casual language or slang")
    elif formality <= 3:
        avoidances.append("Overly formal or stiff language")

    return avoidances


def extract_uncertainty_pattern(analysis: Dict) -> str:
    """Extract how provider handles uncertainty."""
    tones = analysis.get('tone_dimensions', {})
    certainty = tones.get('certainty', 5)
    if isinstance(certainty, dict):
        certainty = certainty.get('score', 5)

    if certainty >= 7:
        return "States professional opinion clearly, qualifies when appropriate"
    elif certainty <= 3:
        return "Openly acknowledges limitations, emphasizes shared uncertainty"
    else:
        return "Balanced expression of clinical judgment with appropriate caveats"


def extract_escalation_pattern(category_analyses: Dict) -> str:
    """Extract escalation style from urgent message analyses."""
    if 'anxious_urgent' in category_analyses:
        return "Validates concern while providing clear guidance"
    return "Provides clear triage guidance when escalation needed"


def extract_decline_pattern(category_analyses: Dict) -> str:
    """Extract how provider declines requests."""
    # Would ideally come from analysis of boundary-setting messages
    return "Acknowledges request, explains reasoning, offers alternatives when possible"


def extract_emotional_pattern(behavioral: Dict) -> str:
    """Extract emotional responsiveness pattern."""
    if behavioral.get('acknowledges_emotions'):
        return "Validates emotions before addressing clinical content"
    else:
        return "Addresses clinical content directly with professional empathy"


def extract_after_hours_pattern(category_analyses: Dict) -> str:
    """Extract after-hours message approach."""
    # Would ideally come from after-hours message analysis
    return "Acknowledges timing, provides brief guidance, sets expectations for follow-up"


def extract_signature_moves(analysis: Dict) -> List[str]:
    """Extract distinctive signature moves."""
    moves = []

    behavioral = analysis.get('behavioral_patterns', {})
    phrases = analysis.get('distinctive_phrases', {})

    if behavioral.get('acknowledges_emotions'):
        moves.append("Opens with emotional validation")

    if behavioral.get('asks_follow_up_questions'):
        moves.append("Ends with follow-up question to patient")

    if behavioral.get('provides_education'):
        moves.append("Includes brief patient education")

    if behavioral.get('sets_clear_expectations'):
        moves.append("Sets clear expectations for next steps")

    # Add signature phrases
    signature = phrases.get('signature', [])
    for phrase in signature[:2]:
        moves.append(f'Uses phrases like "{phrase}"')

    return moves[:5] or ["Professional, consistent communication style"]


def generate_voice_summary(analysis: Dict) -> str:
    """Generate 3-4 sentence prose summary of provider's voice."""
    tones = analysis.get('tone_dimensions', {})
    surface = analysis.get('surface_patterns', {})
    behavioral = analysis.get('behavioral_patterns', {})

    # Extract scores
    def get_score(tone):
        val = tones.get(tone, 5)
        return val.get('score', 5) if isinstance(val, dict) else val

    warmth = get_score('warmth')
    directiveness = get_score('directiveness')
    formality = get_score('formality')
    length = surface.get('length_tendency', 'medium')

    sentences = []

    # Warmth + formality combo
    if warmth >= 7 and formality <= 4:
        sentences.append("This provider communicates with notable warmth and approachability.")
    elif warmth >= 7:
        sentences.append("This provider balances professionalism with genuine warmth.")
    elif warmth <= 3:
        sentences.append("This provider maintains a clinical, factual communication style.")
    else:
        sentences.append("This provider communicates in a balanced, professional manner.")

    # Directiveness
    if directiveness >= 7:
        sentences.append("They give clear, direct guidance and are comfortable telling patients what to do.")
    elif directiveness <= 3:
        sentences.append("They prefer collaborative decision-making and presenting options rather than directives.")

    # Behavioral
    if behavioral.get('acknowledges_emotions'):
        sentences.append("They typically acknowledge patient emotions before addressing clinical concerns.")

    # Length
    if length == 'short':
        sentences.append("Messages tend to be concise and action-oriented.")
    elif length == 'long':
        sentences.append("Messages are thorough, often providing detailed context and explanation.")

    return " ".join(sentences[:4])
