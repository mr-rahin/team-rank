export interface Team {
  id: string; // mockapi.io returns string ids
  name: string;
  points: number;
  hue: string;
}

const API_BASE = "https://68b2af99c28940c9e69d184b.mockapi.io/api/product";

const PALETTE = ["#7C5CFC", "#22D3EE", "#FB7185", "#34D399", "#FBBF24", "#F472B6"];

function randomHue(): string {
  return PALETTE[Math.floor(Math.random() * PALETTE.length)];
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function getTeams(): Promise<Team[]> {
  const res = await fetch(API_BASE, { cache: "no-store" });
  return handle<Team[]>(res);
}

export async function addTeam(name: string): Promise<Team> {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: name.trim() || "گروه جدید",
      points: 0,
      hue: randomHue(),
    }),
  });
  return handle<Team>(res);
}

export async function renameTeam(id: string, name: string): Promise<Team> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: name.trim() }),
  });
  return handle<Team>(res);
}

export async function setPoints(id: string, points: number): Promise<Team> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ points: Math.max(0, points) }),
  });
  return handle<Team>(res);
}

export async function adjustPoints(team: Team, delta: number): Promise<Team> {
  return setPoints(team.id, team.points + delta);
}

export async function deleteTeam(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`);
  }
}