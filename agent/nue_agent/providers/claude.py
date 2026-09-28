"""Context-aware translation with Claude."""

import os

from anthropic import AsyncAnthropic

from .base import Turn

SYSTEM = """You are the interpreter on a live phone call between two people who speak different languages.
Translate the latest utterance from {source} into {target}.
Carry the speaker's meaning, tone and register, not a word-for-word rendering. Keep names as spoken.
Speakers often mix languages (e.g. Tanglish, Hinglish); translate the whole utterance into {target}.
Reply with the translation only: it will be spoken aloud as-is."""


class ClaudeTranslator:
    def __init__(self, model: str | None = None, history_turns: int = 8) -> None:
        self.client = AsyncAnthropic()
        self.model = model or os.getenv("NUE_TRANSLATE_MODEL", "claude-opus-5")
        self.history_turns = history_turns

    async def translate(self, text: str, source: str, target: str, history: list[Turn]) -> str:
        context = "\n".join(
            f"{t.speaker} ({t.language}): {t.text}" for t in history[-self.history_turns :]
        )
        prompt = f"<conversation>\n{context}\n</conversation>\n\n<utterance>{text}</utterance>"
        response = await self.client.beta.messages.create(
            model=self.model,
            max_tokens=1024,
            system=SYSTEM.format(source=source, target=target),
            messages=[{"role": "user", "content": prompt}],
            # Latency matters more than depth here: one short utterance at a time.
            output_config={"effort": "low"},
            betas=["server-side-fallback-2026-07-01"],
            fallbacks="default",
        )
        if response.stop_reason == "refusal":
            return ""
        return "".join(b.text for b in response.content if b.type == "text").strip()
