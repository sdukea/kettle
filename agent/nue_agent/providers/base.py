from collections.abc import AsyncIterator
from dataclasses import dataclass
from typing import Protocol


@dataclass(frozen=True)
class Turn:
    """One finished utterance, kept as context for later translations."""

    speaker: str
    language: str
    text: str
    translation: str


class STT(Protocol):
    async def transcribe(self, pcm: bytes, sample_rate: int, language: str) -> str:
        """Transcribe one complete utterance (16-bit mono PCM)."""
        ...


class Translator(Protocol):
    async def translate(
        self, text: str, source: str, target: str, history: list[Turn]
    ) -> str: ...


class TTS(Protocol):
    sample_rate: int

    def synthesize(self, text: str, language: str) -> AsyncIterator[bytes]:
        """Yield 16-bit mono PCM chunks at `sample_rate`."""
        ...
