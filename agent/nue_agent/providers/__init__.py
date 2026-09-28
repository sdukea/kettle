"""Provider interfaces and the per-language registry.

Each stage (speech-to-text, translation, text-to-speech) is a small protocol so
that every language can use whichever provider handles it best.
"""

from .base import STT, TTS, Translator, Turn
from .registry import Providers, registry

__all__ = ["STT", "TTS", "Translator", "Turn", "Providers", "registry"]
