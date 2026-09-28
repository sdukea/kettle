"""One direction of a call: hear one speaker, speak to the other.

A call runs two of these, one each way. The pipeline is transport-agnostic so it
can run on recorded audio (roadmap step 1) as well as live on a call.
"""

import asyncio
from collections.abc import AsyncIterator, Awaitable, Callable
from dataclasses import dataclass

from .providers import Providers, Turn


@dataclass(frozen=True)
class Speaker:
    identity: str
    language: str


@dataclass(frozen=True)
class Result:
    speaker: Speaker
    transcript: str
    translation: str


class Direction:
    def __init__(
        self,
        source: Speaker,
        target: Speaker,
        providers: Providers,
        history: list[Turn],
        on_result: Callable[[Result], Awaitable[None]] | None = None,
    ) -> None:
        self.source = source
        self.target = target
        self.providers = providers
        self.history = history  # shared by both directions, so context spans the call
        self.on_result = on_result
        self._speaking: asyncio.Task | None = None

    async def handle_utterance(self, pcm: bytes, sample_rate: int) -> Result | None:
        """Understand + translate one finished utterance (after the speaker pauses)."""
        text = await self.providers.stt.transcribe(pcm, sample_rate, self.source.language)
        if not text.strip():
            return None
        translation = await self.providers.translator.translate(
            text, self.source.language, self.target.language, self.history
        )
        self.history.append(Turn(self.source.identity, self.source.language, text, translation))
        result = Result(self.source, text, translation)
        if self.on_result:
            await self.on_result(result)
        return result

    def speak(self, text: str) -> AsyncIterator[bytes]:
        return self.providers.tts.synthesize(text, self.target.language)

    def interrupt(self) -> None:
        """The live speaker always wins: stop talking over them."""
        if self._speaking and not self._speaking.done():
            self._speaking.cancel()

    def track_speaking(self, task: asyncio.Task) -> None:
        self.interrupt()
        self._speaking = task
