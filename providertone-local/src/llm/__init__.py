"""
LLM client implementations.
"""

from .claude_client import ClaudeClient
from .base import BaseLLMClient

__all__ = ["ClaudeClient", "BaseLLMClient", "get_llm_client"]


def get_llm_client(llm_type: str = "claude") -> BaseLLMClient:
    """
    Factory function to get appropriate LLM client.

    Args:
        llm_type: "claude" or "local"

    Returns:
        LLM client instance
    """
    if llm_type == "claude":
        return ClaudeClient()
    elif llm_type == "local":
        from .local_client import LocalLLMClient
        return LocalLLMClient()
    else:
        raise ValueError(f"Unknown LLM type: {llm_type}")
