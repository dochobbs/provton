"""
Preprocess and categorize portal messages.
"""

import re
from typing import List, Dict, Any
from collections import defaultdict


# Keywords for message categorization
CATEGORY_KEYWORDS = {
    "anxious_urgent": [
        "worried", "anxious", "scared", "concerned", "emergency", "urgent",
        "fever", "can't breathe", "chest pain", "severe", "worse", "help",
        "terrified", "panic", "immediately", "asap", "right away"
    ],
    "frustrated": [
        "frustrated", "upset", "angry", "unacceptable", "waiting", "still",
        "no one", "called", "never", "disappointed", "ridiculous", "terrible",
        "complaint", "wrong", "mistake", "incompetent"
    ],
    "mental_health": [
        "depressed", "depression", "anxiety", "anxious", "mood", "feeling down",
        "therapy", "counselor", "stress", "overwhelmed", "sleep", "can't sleep",
        "suicidal", "hurt myself", "hopeless", "medication", "antidepressant"
    ],
    "medication_refill": [
        "refill", "prescription", "medication", "medicine", "pharmacy",
        "ran out", "running low", "need more", "renew"
    ],
    "results_lab": [
        "results", "lab", "test", "bloodwork", "imaging", "x-ray", "mri",
        "ct scan", "biopsy", "report", "findings"
    ],
    "scheduling_admin": [
        "appointment", "schedule", "reschedule", "cancel", "available",
        "referral", "records", "forms", "paperwork", "insurance", "bill"
    ],
    "symptom_report": [
        "symptom", "pain", "ache", "hurt", "swelling", "rash", "cough",
        "headache", "nausea", "vomiting", "diarrhea", "fever", "tired"
    ],
}


def categorize_message(message: Dict[str, Any]) -> str:
    """
    Categorize a message by its content.

    Args:
        message: Message dictionary with 'body' and optionally 'subject'

    Returns:
        Category string
    """
    text = (message.get("body", "") + " " + message.get("subject", "")).lower()

    # Score each category
    scores = {}
    for category, keywords in CATEGORY_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in text)
        if score > 0:
            scores[category] = score

    if not scores:
        return "general"

    # Return highest scoring category
    return max(scores, key=scores.get)


def preprocess_messages(messages: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
    """
    Categorize all messages into groups.

    Args:
        messages: List of message dictionaries

    Returns:
        Dictionary mapping category to list of messages
    """
    categorized = defaultdict(list)

    for msg in messages:
        # Only process outbound messages (provider responses)
        if msg.get("direction", "outbound") != "outbound":
            continue

        # Skip empty messages
        if not msg.get("body", "").strip():
            continue

        category = categorize_message(msg)
        categorized[category].append(msg)

    return dict(categorized)


def filter_by_date(
    messages: List[Dict[str, Any]],
    start_date: str = None,
    end_date: str = None
) -> List[Dict[str, Any]]:
    """
    Filter messages by date range.

    Args:
        messages: List of messages
        start_date: Start date (YYYY-MM-DD), inclusive
        end_date: End date (YYYY-MM-DD), inclusive

    Returns:
        Filtered list of messages
    """
    if not start_date and not end_date:
        return messages

    filtered = []
    for msg in messages:
        date_str = msg.get("sent_at", "")[:10]  # Get just date part
        if not date_str:
            continue

        if start_date and date_str < start_date:
            continue
        if end_date and date_str > end_date:
            continue

        filtered.append(msg)

    return filtered
