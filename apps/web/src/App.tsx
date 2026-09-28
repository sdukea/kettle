import { useEffect, useRef, useState } from "react";
import type { Room } from "livekit-client";
import { join } from "./api";
import { connect, type Line } from "./call";
import { LANGUAGES } from "./languages";

export function App() {
  const [room, setRoom] = useState<Room | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ room: "demo", name: "", language: "en" });
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => bottom.current?.scrollIntoView({ behavior: "smooth" }), [lines]);
  useEffect(() => () => void room?.disconnect(), [room]);

  async function start(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const { url, token } = await join(form);
      setRoom(await connect(url, token, (line) => setLines((ls) => [...ls, line])));
    } catch (err) {
      setError(String(err));
    }
  }

  if (!room) {
    return (
      <main className="join">
        <h1>Nue</h1>
        <form onSubmit={start}>
          <input placeholder="Your name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <select value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}>
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>{l.name}</option>
            ))}
          </select>
          <input placeholder="Room" required value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} />
          <button type="submit">Join call</button>
          {error && <p className="error">{error}</p>}
        </form>
      </main>
    );
  }

  const me = room.localParticipant.identity;
  return (
    <main className="call">
      <header>
        <span>{form.room}</span>
        <button onClick={() => { room.disconnect(); setRoom(null); setLines([]); }}>Leave</button>
      </header>
      <section className="transcript">
        {lines.map((l, i) => (
          <div key={i} className={l.speaker === me ? "line mine" : "line theirs"}>
            {/* You always see what Nue heard from you; you see their words in your language. */}
            <p>{l.speaker === me ? l.transcript : l.translation}</p>
            <small>{l.speaker === me ? l.translation : l.transcript}</small>
          </div>
        ))}
        <div ref={bottom} />
      </section>
    </main>
  );
}
