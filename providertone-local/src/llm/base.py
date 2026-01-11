"""
Base LLM client interface.
"""

from abc import ABC, abstractmethod
from typing import List


class BaseLLMClient(ABC):
    """Abstract base class for LLM clients."""

    @abstractmethod
    def analyze(self, prompt: str) -> str:
        """
        Send analysis prompt and get response.

        Args:
            prompt: The analysis prompt

        Returns:
            LLM response text
        """
        pass

    def batch_analyze(self, prompts: List[str], delay: float = 1.0) -> List[str]:
        """
        Analyze multiple prompts with rate limiting.

        Args:
            prompts: List of prompts
            delay: Seconds between requests

        Returns:
            List of responses
        """
        import time

        results = []
        for i, prompt in enumerate(prompts):
            if i > 0:
                time.sleep(delay)
            results.append(self.analyze(prompt))

        return results
