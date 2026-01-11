"""
Text file loader for directories of notes/messages.
"""

import re
from typing import List, Dict, Any
from pathlib import Path
from datetime import datetime

from .base import BaseLoader


class TextLoader(BaseLoader):
    """Load data from directory of text files."""

    def load(self, path: str, data_type: str = "messages") -> List[Dict[str, Any]]:
        """
        Load messages or notes from directory of text files.

        Filename patterns:
            messages: {date}_{patient_id}_{subject}.txt
            notes: {date}_{patient_id}_{visit_type}.txt

        Or metadata in first lines:
            ---
            provider_id: dr-smith
            patient_id: pt123
            date: 2024-06-15
            ---
        """
        p = Path(path)
        if not p.is_dir():
            raise ValueError(f"Expected directory, got file: {path}")

        records = []
        for file_path in sorted(p.glob("*.txt")):
            content = file_path.read_text()
            metadata = self._extract_metadata(content, file_path.name)

            if data_type == "messages":
                records.append(self.validate_message({
                    "message_id": file_path.stem,
                    "body": self._get_body(content),
                    **metadata
                }))
            else:
                records.append(self.validate_note({
                    "note_id": file_path.stem,
                    "content": {"full_text": self._get_body(content)},
                    **metadata
                }))

        return records

    def _extract_metadata(self, content: str, filename: str) -> Dict[str, Any]:
        """Extract metadata from content header or filename."""
        metadata = {}

        # Try YAML-like header
        if content.startswith("---"):
            parts = content.split("---", 2)
            if len(parts) >= 3:
                header = parts[1]
                for line in header.strip().split("\n"):
                    if ":" in line:
                        key, value = line.split(":", 1)
                        metadata[key.strip().lower().replace(" ", "_")] = value.strip()

        # Try filename parsing: date_patientid_type.txt
        if not metadata:
            parts = filename.replace(".txt", "").split("_")
            if len(parts) >= 2:
                # First part might be date
                if re.match(r"\d{4}-\d{2}-\d{2}", parts[0]):
                    metadata["created_at"] = parts[0]
                    metadata["sent_at"] = parts[0]
                    if len(parts) >= 2:
                        metadata["patient_id"] = parts[1]
                    if len(parts) >= 3:
                        metadata["visit_type"] = parts[2]

        return metadata

    def _get_body(self, content: str) -> str:
        """Extract body content, removing metadata header if present."""
        if content.startswith("---"):
            parts = content.split("---", 2)
            if len(parts) >= 3:
                return parts[2].strip()
        return content.strip()
