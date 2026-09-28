"""Picks a provider for each stage, per language.

Languages without an explicit entry use the defaults. Add an override when a
provider is measurably better for a language (see the roadmap: each language is
tested for accuracy and speed before it ships).
"""

from collections.abc import Callable
from dataclasses import dataclass, field

from .base import STT, TTS, Translator
from .fake import FakeSTT, FakeTranslator, SilentTTS


@dataclass
class Providers:
    stt: STT
    translator: Translator
    tts: TTS


@dataclass
class Registry:
    default_stt: Callable[[], STT] = FakeSTT
    default_translator: Callable[[], Translator] = FakeTranslator
    default_tts: Callable[[], TTS] = SilentTTS
    stt_by_language: dict[str, Callable[[], STT]] = field(default_factory=dict)
    tts_by_language: dict[str, Callable[[], TTS]] = field(default_factory=dict)

    def for_pair(self, source: str, target: str) -> Providers:
        """Providers for one direction: hear `source`, speak `target`."""
        return Providers(
            stt=self.stt_by_language.get(source, self.default_stt)(),
            translator=self.default_translator(),
            tts=self.tts_by_language.get(target, self.default_tts)(),
        )


registry = Registry()


def configure_from_env() -> None:
    """Swap in real providers when their keys are present."""
    import os

    if os.getenv("ANTHROPIC_API_KEY"):
        from .claude import ClaudeTranslator

        registry.default_translator = ClaudeTranslator
    # TODO: register STT/TTS providers (Deepgram, ElevenLabs, ...) per language.
