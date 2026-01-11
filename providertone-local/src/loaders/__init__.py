"""
Data loaders for various export formats.
"""

from .base import BaseLoader
from .csv_loader import CSVLoader
from .json_loader import JSONLoader
from .text_loader import TextLoader

__all__ = ["BaseLoader", "CSVLoader", "JSONLoader", "TextLoader", "load_data"]


def load_data(path: str, data_type: str = "messages") -> list:
    """
    Load data from file or directory, auto-detecting format.

    Args:
        path: Path to file or directory
        data_type: "messages" or "notes"

    Returns:
        List of message or note dictionaries
    """
    from pathlib import Path

    p = Path(path)

    if p.is_dir():
        # Directory of text files
        loader = TextLoader()
        return loader.load(path, data_type=data_type)
    elif p.suffix.lower() == ".csv":
        loader = CSVLoader()
        return loader.load(path, data_type=data_type)
    elif p.suffix.lower() == ".json":
        loader = JSONLoader()
        return loader.load(path, data_type=data_type)
    else:
        raise ValueError(f"Unsupported file format: {p.suffix}")
