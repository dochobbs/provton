"""
Strategic sampling for representative analysis.
"""

import random
from typing import List, Dict, Any


def sample_messages(
    categorized: Dict[str, List[Dict[str, Any]]],
    sample_size: int = 50,
    seed: int = 42
) -> Dict[str, List[Dict[str, Any]]]:
    """
    Sample messages from each category for analysis.

    Strategy:
    - Take up to sample_size from each category
    - Prioritize diversity (different dates, patients)
    - Include longest and shortest for range

    Args:
        categorized: Messages grouped by category
        sample_size: Max messages per category
        seed: Random seed for reproducibility

    Returns:
        Sampled messages by category
    """
    random.seed(seed)
    sampled = {}

    for category, messages in categorized.items():
        if len(messages) <= sample_size:
            sampled[category] = messages
            continue

        # Sort by length to ensure we get variety
        by_length = sorted(messages, key=lambda m: len(m.get("body", "")))

        # Always include shortest and longest
        selected = [by_length[0], by_length[-1]]

        # Sample from different length quartiles
        quartile_size = len(by_length) // 4
        for i in range(4):
            start = i * quartile_size
            end = start + quartile_size if i < 3 else len(by_length)
            quartile = by_length[start:end]

            # Sample from this quartile
            remaining_slots = (sample_size - len(selected)) // (4 - i)
            sample_from_quartile = min(remaining_slots, len(quartile))

            if sample_from_quartile > 0:
                selected.extend(random.sample(quartile, sample_from_quartile))

        # Deduplicate (in case shortest/longest were also sampled)
        seen_ids = set()
        unique = []
        for msg in selected:
            msg_id = msg.get("message_id", id(msg))
            if msg_id not in seen_ids:
                seen_ids.add(msg_id)
                unique.append(msg)

        sampled[category] = unique[:sample_size]

    return sampled


def sample_notes(
    categorized: Dict[str, List[Dict[str, Any]]],
    sample_size: int = 50,
    seed: int = 42
) -> Dict[str, List[Dict[str, Any]]]:
    """
    Sample notes from each visit type for analysis.

    Strategy:
    - Take up to sample_size from each visit type
    - Include variety of note lengths
    - Prefer notes with complete sections

    Args:
        categorized: Notes grouped by visit type
        sample_size: Max notes per visit type
        seed: Random seed for reproducibility

    Returns:
        Sampled notes by visit type
    """
    random.seed(seed)
    sampled = {}

    for visit_type, notes in categorized.items():
        if len(notes) <= sample_size:
            sampled[visit_type] = notes
            continue

        # Score notes by completeness
        def completeness_score(note):
            content = note.get("content", {})
            if isinstance(content, str):
                return 1 if content else 0

            sections = ["hpi", "physical_exam", "assessment", "plan"]
            return sum(1 for s in sections if content.get(s))

        # Sort by completeness, then by content length
        scored = [(n, completeness_score(n)) for n in notes]
        scored.sort(key=lambda x: (-x[1], -len(str(x[0].get("content", "")))))

        # Take top by completeness, then random sample from rest
        complete_notes = [n for n, s in scored if s >= 3]
        other_notes = [n for n, s in scored if s < 3]

        selected = complete_notes[:sample_size // 2]
        remaining = sample_size - len(selected)

        if remaining > 0 and other_notes:
            selected.extend(random.sample(other_notes, min(remaining, len(other_notes))))

        sampled[visit_type] = selected[:sample_size]

    return sampled
