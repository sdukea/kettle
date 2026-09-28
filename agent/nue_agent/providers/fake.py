"""Stand-in providers for tests and offline development."""

from collections.abc import AsyncIterator

from .base import Turn


class FakeSTT:
    def __init__(self, text: str = "") -> None:
        self.text = text

    async def transcribe(self, pcm: bytes, sample_rate: int, language: str) -> str:
        return self.text


class FakeTranslator:
    async def translate(self, text: str, source: str, target: str, history: list[Turn]) -> str:
        return f"[{source}->{target}] {text}"


class SilentTTS:
    sample_rate = 24000

    async def synthesize(self, text: str, language: str) -> AsyncIterator[bytes]:
        # 20ms of silence per word, so timing roughly tracks text length.
        for _ in text.split():
            yield b"\x00\x00" * (self.sample_rate // 50)
