'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHandshake,
  faRightLeft,
  faCircleCheck,
  faTriangleExclamation,
  faArrowLeft,
  faRotate,
  faSpinner,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { getLots, transferLot, shortAddr, type Lot } from '@/app/lib/api';

type Status = 'idle' | 'loading' | 'pending' | 'success' | 'error';

const KNOWN_ACTORS = [
  { label: 'Coopérative Amanlé',    address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC' },
  { label: 'Usine Abidjan Sud',     address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906' },
  { label: "Export Côte d'Ivoire",  address: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65' },
];

export default function CooperativePage() {
  const [lots, setLots]             = useState<Lot[]>([]);
  const [lotsLoaded, setLotsLoaded] = useState(false);

  const [lotId, setLotId]     = useState('');
  const [toActor, setToActor] = useState('');
  const [notes, setNotes]     = useState('');

  const [status, setStatus] = useState<Status>('idle');
  const [error, setError]   = useState('');
  const [txHash, setTxHash] = useState('');

  async function loadLots() {
    setStatus('loading');
    try {
      const { lots: data } = await getLots();
      setLots(data);
      setLotsLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setStatus('idle');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!lotId || !toActor) { setError("L'ID du lot et le destinataire sont requis."); return; }
    setStatus('pending');
    try {
      const res = await transferLot({ lotId: Number(lotId), toActor, notes });
      setTxHash(res.txHash);
      setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setStatus('error');
    }
  }

  function reset() {
    setStatus('idle');
    setError('');
    setTxHash('');
    setLotId('');
    setToActor('');
    setNotes('');
  }

  return (
    <div className="flex flex-1 flex-col">
      <Header />

      <main className="flex-1 px-4 py-8 bg-stone-50">
        <div className="mx-auto max-w-lg space-y-6">

          {/* Success */}
          {status === 'success' && (
            <div className="anim-pop-in bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
              <div className="bg-blue-600 text-white px-6 py-5 flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0
                                anim-pop-in" style={{ animationDelay: '150ms' }}>
                  <FontAwesomeIcon icon={faCircleCheck} className="text-white text-lg" />
                </div>
                <div>
                  <p className="font-semibold text-lg leading-none">Transfert enregistré !</p>
                  <p className="text-blue-100 text-xs mt-1">Transaction confirmée sur la blockchain</p>
                </div>
              </div>
              <div className="px-6 py-5 space-y-3">
                <InfoRow label="Lot transféré" value={`#${lotId}`} mono />
                <InfoRow label="Nouveau propriétaire" value={toActor} mono />
                <InfoRow label="Hash de transaction" value={txHash} mono small />
              </div>
              <div className="px-6 pb-5">
                <button onClick={reset}
                  className="w-full rounded-lg border border-stone-200 py-2.5 text-sm text-stone-600
                             hover:bg-stone-50 active:scale-[0.98] transition-all font-medium">
                  Nouveau transfert
                </button>
              </div>
            </div>
          )}

          {/* Lots disponibles + formulaire */}
          {status !== 'success' && (
            <>
              {/* Lots */}
              <div className="anim-scale-in bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-stone-800">Lots disponibles</h2>
                    <p className="text-stone-400 text-xs mt-0.5">Créés via l'API locale</p>
                  </div>
                  <button onClick={loadLots} disabled={status === 'loading'}
                    className="inline-flex items-center gap-1.5 text-xs bg-blue-50 text-blue-700
                               border border-blue-200 rounded-lg px-3 py-1.5
                               hover:bg-blue-100 active:scale-95
                               transition-all disabled:opacity-50">
                    {status === 'loading' ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} spin className="text-blue-600" />
                        Chargement…
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faRotate} className="text-blue-500" />
                        Charger
                      </>
                    )}
                  </button>
                </div>

                {lotsLoaded && (
                  <div className="divide-y divide-stone-100">
                    {lots.length === 0 ? (
                      <p className="px-6 py-5 text-sm text-stone-400 italic">
                        Aucun lot trouvé. Créez-en un depuis le dashboard Agriculteur.
                      </p>
                    ) : lots.map((lot, i) => (
                      <button key={lot.id} type="button"
                        onClick={() => setLotId(lot.id)}
                        style={{ animationDelay: `${i * 50}ms` }}
                        className={`anim-slide-right w-full text-left px-6 py-3 transition-colors
                                    hover:bg-blue-50 flex items-center justify-between gap-3
                                    ${lotId === lot.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-medium text-stone-800 text-sm">Lot #{lot.id}</span>
                            <span className="text-xs bg-amber-100 text-amber-700 rounded px-1.5 py-0.5">
                              {lot.species}
                            </span>
                          </div>
                          <p className="text-xs text-stone-400 mt-0.5">
                            Propriétaire : {shortAddr(lot.currentOwner)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-stone-400">{lot.weightKg} kg</span>
                          <FontAwesomeIcon icon={faChevronRight}
                            className={`text-xs transition-colors ${lotId === lot.id ? 'text-blue-500' : 'text-stone-300'}`} />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Transfer form */}
              <form onSubmit={handleSubmit}
                className="anim-scale-in bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden"
                style={{ animationDelay: '60ms' }}>
                <div className="px-6 py-5 border-b border-stone-100">
                  <h2 className="font-semibold text-stone-800">Transférer un lot</h2>
                </div>

                <div className="px-6 py-5 space-y-5">
                  <div>
                    <label className="label">ID du lot</label>
                    <input type="number" min="0" required placeholder="ex. 0"
                      value={lotId} onChange={e => setLotId(e.target.value)}
                      className="input font-mono" />
                    {!lotsLoaded && (
                      <p className="text-xs text-stone-400 mt-1">
                        Ou chargez la liste ci-dessus pour sélectionner.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="label">Adresse du destinataire</label>
                    <select
                      value={KNOWN_ACTORS.some(a => a.address === toActor) ? toActor : '__custom__'}
                      onChange={e => {
                        if (e.target.value !== '__custom__') setToActor(e.target.value);
                        else setToActor('');
                      }}
                      className="input mb-2">
                      <option value="__custom__">— Saisir manuellement —</option>
                      {KNOWN_ACTORS.map(a => (
                        <option key={a.address} value={a.address}>{a.label}</option>
                      ))}
                    </select>
                    <input type="text" placeholder="0x…" required
                      value={toActor} onChange={e => setToActor(e.target.value)}
                      className="input font-mono text-sm" />
                  </div>

                  <div>
                    <label className="label">
                      Notes <span className="text-stone-400 font-normal">(optionnel)</span>
                    </label>
                    <textarea rows={2}
                      placeholder="ex. Livraison Yamoussoukro — conditionnement terminé"
                      value={notes} onChange={e => setNotes(e.target.value)}
                      className="input resize-none" />
                  </div>

                  {error && <ErrorBox msg={error} />}
                </div>

                <div className="px-6 pb-6">
                  <button type="submit" disabled={status === 'pending'}
                    className="w-full rounded-lg bg-blue-600 py-3 text-white font-medium
                               hover:bg-blue-700 active:scale-[0.98]
                               transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                    {status === 'pending' ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} spin />
                        Transfert en cours…
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faRightLeft} />
                        Enregistrer le transfert
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────────────────────── */

function Header() {
  return (
    <header className="bg-blue-700 text-white px-6 py-4 shadow-md">
      <div className="mx-auto max-w-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
            <FontAwesomeIcon icon={faHandshake} className="text-blue-100 text-sm" />
          </div>
          <span className="font-semibold">Dashboard Coopérative</span>
        </div>
        <Link href="/"
          className="flex items-center gap-1.5 text-xs opacity-75 hover:opacity-100
                     hover:-translate-x-0.5 transition-all duration-200">
          <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
          Accueil
        </Link>
      </div>
    </header>
  );
}

function InfoRow({ label, value, mono, small }: {
  label: string; value: string; mono?: boolean; small?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-stone-400 mb-0.5">{label}</p>
      <p className={`font-medium text-stone-800 break-all
                     ${mono ? 'font-mono' : ''} ${small ? 'text-xs text-stone-600' : 'text-sm'}`}>
        {value}
      </p>
    </div>
  );
}

function ErrorBox({ msg }: { msg: string }) {
  return (
    <div className="anim-slide-down rounded-lg bg-red-50 border border-red-200 px-4 py-3
                    text-red-700 text-sm flex items-start gap-2.5">
      <FontAwesomeIcon icon={faTriangleExclamation} className="text-red-500 mt-0.5 shrink-0" />
      <span>{msg}</span>
    </div>
  );
}
