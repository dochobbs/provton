"""
JSON data loader.
"""

import json
from typing import List, Dict, Any
from pathlib import Path

from .base import BaseLoader


class JSONLoader(BaseLoader):
    """Load data from JSON files."""

    def load(self, path: str, data_type: str = "messages") -> List[Dict[str, Any]]:
        """
        Load messages or notes from JSON.

        Expected format:
        {
            "messages": [...] or "notes": [...]
        }
        or just a list: [...]
        """
        with open(path, "r") as f:
            data = json.load(f)

        # Handle different JSON structures
        if isinstance(data, list):
            records = data
        elif isinstance(data, dict):
            if data_type == "messages" and "messages" in data:
                records = data["messages"]
            elif data_type == "notes" and "notes" in data:
                records = data["notes"]
            elif "data" in data:
                records = data["data"]
            elif "records" in data:
                records = data["records"]
            else:
                # Assume the dict values are the records
                records = list(data.values())[0] if data else []
        else:
            raise ValueError(f"Unexpected JSON structure in {path}")

        if data_type == "messages":
            return [self.validate_message(r) for r in records]
        else:
            return [self.validate_note(r) for r in records]
