from nue_agent.pipeline import Direction, Speaker
from nue_agent.providers.fake import FakeSTT, FakeTranslator, SilentTTS
from nue_agent.providers.registry import Providers


def make(text: str, history: list) -> Direction:
    return Direction(
        Speaker("a", "ta"),
        Speaker("b", "en"),
        Providers(FakeSTT(text), FakeTranslator(), SilentTTS()),
        history,
    )


async def test_translates_and_records_history():
    history: list = []
    result = await make("vanakkam", history).handle_utterance(b"", 16000)
    assert result and result.translation == "[ta->en] vanakkam"
    assert history[0].text == "vanakkam"


async def test_silence_is_ignored():
    history: list = []
    assert await make("  ", history).handle_utterance(b"", 16000) is None
    assert history == []
