"""
Local LLM client (Ollama) for air-gapped environments.
"""

import os
import json
import requests
from typing import Optional

from .base import BaseLLMClient


class LocalLLMClient(BaseLLMClient):
    """Client for local LLM via Ollama API."""

    def __init__(
        self,
        endpoint: Optional[str] = None,
        model: Optional[str] = None
    ):
        """
        Initialize local LLM client.

        Args:
            endpoint: Ollama API endpoint (defaults to env var or localhost)
            model: Model name (defaults to env var or llama3)
        """
        self.endpoint = (
            endpoint
            or os.environ.get("LOCAL_LLM_ENDPOINT")
            or "http://localhost:11434"
        )
        self.model = (
            model
            or os.environ.get("LOCAL_LLM_MODEL")
            or "llama3"
        )

    def analyze(self, prompt: str) -> str:
        """
        Send analysis prompt to local LLM.

        Args:
            prompt: Analysis prompt

        Returns:
            LLM response text
        """
        system = """You are analyzing healthcare provider communication patterns.
Your goal is to extract style patterns that can be used to generate content in their voice.

Important:
- Be specific and evidence-based
- Quote exact phrases when relevant
- Provide numerical scores (1-10) with justification
- Respond with valid JSON only - no markdown, no explanation"""

        # Ollama API format
        url = f"{self.endpoint}/api/generate"
        payload = {
            "model": self.model,
            "prompt": prompt,
            "system": system,
            "stream": False,
            "options": {
                "num_predict": 4096,
                "temperature": 0.3,
            }
        }

        try:
            response = requests.post(url, json=payload, timeout=300)
            response.raise_for_status()
            result = response.json()
            return result.get("response", "")
        except requests.exceptions.ConnectionError:
            raise ConnectionError(
                f"Could not connect to local LLM at {self.endpoint}. "
                "Make sure Ollama is running: `ollama serve`"
            )
        except requests.exceptions.Timeout:
            raise TimeoutError(
                "Local LLM request timed out. The model may be too slow for this analysis."
            )

    def check_connection(self) -> bool:
        """Check if local LLM is available."""
        try:
            response = requests.get(f"{self.endpoint}/api/tags", timeout=5)
            return response.status_code == 200
        except:
            return False

    def list_models(self) -> list:
        """List available models."""
        try:
            response = requests.get(f"{self.endpoint}/api/tags", timeout=5)
            if response.status_code == 200:
                data = response.json()
                return [m["name"] for m in data.get("models", [])]
        except:
            pass
        return []
