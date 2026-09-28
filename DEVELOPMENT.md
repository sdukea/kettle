# Development

```bash
cp .env.example .env
docker compose -f infra/docker-compose.yml up -d     # LiveKit on :7880
cd server && uv run uvicorn nue_server.main:app --reload   # call setup on :8000
cd agent && uv run python -m nue_agent.main dev        # translator
npm install && npm run dev:web                         # app on :5173
```

Open two browser windows, join the same room with different languages.

Try one direction on a recording (roadmap step 1):

```bash
cd agent && uv run python -m nue_agent.offline speech.wav --source ta --target en
```

Tests: `cd agent && uv run --extra dev pytest`

## Layout

- `server/` issues LiveKit tokens carrying each caller's language and dispatches the translator.
- `agent/nue_agent/pipeline.py` one direction: understand → translate → speak. Transport-agnostic.
- `agent/nue_agent/providers/` STT / Translator / TTS protocols and a per-language registry.
- `agent/nue_agent/main.py` LiveKit wiring: VAD turn detection, per-listener output tracks, barge-in, transcripts on `nue.transcript`.
- `apps/web/` subscribes only to the translator track addressed to it; plays the other caller's real voice at low volume.
