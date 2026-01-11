"""
CSV data loader.
"""

from typing import List, Dict, Any
from pathlib import Path
import pandas as pd

from .base import BaseLoader


class CSVLoader(BaseLoader):
    """Load data from CSV files."""

    def load(self, path: str, data_type: str = "messages") -> List[Dict[str, Any]]:
        """
        Load messages or notes from CSV.

        Expected CSV columns for messages:
            message_id, provider_id, patient_id, direction, sent_at, subject, body

        Expected CSV columns for notes:
            note_id, provider_id, patient_id, note_type, visit_type, created_at,
            chief_complaint, hpi, physical_exam, assessment, plan
        """
        df = pd.read_csv(path)

        # Normalize column names
        df.columns = [c.lower().strip().replace(" ", "_") for c in df.columns]

        records = df.to_dict("records")

        if data_type == "messages":
            return [self.validate_message(r) for r in records]
        else:
            return [self._parse_note_row(r) for r in records]

    def _parse_note_row(self, row: Dict[str, Any]) -> Dict[str, Any]:
        """Parse a CSV row into note format."""
        # Build content from separate columns if present
        content = {}

        if "hpi" in row and row["hpi"]:
            content["hpi"] = str(row["hpi"])
        if "physical_exam" in row and row["physical_exam"]:
            content["physical_exam"] = str(row["physical_exam"])
        if "ros" in row and row["ros"]:
            content["ros"] = str(row["ros"])
        if "assessment" in row and row["assessment"]:
            content["assessment"] = str(row["assessment"])
        if "plan" in row and row["plan"]:
            content["plan"] = str(row["plan"])

        # If no structured content, look for full_text or content column
        if not content:
            if "content" in row:
                content = {"full_text": str(row["content"])}
            elif "full_text" in row:
                content = {"full_text": str(row["full_text"])}
            elif "note_text" in row:
                content = {"full_text": str(row["note_text"])}

        row["content"] = content
        return self.validate_note(row)
