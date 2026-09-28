"""LiveKit entrypoint: the translator joins each call as a hidden participant.

For every pair of callers it runs two Directions. Each caller's translated
speech is published on a track only the other caller subscribes to, so nobody
hears themselves translated. Transcripts go out on the `nue.transcript` topic.
"""

import asyncio
import json
import logging

from dotenv import load_dotenv
from livekit import rtc
from livekit.agents import AutoSubscribe, JobContext, WorkerOptions, cli
from livekit.plugins import silero

from .pipeline import Direction, Result, Speaker
from .providers import Turn, registry
from .providers.registry import configure_from_env

logger = logging.getLogger("nue.agent")

TRANSCRIPT_TOPIC = "nue.transcript"
IN_SAMPLE_RATE = 16000


def language_of(p: rtc.RemoteParticipant) -> str:
    if lang := p.attributes.get("language"):
        return lang
    try:
        return json.loads(p.metadata or "{}").get("language", "en")
    except json.JSONDecodeError:
        return "en"


class Call:
    def __init__(self, ctx: JobContext) -> None:
        self.ctx = ctx
        self.room = ctx.room
        self.vad = silero.VAD.load()
        self.history: list[Turn] = []
        self.directions: dict[str, Direction] = {}  # keyed by source identity
        self.outputs: dict[str, rtc.AudioSource] = {}  # keyed by listener identity

    async def publish_result(self, result: Result) -> None:
        payload = json.dumps(
            {
                "speaker": result.speaker.identity,
                "language": result.speaker.language,
                "transcript": result.transcript,
                "translation": result.translation,
            }
        )
        await self.room.local_participant.send_text(payload, topic=TRANSCRIPT_TOPIC)

    async def output_for(self, listener: str, sample_rate: int) -> rtc.AudioSource:
        if listener not in self.outputs:
            source = rtc.AudioSource(sample_rate, 1)
            track = rtc.LocalAudioTrack.create_audio_track(f"nue-to-{listener}", source)
            # The web app subscribes only to the track named for its own identity.
            await self.room.local_participant.publish_track(
                track, rtc.TrackPublishOptions(source=rtc.TrackSource.SOURCE_MICROPHONE)
            )
            self.outputs[listener] = source
        return self.outputs[listener]

    def pair_up(self) -> None:
        """Two callers per room for now; build both directions once both are here."""
        callers = list(self.room.remote_participants.values())
        if len(callers) != 2 or self.directions:
            return
        a, b = (Speaker(p.identity, language_of(p)) for p in callers)
        for src, dst in ((a, b), (b, a)):
            self.directions[src.identity] = Direction(
                src,
                dst,
                registry.for_pair(src.language, dst.language),
                self.history,
                on_result=self.publish_result,
            )
        logger.info("paired %s(%s) <-> %s(%s)", a.identity, a.language, b.identity, b.language)

    async def listen(self, track: rtc.Track, participant: rtc.RemoteParticipant) -> None:
        stream = rtc.AudioStream(track, sample_rate=IN_SAMPLE_RATE, num_channels=1)
        vad_stream = self.vad.stream()

        async def feed() -> None:
            async for event in stream:
                vad_stream.push_frame(event.frame)

        feeder = asyncio.create_task(feed())
        try:
            async for ev in vad_stream:
                direction = self.directions.get(participant.identity)
                if direction is None:
                    continue
                if ev.type.name == "START_OF_SPEECH":
                    # They started talking: whatever we're saying to them can wait.
                    other = self.directions.get(direction.target.identity)
                    if other:
                        other.interrupt()
                elif ev.type.name == "END_OF_SPEECH" and ev.frames:
                    pcm = b"".join(bytes(f.data) for f in ev.frames)
                    asyncio.create_task(self.translate_and_speak(direction, pcm))
        finally:
            feeder.cancel()

    async def translate_and_speak(self, direction: Direction, pcm: bytes) -> None:
        result = await direction.handle_utterance(pcm, IN_SAMPLE_RATE)
        if not result or not result.translation:
            return
        tts = direction.providers.tts
        out = await self.output_for(direction.target.identity, tts.sample_rate)

        async def play() -> None:
            async for chunk in direction.speak(result.translation):
                frame = rtc.AudioFrame(chunk, tts.sample_rate, 1, len(chunk) // 2)
                await out.capture_frame(frame)

        task = asyncio.create_task(play())
        direction.track_speaking(task)


async def entrypoint(ctx: JobContext) -> None:
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
    call = Call(ctx)

    @ctx.room.on("participant_connected")
    def _joined(_: rtc.RemoteParticipant) -> None:
        call.pair_up()

    @ctx.room.on("track_subscribed")
    def _track(track: rtc.Track, _pub: rtc.RemoteTrackPublication, p: rtc.RemoteParticipant) -> None:
        if track.kind == rtc.TrackKind.KIND_AUDIO:
            call.pair_up()
            asyncio.create_task(call.listen(track, p))

    call.pair_up()


def run() -> None:
    load_dotenv("../.env")
    configure_from_env()
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, agent_name="nue-translator"))


if __name__ == "__main__":
    run()
