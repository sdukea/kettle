"""Call setup: issues LiveKit tokens that carry each caller's language."""

import json

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from livekit import api
from pydantic import BaseModel, Field

from .config import settings

app = FastAPI(title="Nue server")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


class JoinRequest(BaseModel):
    room: str = Field(min_length=1, max_length=64)
    name: str = Field(min_length=1, max_length=64)
    language: str = Field(min_length=2, max_length=16, description="BCP-47 code, e.g. 'ta', 'en'")


class JoinResponse(BaseModel):
    url: str
    token: str


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/join", response_model=JoinResponse)
def join(req: JoinRequest) -> JoinResponse:
    # TODO: real sign-in. For now the display name doubles as identity.
    token = (
        api.AccessToken(settings.livekit_api_key, settings.livekit_api_secret)
        .with_identity(req.name)
        .with_name(req.name)
        .with_metadata(json.dumps({"language": req.language}))
        .with_attributes({"language": req.language})
        .with_grants(api.VideoGrants(room_join=True, room=req.room))
        .with_room_config(
            api.RoomConfiguration(agents=[api.RoomAgentDispatch(agent_name="nue-translator")])
        )
        .to_jwt()
    )
    return JoinResponse(url=settings.livekit_url, token=token)
