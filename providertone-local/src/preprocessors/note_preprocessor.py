"""
Preprocess and categorize clinical notes.
"""

import re
from typing import List, Dict, Any
from collections import defaultdict


# Visit type detection patterns
VISIT_TYPE_PATTERNS = {
    "acute": [
        r"acute", r"sick visit", r"urgent", r"same[- ]day",
        r"ear pain", r"sore throat", r"fever", r"cough", r"rash",
        r"injury", r"laceration", r"sprain"
    ],
    "chronic_followup": [
        r"follow[- ]?up", r"chronic", r"diabetes", r"hypertension",
        r"htn", r"dm2?", r"copd", r"asthma", r"management",
        r"quarterly", r"annual review"
    ],
    "well_visit": [
        r"well[- ]?child", r"well[- ]?visit", r"annual", r"physical",
        r"preventive", r"wellness", r"health maintenance",
        r"immunization", r"vaccination", r"\d+[- ]?(month|year)[- ]?check"
    ],
    "mental_health": [
        r"mental health", r"psychiatric", r"depression", r"anxiety",
        r"therapy", r"counseling", r"mood", r"behavioral",
        r"adhd", r"add", r"bipolar", r"ptsd"
    ],
    "procedure": [
        r"procedure", r"biopsy", r"excision", r"injection",
        r"removal", r"repair", r"suture"
    ],
}


def categorize_note(note: Dict[str, Any]) -> str:
    """
    Categorize a note by visit type.

    Args:
        note: Note dictionary

    Returns:
        Visit type string
    """
    # First check explicit visit_type field
    explicit_type = note.get("visit_type", "").lower()
    if explicit_type:
        for visit_type in VISIT_TYPE_PATTERNS:
            if visit_type in explicit_type or explicit_type in visit_type:
                return visit_type

    # Build searchable text
    content = note.get("content", {})
    if isinstance(content, str):
        text = content
    else:
        text = " ".join([
            note.get("chief_complaint", ""),
            content.get("hpi", ""),
            content.get("assessment", ""),
            note.get("note_type", ""),
        ])
    text = text.lower()

    # Score each type
    scores = {}
    for visit_type, patterns in VISIT_TYPE_PATTERNS.items():
        score = sum(1 for p in patterns if re.search(p, text))
        if score > 0:
            scores[visit_type] = score

    if not scores:
        return "general"

    return max(scores, key=scores.get)


def preprocess_notes(notes: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
    """
    Categorize all notes by visit type.

    Args:
        notes: List of note dictionaries

    Returns:
        Dictionary mapping visit type to list of notes
    """
    categorized = defaultdict(list)

    for note in notes:
        # Skip notes without content
        content = note.get("content", {})
        if isinstance(content, dict):
            has_content = any(content.values())
        else:
            has_content = bool(content)

        if not has_content:
            continue

        visit_type = categorize_note(note)
        categorized[visit_type].append(note)

    return dict(categorized)


def filter_by_note_type(
    notes: List[Dict[str, Any]],
    note_types: List[str]
) -> List[Dict[str, Any]]:
    """
    Filter notes by note type.

    Args:
        notes: List of notes
        note_types: List of note types to include (e.g., ["progress", "visit"])

    Returns:
        Filtered list of notes
    """
    if not note_types:
        return notes

    note_types_lower = [t.lower() for t in note_types]

    return [
        n for n in notes
        if any(t in n.get("note_type", "").lower() for t in note_types_lower)
    ]
