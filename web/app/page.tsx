import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLeaf,
  faSeedling,
  faHandshake,
  faMagnifyingGlass,
  faChevronRight,
  faShieldHalved,
  faLink,
  faLock,
  faCube,
} from "@fortawesome/free-solid-svg-icons";

const ROLES = [
  {
    href: "/agriculteur",
    icon: faSeedling,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    title: "Agriculteur",
    desc: "Enregistrer un nouveau lot de cacao avec localisation GPS, espèce et poids.",
    borderTop: "border-t-4 border-green-500",
    badge: "Créer un lot",
    delay: "80ms",
  },
  {
    href: "/cooperative",
    icon: faHandshake,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    title: "Coopérative",
    desc: "Transférer la propriété d'un lot vers un collecteur, transformateur ou exportateur.",
    borderTop: "border-t-4 border-blue-500",
    badge: "Transférer",
    delay: "180ms",
  },
  {
    href: "/verificateur",
    icon: faMagnifyingGlass,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    title: "Vérificateur public",
    desc: "Consulter l'historique complet d'un lot depuis la récolte jusqu'à l'export.",
    borderTop: "border-t-4 border-purple-500",
    badge: "Vérifier",
    delay: "280ms",
  },
];

const FEATURES = [
  { icon: faLock,         text: "Anti-falsification" },
  { icon: faCube,         text: "Blockchain Polygon" },
  { icon: faShieldHalved, text: "Données immuables" },
];

const STATS = [
  { value: "100%", label: "Traçabilité garantie" },
  { value: "Amoy",   label: "Réseau Polygon" },
  { value: "3",      label: "Rôles distincts" },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <header className="bg-amber-900 text-white px-6 py-4 shadow-lg">
        <div className="mx-auto max-w-4xl flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-700 rounded-xl flex items-center justify-center shadow-inner shrink-0">
            <FontAwesomeIcon icon={faLeaf} className="text-amber-200 text-base" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight leading-none">ChainCacao</h1>
            <p className="text-amber-300 text-xs mt-0.5">Traçabilité blockchain · Polygon Amoy</p>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-linear-to-br from-amber-900 via-amber-800 to-amber-950 text-white px-6 py-16 relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '28px 28px' }} />

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full
                          px-4 py-1.5 mb-6 anim-fade-up backdrop-blur-sm">
            <FontAwesomeIcon icon={faShieldHalved} className="text-amber-300 text-xs" />
            <span className="text-amber-200 text-xs font-semibold uppercase tracking-widest">
              De la fève à la tablette
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold mb-5 leading-tight anim-fade-up"
              style={{ animationDelay: '80ms' }}>
            Chaque lot a une histoire,<br className="hidden sm:block" /> traçable et immuable
          </h2>

          <p className="text-amber-200 text-base max-w-xl mx-auto leading-relaxed mb-8 anim-fade-up"
             style={{ animationDelay: '160ms' }}>
            Chaque transfert est enregistré sur la blockchain.
            <br />Aucune falsification possible.
          </p>

          <div className="flex flex-wrap justify-center gap-3 anim-fade-up"
               style={{ animationDelay: '240ms' }}>
            {FEATURES.map((f) => (
              <span key={f.text}
                className="inline-flex items-center gap-2 bg-white/10 border border-white/20
                           rounded-full px-4 py-1.5 text-sm text-amber-100 backdrop-blur-sm
                           hover:bg-white/20 transition-colors duration-200">
                <FontAwesomeIcon icon={f.icon} className="text-amber-300 text-xs" />
                {f.text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <div className="bg-white border-b border-stone-200 px-6 py-5">
        <div className="mx-auto max-w-4xl grid grid-cols-3 divide-x divide-stone-200">
          {STATS.map((s, i) => (
            <div key={i} className="text-center px-4 anim-fade-up" style={{ animationDelay: `${i * 70}ms` }}>
              <p className="text-xl font-bold text-amber-800">{s.value}</p>
              <p className="text-xs text-stone-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Role cards */}
      <main className="flex-1 px-6 py-12 bg-stone-50">
        <div className="mx-auto max-w-4xl">
          <p className="text-center text-stone-400 text-xs font-semibold uppercase tracking-widest mb-8 anim-fade-up">
            Choisissez votre rôle
          </p>
          <div className="grid gap-5 sm:grid-cols-3">
            {ROLES.map((role) => (
              <Link
                key={role.href}
                href={role.href}
                style={{ animationDelay: role.delay }}
                className={`group anim-fade-up flex flex-col rounded-2xl bg-white ${role.borderTop}
                           shadow-sm hover:shadow-xl hover:-translate-y-1
                           transition-all duration-250 overflow-hidden`}
              >
                <div className="px-6 pt-7 pb-6 flex-1">
                  <div className={`w-12 h-12 ${role.iconBg} rounded-xl flex items-center justify-center mb-5
                                   group-hover:scale-110 transition-transform duration-200`}>
                    <FontAwesomeIcon icon={role.icon} className={`${role.iconColor} text-xl`} />
                  </div>
                  <h4 className="text-base font-semibold text-stone-800 mb-2">{role.title}</h4>
                  <p className="text-stone-500 text-sm leading-relaxed">{role.desc}</p>
                </div>
                <div className="px-6 py-3.5 border-t border-stone-100 flex items-center justify-between
                                text-sm font-medium text-stone-500 group-hover:text-stone-700 transition-colors">
                  <span>{role.badge}</span>
                  <FontAwesomeIcon icon={faChevronRight}
                    className="text-xs opacity-60 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-stone-400 text-xs py-6 border-t border-stone-200 bg-white">
        <FontAwesomeIcon icon={faLink} className="mr-1.5 opacity-40" />
        ChainCacao · Miabé Hackathon 2026 · Polygon Amoy Testnet
      </footer>
    </div>
  );
}
