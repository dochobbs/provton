"""
Input validation utilities.
"""

from typing import List, Dict, Any
from pathlib import Path


def validate_input_data(
    data: List[Dict[str, Any]],
    data_type: str = "messages"
) -> List[str]:
    """
    Validate input data and return list of warnings.

    Args:
        data: List of message or note dictionaries
        data_type: "messages" or "notes"

    Returns:
        List of warning messages (empty if all valid)
    """
    warnings = []

    if not data:
        warnings.append("No data loaded")
        return warnings

    if data_type == "messages":
        warnings.extend(_validate_messages(data))
    else:
        warnings.extend(_validate_notes(data))

    return warnings


def _validate_messages(messages: List[Dict[str, Any]]) -> List[str]:
    """Validate message data."""
    warnings = []

    empty_body_count = 0
    missing_provider_count = 0

    for msg in messages:
        if not msg.get("body", "").strip():
            empty_body_count += 1
        if not msg.get("provider_id"):
            missing_provider_count += 1

    if empty_body_count > 0:
        warnings.append(f"{empty_body_count} messages have empty body")

    if missing_provider_count > 0:
        warnings.append(f"{missing_provider_count} messages missing provider_id")

    # Check for diversity
    if len(messages) < 10:
        warnings.append("Fewer than 10 messages - results may not be representative")

    return warnings


def _validate_notes(notes: List[Dict[str, Any]]) -> List[str]:
    """Validate note data."""
    warnings = []

    empty_content_count = 0
    missing_provider_count = 0

    for note in notes:
        content = note.get("content", {})
        if isinstance(content, dict):
            has_content = any(content.values())
        else:
            has_content = bool(content)

        if not has_content:
            empty_content_count += 1

        if not note.get("provider_id"):
            missing_provider_count += 1

    if empty_content_count > 0:
        warnings.append(f"{empty_content_count} notes have empty content")

    if missing_provider_count > 0:
        warnings.append(f"{missing_provider_count} notes missing provider_id")

    if len(notes) < 10:
        warnings.append("Fewer than 10 notes - results may not be representative")

    return warnings


def validate_file_path(path: str, must_exist: bool = True) -> str:
    """
    Validate file path.

    Args:
        path: Path to validate
        must_exist: Whether path must exist

    Returns:
        Validated path string

    Raises:
        ValueError: If path is invalid
    """
    p = Path(path)

    if must_exist and not p.exists():
        raise ValueError(f"Path does not exist: {path}")

    return str(p.resolve())


def validate_provider_id(provider_id: str) -> str:
    """
    Validate and normalize provider ID.

    Args:
        provider_id: Provider identifier

    Returns:
        Normalized provider ID

    Raises:
        ValueError: If provider ID is invalid
    """
    if not provider_id or not provider_id.strip():
        raise ValueError("Provider ID cannot be empty")

    # Normalize: lowercase, strip whitespace
    normalized = provider_id.strip().lower()

    # Replace spaces with dashes
    normalized = normalized.replace(" ", "-")

    return normalized
