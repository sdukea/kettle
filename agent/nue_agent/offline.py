"""Run one direction on a recorded WAV file (roadmap step 1: prove it).

    python -m nue_agent.offline speech.wav --source ta --target en
"""

import argparse
import asyncio
import time
import wave

from dotenv import load_dotenv

from .pipeline import Direction, Speaker
from .providers.registry import configure_from_env, registry


async def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("wav")
    parser.add_argument("--source", required=True)
    parser.add_argument("--target", required=True)
    args = parser.parse_args()

    with wave.open(args.wav, "rb") as w:
        if w.getsampwidth() != 2 or w.getnchannels() != 1:
            raise SystemExit("expected 16-bit mono WAV")
        pcm, rate = w.readframes(w.getnframes()), w.getframerate()

    direction = Direction(
        Speaker("a", args.source),
        Speaker("b", args.target),
        registry.for_pair(args.source, args.target),
        history=[],
    )
    start = time.perf_counter()
    result = await direction.handle_utterance(pcm, rate)
    elapsed = time.perf_counter() - start
    if result:
        print(f"heard:      {result.transcript}\ntranslated: {result.translation}")
    print(f"latency:    {elapsed:.2f}s (stt + translate)")


if __name__ == "__main__":
    load_dotenv("../.env")
    configure_from_env()
    asyncio.run(main())
