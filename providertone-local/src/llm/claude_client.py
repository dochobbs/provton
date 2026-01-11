"""
Claude API client for analysis.
"""

import os
from typing import Optional
from anthropic import Anthropic

from .base import BaseLLMClient


class ClaudeClient(BaseLLMClient):
    """Client for Claude API analysis."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        model: str = "claude-sonnet-4-5-20250514"
    ):
        """
        Initialize Claude client.

        Args:
            api_key: Anthropic API key (defaults to env var)
            base_url: Custom API base URL (optional)
            model: Model to use
        """
        self.client = Anthropic(
            api_key=api_key or os.environ.get("ANTHROPIC_API_KEY"),
            base_url=base_url or os.environ.get("ANTHROPIC_BASE_URL"),
        )
        self.model = model

    def analyze(self, prompt: str) -> str:
        """
        Send analysis prompt to Claude and get response.

        Args:
            prompt: Analysis prompt

        Returns:
            Claude's response text
        """
        response = self.client.messages.create(
            model=self.model,
            max_tokens=4096,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            system="""You are analyzing healthcare provider communication patterns.
Your goal is to extract style patterns that can be used to generate content in their voice.

Important:
- Be specific and evidence-based
- Quote exact phrases when relevant
- Provide numerical scores (1-10) with justification
- Respond with valid JSON only - no markdown, no explanation"""
        )

        return response.content[0].text

    def analyze_with_system(self, prompt: str, system: str) -> str:
        """
        Send analysis prompt with custom system prompt.

        Args:
            prompt: User prompt
            system: System prompt

        Returns:
            Claude's response text
        """
        response = self.client.messages.create(
            model=self.model,
            max_tokens=4096,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            system=system
        )

        return response.content[0].text
