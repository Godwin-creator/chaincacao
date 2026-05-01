import Link from "next/link";

const ROLES = [
  {
    href: "/agriculteur",
    emoji: "🌱",
    title: "Agriculteur",
    desc: "Enregistrer un nouveau lot de cacao avec localisation GPS, espèce et poids.",
    bg: "bg-green-600 hover:bg-green-700",
    badge: "Créer un lot",
  },
  {
    href: "/cooperative",
    emoji: "🤝",
    title: "Coopérative",
    desc: "Transférer la propriété d'un lot vers un collecteur, transformateur ou exportateur.",
    bg: "bg-blue-600 hover:bg-blue-700",
    badge: "Transférer",
  },
  {
    href: "/verificateur",
    emoji: "🔍",
    title: "Vérificateur public",
    desc: "Consulter l'historique complet d'un lot depuis la récolte jusqu'à l'export.",
    bg: "bg-purple-600 hover:bg-purple-700",
    badge: "Vérifier",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <header className="bg-amber-800 text-white px-6 py-5 shadow-md">
        <div className="mx-auto max-w-4xl flex items-center gap-3">
          <span className="text-3xl">🍫</span>
          <div>
            <h1 className="text-xl font-bold tracking-tight">ChainCacao</h1>
            <p className="text-amber-200 text-xs">Traçabilité blockchain · Polygon Amoy</p>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-amber-700 text-white px-6 py-14">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-amber-200 text-sm font-medium uppercase tracking-widest mb-3">
            De la fève à la tablette
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Chaque lot a une histoire,<br className="hidden sm:block" /> traçable et immuable
          </h2>
          <p className="text-amber-100 text-base max-w-xl mx-auto">
            Chaque transfert est enregistré sur la blockchain. Aucune falsification possible.
          </p>
        </div>
      </section>

      {/* Role cards */}
      <main className="flex-1 px-6 py-12">
        <div className="mx-auto max-w-4xl">
          <h3 className="text-center text-stone-500 text-sm uppercase tracking-widest mb-8">
            Choisissez votre rôle
          </h3>
          <div className="grid gap-6 sm:grid-cols-3">
            {ROLES.map((role) => (
              <Link
                key={role.href}
                href={role.href}
                className="group flex flex-col rounded-2xl bg-white shadow-sm border border-stone-200
                           overflow-hidden hover:shadow-lg transition-all duration-200"
              >
                <div className="px-6 pt-8 pb-6 flex-1">
                  <span className="text-4xl block mb-4">{role.emoji}</span>
                  <h4 className="text-lg font-semibold text-stone-800 mb-2">{role.title}</h4>
                  <p className="text-stone-500 text-sm leading-relaxed">{role.desc}</p>
                </div>
                <div className={`px-6 py-3 ${role.bg} text-white text-sm font-medium
                                 text-center transition-colors duration-200`}>
                  {role.badge} →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-stone-400 text-xs py-6 border-t border-stone-200">
        ChainCacao · Miabé Hackathon 2026 · Polygon Amoy Testnet
      </footer>
    </div>
  );
}
