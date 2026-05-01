'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createLot, type CreateLotResult } from '@/app/lib/api';

const SPECIES = ['Forastero', 'Criollo', 'Trinitario', 'Nacional'];

type Status = 'idle' | 'locating' | 'pending' | 'success' | 'error';

export default function AgriculteurPage() {
  const [species, setSpecies]         = useState('Forastero');
  const [weightKg, setWeightKg]       = useState('');
  const [gpsLat, setGpsLat]           = useState('');
  const [gpsLng, setGpsLng]           = useState('');
  const [harvestDate, setHarvestDate] = useState('');

  const [status, setStatus]     = useState<Status>('idle');
  const [error, setError]       = useState('');
  const [result, setResult]     = useState<CreateLotResult | null>(null);

  function getGps() {
    if (!navigator.geolocation) {
      setError('Géolocalisation non disponible sur ce navigateur.');
      return;
    }
    setStatus('locating');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLat(pos.coords.latitude.toFixed(6));
        setGpsLng(pos.coords.longitude.toFixed(6));
        setStatus('idle');
      },
      () => {
        setError('Impossible d\'obtenir la position GPS. Saisissez-la manuellement.');
        setStatus('idle');
      },
      { timeout: 10_000 }
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!gpsLat || !gpsLng) { setError('Les coordonnées GPS sont requises.'); return; }
    if (!harvestDate)        { setError('La date de récolte est requise.');    return; }

    const harvestTs = Math.floor(new Date(harvestDate).getTime() / 1000);
    if (isNaN(harvestTs)) { setError('Date de récolte invalide.'); return; }

    setStatus('pending');
    try {
      const res = await createLot({
        species,
        weightKg: Number(weightKg),
        gpsLat,
        gpsLng,
        harvestDate: harvestTs,
      });
      setResult(res);
      setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setStatus('error');
    }
  }

  function reset() {
    setStatus('idle');
    setResult(null);
    setError('');
    setWeightKg('');
    setGpsLat('');
    setGpsLng('');
    setHarvestDate('');
  }

  return (
    <div className="flex flex-1 flex-col">
      <Header color="bg-green-700" emoji="🌱" title="Dashboard Agriculteur" />

      <main className="flex-1 px-4 py-8">
        <div className="mx-auto max-w-lg">

          {/* Success */}
          {status === 'success' && result && (
            <div className="bg-white rounded-2xl shadow-sm border border-green-200 overflow-hidden mb-6">
              <div className="bg-green-600 text-white px-6 py-4">
                <p className="font-semibold text-lg">✅ Lot créé avec succès !</p>
              </div>
              <div className="px-6 py-5 space-y-4">
                <Row label="ID du lot" value={`#${result.lotId}`} mono />
                <Row label="Transaction" value={result.txHash} mono truncate />
                <div className="flex flex-col items-center gap-3 pt-2">
                  <p className="text-sm text-stone-500">QR Code de traçabilité</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={result.qrCode}
                    alt={`QR code lot #${result.lotId}`}
                    className="w-44 h-44 rounded-lg border border-stone-200"
                  />
                  <a
                    href={result.qrCode}
                    download={`lot-${result.lotId}.png`}
                    className="text-xs text-green-700 underline hover:text-green-900"
                  >
                    Télécharger le QR code
                  </a>
                </div>
              </div>
              <div className="px-6 pb-5">
                <button onClick={reset}
                  className="w-full rounded-lg border border-stone-300 py-2 text-sm text-stone-600 hover:bg-stone-50 transition-colors">
                  Créer un autre lot
                </button>
              </div>
            </div>
          )}

          {/* Form */}
          {status !== 'success' && (
            <form onSubmit={handleSubmit}
              className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-stone-100">
                <h2 className="font-semibold text-stone-800">Nouveau lot de cacao</h2>
                <p className="text-stone-400 text-sm mt-0.5">
                  Tous les champs sont requis sauf mention contraire
                </p>
              </div>

              <div className="px-6 py-5 space-y-5">
                {/* Espèce */}
                <Field label="Espèce de cacao">
                  <select value={species} onChange={e => setSpecies(e.target.value)}
                    className="input">
                    {SPECIES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </Field>

                {/* Poids */}
                <Field label="Poids (kg)">
                  <input type="number" min="1" step="1" required
                    placeholder="ex. 500"
                    value={weightKg}
                    onChange={e => setWeightKg(e.target.value)}
                    className="input" />
                </Field>

                {/* GPS */}
                <div>
                  <label className="label">Coordonnées GPS</label>
                  <button type="button" onClick={getGps} disabled={status === 'locating'}
                    className="mb-2 w-full flex items-center justify-center gap-2 rounded-lg
                               border-2 border-dashed border-green-400 py-2.5 text-sm text-green-700
                               hover:bg-green-50 transition-colors disabled:opacity-50">
                    {status === 'locating'
                      ? <><Spinner className="text-green-600" /> Localisation…</>
                      : '📍 Obtenir la position automatiquement'}
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="Latitude" required
                      value={gpsLat} onChange={e => setGpsLat(e.target.value)}
                      className="input font-mono text-sm" />
                    <input type="text" placeholder="Longitude"
                      value={gpsLng} onChange={e => setGpsLng(e.target.value)}
                      className="input font-mono text-sm" />
                  </div>
                </div>

                {/* Date */}
                <Field label="Date de récolte">
                  <input type="date" required
                    value={harvestDate}
                    onChange={e => setHarvestDate(e.target.value)}
                    className="input" />
                </Field>

                {/* Error */}
                {error && <ErrorBox msg={error} />}
              </div>

              <div className="px-6 pb-6">
                <button type="submit" disabled={status === 'pending'}
                  className="w-full rounded-lg bg-green-600 py-3 text-white font-medium
                             hover:bg-green-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                  {status === 'pending'
                    ? <><Spinner /> Enregistrement en cours…</>
                    : '🌿 Créer le lot sur la blockchain'}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

/* ── Shared sub-components ─────────────────────────────────────────────────── */

function Header({ color, emoji, title }: { color: string; emoji: string; title: string }) {
  return (
    <header className={`${color} text-white px-6 py-4 shadow-md`}>
      <div className="mx-auto max-w-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{emoji}</span>
          <span className="font-semibold">{title}</span>
        </div>
        <Link href="/" className="text-xs opacity-75 hover:opacity-100 transition-opacity">
          ← Accueil
        </Link>
      </div>
    </header>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

function Row({ label, value, mono, truncate }: {
  label: string; value: string; mono?: boolean; truncate?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-stone-400 mb-0.5">{label}</p>
      <p className={`text-stone-800 font-medium text-sm break-all ${mono ? 'font-mono' : ''} ${truncate ? 'truncate' : ''}`}>
        {value}
      </p>
    </div>
  );
}

function ErrorBox({ msg }: { msg: string }) {
  return (
    <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">
      ⚠️ {msg}
    </div>
  );
}

function Spinner({ className = 'text-white' }: { className?: string }) {
  return (
    <svg className={`animate-spin h-4 w-4 ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
