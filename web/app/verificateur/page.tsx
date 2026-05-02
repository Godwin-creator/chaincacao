'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMagnifyingGlass,
  faArrowLeft,
  faArrowRight,
  faTriangleExclamation,
  faMapLocationDot,
  faSeedling,
  faBoxOpen,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import { getLot, shortAddr, formatTs, type Lot, type Transfer } from '@/app/lib/api';

type Status = 'idle' | 'pending' | 'success' | 'error';

export default function VerificateurPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError]   = useState('');
  const [lot, setLot]       = useState<Lot | null>(null);
  const [history, setHistory] = useState<Transfer[]>([]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const id = search.trim();
    if (!id) return;
    setError('');
    setLot(null);
    setHistory([]);
    setStatus('pending');
    try {
      const data = await getLot(id);
      setLot(data.lot);
      setHistory(data.history);
      setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lot introuvable');
      setStatus('error');
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <Header />

      <main className="flex-1 px-4 py-8 bg-stone-50">
        <div className="mx-auto max-w-2xl space-y-6">

          {/* Search bar */}
          <form onSubmit={handleSearch}
            className="bg-white rounded-2xl shadow-sm border border-stone-200 px-6 py-5">
            <h2 className="font-semibold text-stone-800 mb-4">Vérifier un lot</h2>
            <div className="flex gap-3">
              <input
                type="number" min="0" placeholder="Entrez l'ID du lot (ex. 0)"
                value={search} onChange={e => setSearch(e.target.value)}
                className="input flex-1 font-mono"
                autoFocus
              />
              <button type="submit" disabled={status === 'pending' || !search}
                className="rounded-lg bg-purple-600 text-white px-5 py-2.5 font-medium text-sm
                           hover:bg-purple-700 transition-colors disabled:opacity-60 flex items-center gap-2 shrink-0">
                {status === 'pending' ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin />
                    Recherche…
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                    Vérifier
                  </>
                )}
              </button>
            </div>
            {error && (
              <div className="mt-3 rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 text-red-700 text-sm flex items-center gap-2">
                <FontAwesomeIcon icon={faTriangleExclamation} className="text-red-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </form>

          {/* Lot details */}
          {status === 'success' && lot && (
            <>
              <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                <div className="bg-purple-600 text-white px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-purple-200 uppercase tracking-wide">Lot</p>
                    <p className="text-2xl font-bold font-mono">#{lot.id}</p>
                  </div>
                  <span className="bg-white/20 rounded-full px-3 py-1 text-sm font-medium">
                    {lot.species}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-px bg-stone-100">
                  <InfoCell label="Agriculteur" value={shortAddr(lot.farmer)} mono />
                  <InfoCell label="Propriétaire actuel" value={shortAddr(lot.currentOwner)} mono />
                  <InfoCell label="Poids" value={`${lot.weightKg} kg`} />
                  <InfoCell label="Date de récolte"
                    value={new Date(Number(lot.harvestDate) * 1000).toLocaleDateString('fr-FR', {
                      day: '2-digit', month: 'long', year: 'numeric'
                    })} />
                  <InfoCell label="Latitude" value={lot.gpsLat} mono />
                  <InfoCell label="Longitude" value={lot.gpsLng} mono />
                </div>

                {/* Map link */}
                <div className="px-6 py-3 bg-stone-50 border-t border-stone-100">
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${lot.gpsLat}&mlon=${lot.gpsLng}&zoom=12`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-purple-700 hover:text-purple-900 font-medium"
                  >
                    <FontAwesomeIcon icon={faMapLocationDot} />
                    Voir sur OpenStreetMap
                  </a>
                </div>
              </div>

              {/* Transfer history */}
              <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-stone-100">
                  <h3 className="font-semibold text-stone-800">Historique des transferts</h3>
                  <p className="text-stone-400 text-xs mt-0.5">
                    {history.length === 0
                      ? 'Aucun transfert — lot encore chez le producteur'
                      : `${history.length} transfert${history.length > 1 ? 's' : ''} enregistré${history.length > 1 ? 's' : ''}`}
                  </p>
                </div>

                {history.length === 0 ? (
                  <div className="px-6 py-10 text-center">
                    <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FontAwesomeIcon icon={faSeedling} className="text-green-400 text-lg" />
                    </div>
                    <p className="text-stone-400 text-sm">Ce lot n&apos;a pas encore été transféré.</p>
                  </div>
                ) : (
                  <ol className="px-6 py-5 space-y-0">
                    {/* Origin node */}
                    <TimelineItem
                      isFirst
                      label="Création du lot"
                      from={null}
                      to={lot.farmer}
                      timestamp={lot.harvestDate}
                      notes="Enregistrement initial par l'agriculteur"
                    />
                    {history.map((t, i) => (
                      <TimelineItem
                        key={i}
                        label={`Transfert ${i + 1}`}
                        from={t.fromActor}
                        to={t.toActor}
                        timestamp={t.timestamp}
                        notes={t.notes}
                        isLast={i === history.length - 1}
                      />
                    ))}
                  </ol>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

/* ── Sub-components ────────────────────────────────────────────────────────── */

function Header() {
  return (
    <header className="bg-purple-700 text-white px-6 py-4 shadow-md">
      <div className="mx-auto max-w-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center shrink-0">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="text-purple-100 text-sm" />
          </div>
          <span className="font-semibold">Vérificateur public</span>
        </div>
        <Link href="/"
          className="flex items-center gap-1.5 text-xs opacity-75 hover:opacity-100 transition-opacity">
          <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
          Accueil
        </Link>
      </div>
    </header>
  );
}

function InfoCell({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="bg-white px-5 py-3">
      <p className="text-xs text-stone-400 mb-0.5">{label}</p>
      <p className={`text-stone-800 font-medium text-sm ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  );
}

function TimelineItem({
  label, from, to, timestamp, notes, isFirst = false, isLast = false,
}: {
  label: string;
  from: string | null;
  to: string;
  timestamp: string;
  notes: string;
  isFirst?: boolean;
  isLast?: boolean;
}) {
  return (
    <li className="relative flex gap-4 pb-6 last:pb-0">
      {/* Vertical line */}
      {!isLast && (
        <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-stone-200" />
      )}

      {/* Dot */}
      <div className={`relative mt-0.5 h-6 w-6 shrink-0 rounded-full border-2 flex items-center justify-center
                       ${isFirst
                         ? 'border-green-500 bg-green-50'
                         : isLast
                           ? 'border-purple-500 bg-purple-50'
                           : 'border-blue-400 bg-blue-50'}`}>
        <FontAwesomeIcon
          icon={isFirst ? faSeedling : isLast ? faBoxOpen : faArrowRight}
          className={`text-[9px] ${isFirst ? 'text-green-600' : isLast ? 'text-purple-600' : 'text-blue-500'}`}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2 flex-wrap">
          <p className="font-medium text-stone-800 text-sm">{label}</p>
          <p className="text-xs text-stone-400 shrink-0">{formatTs(timestamp)}</p>
        </div>
        {from && (
          <p className="text-xs text-stone-500 mt-0.5">
            <span className="font-mono">{shortAddr(from)}</span>
            <FontAwesomeIcon icon={faArrowRight} className="mx-1.5 text-stone-300 text-[10px]" />
            <span className="font-mono">{shortAddr(to)}</span>
          </p>
        )}
        {!from && (
          <p className="text-xs text-stone-500 mt-0.5 font-mono">{shortAddr(to)}</p>
        )}
        {notes && (
          <p className="text-xs text-stone-400 mt-1 italic">&ldquo;{notes}&rdquo;</p>
        )}
      </div>
    </li>
  );
}
