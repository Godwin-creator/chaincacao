const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export interface Lot {
  id: string;
  farmer: string;
  gpsLat: string;
  gpsLng: string;
  weightKg: string;
  species: string;
  harvestDate: string;
  currentOwner: string;
}

export interface Transfer {
  fromActor: string;
  toActor: string;
  timestamp: string;
  notes: string;
}

export interface CreateLotResult {
  lotId: string;
  qrCode: string;
  txHash: string;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, init);
  const data = await res.json();
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `Erreur ${res.status}`);
  return data as T;
}

export function createLot(payload: {
  species: string;
  weightKg: number;
  gpsLat: string;
  gpsLng: string;
  harvestDate: number;
}): Promise<CreateLotResult> {
  return apiFetch('/api/createLot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export function transferLot(payload: {
  lotId: number;
  toActor: string;
  notes: string;
}): Promise<{ success: boolean; txHash: string }> {
  return apiFetch('/api/transferLot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export function getLot(lotId: string): Promise<{ lot: Lot; history: Transfer[] }> {
  return apiFetch(`/api/lot/${lotId}`);
}

export function getLots(): Promise<{ lots: Lot[]; count: number }> {
  return apiFetch('/api/lots');
}

export function shortAddr(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function formatTs(ts: string): string {
  return new Date(Number(ts) * 1000).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
