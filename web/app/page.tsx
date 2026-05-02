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
  },
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
      <section className="bg-gradient-to-br from-amber-800 via-amber-850 to-amber-950 text-white px-6 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
            <FontAwesomeIcon icon={faShieldHalved} className="text-amber-300 text-xs" />
            <span className="text-amber-200 text-xs font-semibold uppercase tracking-widest">
              De la fève à la tablette
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-5 leading-tight">
            Chaque lot a une histoire,<br className="hidden sm:block" /> traçable et immuable
          </h2>
          <p className="text-amber-200 text-base max-w-xl mx-auto leading-relaxed">
            Chaque transfert est enregistré sur la blockchain.
            <br />Aucune falsification possible.
          </p>
        </div>
      </section>

      {/* Role cards */}
      <main className="flex-1 px-6 py-12">
        <div className="mx-auto max-w-4xl">
          <p className="text-center text-stone-400 text-xs font-semibold uppercase tracking-widest mb-8">
            Choisissez votre rôle
          </p>
          <div className="grid gap-5 sm:grid-cols-3">
            {ROLES.map((role) => (
              <Link
                key={role.href}
                href={role.href}
                className={`group flex flex-col rounded-2xl bg-white ${role.borderTop}
                           shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden`}
              >
                <div className="px-6 pt-7 pb-6 flex-1">
                  <div className={`w-12 h-12 ${role.iconBg} rounded-xl flex items-center justify-center mb-5`}>
                    <FontAwesomeIcon icon={role.icon} className={`${role.iconColor} text-xl`} />
                  </div>
                  <h4 className="text-base font-semibold text-stone-800 mb-2">{role.title}</h4>
                  <p className="text-stone-500 text-sm leading-relaxed">{role.desc}</p>
                </div>
                <div className="px-6 py-3.5 border-t border-stone-100 flex items-center justify-between
                                text-sm font-medium text-stone-500 group-hover:text-stone-700 transition-colors">
                  <span>{role.badge}</span>
                  <FontAwesomeIcon icon={faChevronRight} className="text-xs opacity-60 group-hover:translate-x-0.5 transition-transform" />
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
