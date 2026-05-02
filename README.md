# ChainCacao — Traçabilité blockchain de la filière cacao

> Projet soumis au **Miabé Hackathon 2026 — Phase 2**

## Description

ChainCacao est une application décentralisée (dApp) de **traçabilité de la chaîne d'approvisionnement du cacao**. Elle permet d'enregistrer chaque lot de cacao sur la blockchain Polygon, de suivre son parcours de la plantation jusqu'à l'exportation, et de vérifier publiquement son authenticité via un QR code.

Chaque acteur de la filière (agriculteur, coopérative, usine, exportateur) dispose d'un tableau de bord dédié. Les données sont immuables et accessibles à tous sans intermédiaire.

---

## Fonctionnalités principales

- **Agriculteur** — Création d'un lot de cacao avec espèce, poids, coordonnées GPS et date de récolte. Génération automatique d'un QR code de traçabilité.
- **Coopérative** — Transfert d'un lot vers un acteur enregistré (usine, exportateur) avec notes de suivi.
- **Vérificateur public** — Consultation de n'importe quel lot par son ID : détails complets + historique chronologique des transferts + lien OpenStreetMap.
- **Smart contract** — Toutes les données sont stockées on-chain sur Polygon Amoy (testnet). Les acteurs doivent être enregistrés par l'admin avant d'agir.

---

## Technologies utilisées

| Couche | Technologie |
|--------|-------------|
| Smart contract | Solidity 0.8.20, Hardhat, OpenZeppelin |
| Blockchain | Polygon Amoy (testnet, chainId 80002) |
| API backend | Node.js, Express 5, ethers.js v6, QRCode |
| Frontend | Next.js (App Router), Tailwind CSS v4, Font Awesome |
| Déploiement API | Railway |
| Déploiement frontend | Vercel |

---

## Architecture

```
phase2-MBH2026/
├── blockchain/          # Smart contract Solidity + scripts Hardhat
│   ├── contracts/
│   │   └── ChainCacao.sol
│   └── scripts/
│       ├── deploy.js
│       └── registerActors.js
├── api/                 # API REST Express (relayer blockchain)
│   └── server.js
└── web/                 # Frontend Next.js
    └── app/
        ├── page.tsx          # Accueil
        ├── agriculteur/      # Dashboard agriculteur
        ├── cooperative/      # Dashboard coopérative
        └── verificateur/     # Vérificateur public
```

---

## Déploiements en production

| Service | URL |
|---------|-----|
| Frontend (Vercel) | https://chaincacao-sage.vercel.app |
| API (Railway) | https://chaincacao-production.up.railway.app |
| Smart contract (Amoy) | `0xB1Ff894db952C399b4809E1dd06D05AB793eA324` |
| Explorateur | https://amoy.polygonscan.com/address/0xB1Ff894db952C399b4809E1dd06D05AB793eA324 |

---

## Installation locale

### Prérequis

- Node.js 18+
- npm

### 1. Cloner le dépôt

```bash
git clone https://github.com/Godwin-creator/chaincacao.git
cd chaincacao
```

### 2. Smart contract (optionnel — déjà déployé)

```bash
cd blockchain
npm install
cp .env.example .env   # remplir PRIVATE_KEY et AMOY_RPC_URL
npx hardhat run scripts/deploy.js --network amoy
npx hardhat run scripts/registerActors.js --network amoy
```

### 3. API backend

```bash
cd api
npm install
# Créer api/.env avec :
# ALCHEMY_AMOY_URL=https://rpc-amoy.polygon.technology
# PRIVATE_KEY=<clé privée du relayer>
# CONTRACT_ADDRESS=0xB1Ff894db952C399b4809E1dd06D05AB793eA324
# PORT=3001
node server.js
```

### 4. Frontend

```bash
cd web
npm install
# Créer web/.env.local avec :
# NEXT_PUBLIC_API_URL=http://localhost:3001
npm run dev
```

Ouvrir http://localhost:3000

---

## Utilisation

### Créer un lot (agriculteur)

1. Aller sur `/agriculteur`
2. Remplir espèce, poids, coordonnées GPS (ou cliquer "Obtenir la position automatiquement"), date de récolte
3. Cliquer **Créer le lot sur la blockchain**
4. Un QR code est généré avec l'ID du lot

### Transférer un lot (coopérative)

1. Aller sur `/cooperative`
2. Entrer l'ID du lot, choisir le destinataire, ajouter des notes
3. Cliquer **Enregistrer le transfert**

### Vérifier un lot (public)

1. Aller sur `/verificateur`
2. Entrer l'ID du lot
3. Visualiser les informations + l'historique complet des transferts

---

## Variables d'environnement

### `api/.env`

| Variable | Description |
|----------|-------------|
| `ALCHEMY_AMOY_URL` | URL RPC Polygon Amoy |
| `PRIVATE_KEY` | Clé privée du wallet relayer (sans `0x`) |
| `CONTRACT_ADDRESS` | Adresse du smart contract déployé |
| `PORT` | Port du serveur (défaut : 3001) |

### `web/.env.local`

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | URL de l'API backend |

---

## Équipe

Projet développé dans le cadre du **Miabé Hackathon 2026**.
