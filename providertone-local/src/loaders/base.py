"""
Base loader class.
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any


class BaseLoader(ABC):
    """Abstract base class for data loaders."""

    @abstractmethod
    def load(self, path: str, data_type: str = "messages") -> List[Dict[str, Any]]:
        """
        Load data from path.

        Args:
            path: Path to file or directory
            data_type: "messages" or "notes"

        Returns:
            List of dictionaries with standardized keys
        """
        pass

    def validate_message(self, msg: Dict[str, Any]) -> Dict[str, Any]:
        """Ensure message has required fields."""
        return {
            "message_id": msg.get("message_id", msg.get("id", "")),
            "provider_id": msg.get("provider_id", ""),
            "patient_id": msg.get("patient_id", ""),
            "direction": msg.get("direction", "outbound"),
            "sent_at": msg.get("sent_at", msg.get("date", "")),
            "subject": msg.get("subject", ""),
            "body": msg.get("body", msg.get("content", msg.get("text", ""))),
        }

    def validate_note(self, note: Dict[str, Any]) -> Dict[str, Any]:
        """Ensure note has required fields."""
        content = note.get("content", {})
        if isinstance(content, str):
            content = {"full_text": content}

        return {
            "note_id": note.get("note_id", note.get("id", "")),
            "provider_id": note.get("provider_id", ""),
            "patient_id": note.get("patient_id", ""),
            "note_type": note.get("note_type", "progress_note"),
            "visit_type": note.get("visit_type", ""),
            "created_at": note.get("created_at", note.get("date", "")),
            "chief_complaint": note.get("chief_complaint", ""),
            "content": content,
        }
