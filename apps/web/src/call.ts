import {
  Room,
  RoomEvent,
  Track,
  type RemoteParticipant,
  type RemoteTrack,
  type RemoteTrackPublication,
} from "livekit-client";

export const TRANSCRIPT_TOPIC = "nue.transcript";
const ORIGINAL_VOICE_VOLUME = 0.15;

export interface Line {
  speaker: string;
  language: string;
  transcript: string;
  translation: string;
}

const isAgent = (p: RemoteParticipant) => p.isAgent;

/**
 * Connects to a call and wires up audio:
 * - the other caller's real voice plays softly underneath
 * - the translator's track addressed to us plays at full volume
 * - the translator's track addressed to anyone else is never subscribed
 */
export async function connect(url: string, token: string, onLine: (line: Line) => void): Promise<Room> {
  const room = new Room({ adaptiveStream: true, dynacast: true });

  const wanted = (pub: RemoteTrackPublication, p: RemoteParticipant) =>
    isAgent(p) ? pub.trackName === `nue-to-${room.localParticipant.identity}` : true;

  room.on(RoomEvent.TrackPublished, (pub: RemoteTrackPublication, p: RemoteParticipant) =>
    pub.setSubscribed(wanted(pub, p)),
  );

  room.on(
    RoomEvent.TrackSubscribed,
    (track: RemoteTrack, _pub: RemoteTrackPublication, p: RemoteParticipant) => {
      if (track.kind !== Track.Kind.Audio) return;
      const el = track.attach();
      document.body.appendChild(el);
      if (!isAgent(p)) p.setVolume(ORIGINAL_VOICE_VOLUME);
    },
  );

  room.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack) => track.detach().forEach((el) => el.remove()));

  room.registerTextStreamHandler(TRANSCRIPT_TOPIC, async (reader) => {
    onLine(JSON.parse(await reader.readAll()) as Line);
  });

  // Agent tracks must be opted into per-track, so don't auto-subscribe everything.
  await room.connect(url, token, { autoSubscribe: false });
  for (const p of room.remoteParticipants.values()) {
    for (const pub of p.trackPublications.values()) pub.setSubscribed(wanted(pub, p));
  }

  await room.localParticipant.setMicrophoneEnabled(true);
  return room;
}
