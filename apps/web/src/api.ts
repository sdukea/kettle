export interface JoinParams {
  room: string;
  name: string;
  language: string;
}

export async function join(params: JoinParams): Promise<{ url: string; token: string }> {
  const res = await fetch("/api/join", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(`join failed: ${res.status}`);
  return res.json();
}
