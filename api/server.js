'use strict';

require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const { ethers } = require('ethers');
const QRCode     = require('qrcode');

// ─── Config ──────────────────────────────────────────────────────────────────

const PORT             = process.env.PORT             || 3001;
const RPC_URL          = process.env.ALCHEMY_AMOY_URL || 'https://rpc-amoy.polygon.technology';
const PRIVATE_KEY      = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

if (!PRIVATE_KEY || !CONTRACT_ADDRESS) {
  console.error('Missing PRIVATE_KEY or CONTRACT_ADDRESS in .env');
  process.exit(1);
}

// ─── ABI (extrait de artifacts/contracts/ChainCacao.sol/ChainCacao.json) ─────

const ABI = [
  { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true,  "internalType": "address", "name": "actor", "type": "address" },
      { "indexed": false, "internalType": "string",  "name": "role",  "type": "string"  }
    ],
    "name": "ActorRegistered", "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "lotId",  "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "farmer", "type": "address" }
    ],
    "name": "LotCreated", "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "lotId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "from",  "type": "address" },
      { "indexed": true, "internalType": "address", "name": "to",    "type": "address" }
    ],
    "name": "LotTransferred", "type": "event"
  },
  {
    "inputs": [],
    "name": "admin",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view", "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string",  "name": "gpsLat",      "type": "string"  },
      { "internalType": "string",  "name": "gpsLng",      "type": "string"  },
      { "internalType": "uint256", "name": "weightKg",    "type": "uint256" },
      { "internalType": "string",  "name": "species",     "type": "string"  },
      { "internalType": "uint256", "name": "harvestDate", "type": "uint256" }
    ],
    "name": "createLot",
    "outputs": [{ "internalType": "uint256", "name": "lotId", "type": "uint256" }],
    "stateMutability": "nonpayable", "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "actor", "type": "address" }],
    "name": "getActor",
    "outputs": [{
      "components": [
        { "internalType": "address", "name": "addr",       "type": "address" },
        { "internalType": "string",  "name": "role",       "type": "string"  },
        { "internalType": "string",  "name": "name",       "type": "string"  },
        { "internalType": "bool",    "name": "registered", "type": "bool"    }
      ],
      "internalType": "struct ChainCacao.Actor", "name": "", "type": "tuple"
    }],
    "stateMutability": "view", "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "lotId", "type": "uint256" }],
    "name": "getLot",
    "outputs": [{
      "components": [
        { "internalType": "uint256", "name": "id",           "type": "uint256" },
        { "internalType": "address", "name": "farmer",       "type": "address" },
        { "internalType": "string",  "name": "gpsLat",       "type": "string"  },
        { "internalType": "string",  "name": "gpsLng",       "type": "string"  },
        { "internalType": "uint256", "name": "weightKg",     "type": "uint256" },
        { "internalType": "string",  "name": "species",      "type": "string"  },
        { "internalType": "uint256", "name": "harvestDate",  "type": "uint256" },
        { "internalType": "address", "name": "currentOwner", "type": "address" }
      ],
      "internalType": "struct ChainCacao.Lot", "name": "", "type": "tuple"
    }],
    "stateMutability": "view", "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "lotId", "type": "uint256" }],
    "name": "getLotHistory",
    "outputs": [{
      "components": [
        { "internalType": "address", "name": "fromActor", "type": "address" },
        { "internalType": "address", "name": "toActor",   "type": "address" },
        { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
        { "internalType": "string",  "name": "notes",     "type": "string"  }
      ],
      "internalType": "struct ChainCacao.Transfer[]", "name": "", "type": "tuple[]"
    }],
    "stateMutability": "view", "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "actor", "type": "address" },
      { "internalType": "string",  "name": "role",  "type": "string"  },
      { "internalType": "string",  "name": "name",  "type": "string"  }
    ],
    "name": "registerActor",
    "outputs": [],
    "stateMutability": "nonpayable", "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "lotId", "type": "uint256" },
      { "internalType": "address", "name": "to",    "type": "address" },
      { "internalType": "string",  "name": "notes", "type": "string"  }
    ],
    "name": "transferLot",
    "outputs": [],
    "stateMutability": "nonpayable", "type": "function"
  }
];

// ─── Ethers setup ────────────────────────────────────────────────────────────

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet   = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

// ─── In-memory store (démo) ──────────────────────────────────────────────────
// Garde trace des lotIds créés via cette API pour GET /api/lots

const knownLotIds = new Set();

// ─── Serializers (BigInt → string pour JSON) ─────────────────────────────────

function serializeLot(lot) {
  return {
    id:           lot.id.toString(),
    farmer:       lot.farmer,
    gpsLat:       lot.gpsLat,
    gpsLng:       lot.gpsLng,
    weightKg:     lot.weightKg.toString(),
    species:      lot.species,
    harvestDate:  lot.harvestDate.toString(),
    currentOwner: lot.currentOwner,
  };
}

function serializeTransfer(t) {
  return {
    fromActor: t.fromActor,
    toActor:   t.toActor,
    timestamp: t.timestamp.toString(),
    notes:     t.notes,
  };
}

function parseError(err) {
  // ethers v6 revert reason
  return err.reason || err.shortMessage || err.message || 'Unknown error';
}

// ─── App ─────────────────────────────────────────────────────────────────────

const app = express();
app.use(cors());
app.use(express.json());

// ── POST /api/createLot ──────────────────────────────────────────────────────
// Body: { species, weightKg, gpsLat, gpsLng, harvestDate }
// Returns: { lotId, qrCode, txHash }
app.post('/api/createLot', async (req, res) => {
  const { species, weightKg, gpsLat, gpsLng, harvestDate } = req.body;

  if (!species || weightKg == null || !gpsLat || !gpsLng || harvestDate == null) {
    return res.status(400).json({
      error: 'Champs requis manquants : species, weightKg, gpsLat, gpsLng, harvestDate',
    });
  }

  try {
    const tx      = await contract.createLot(
      String(gpsLat),
      String(gpsLng),
      BigInt(weightKg),
      String(species),
      BigInt(harvestDate),
    );
    const receipt = await tx.wait();

    // Récupère lotId depuis l'event LotCreated
    const log = receipt.logs.find((l) => {
      try { return contract.interface.parseLog(l)?.name === 'LotCreated'; }
      catch { return false; }
    });
    if (!log) throw new Error('LotCreated event introuvable dans le receipt');

    const lotId = contract.interface.parseLog(log).args.lotId;

    knownLotIds.add(Number(lotId));

    const qrCode = await QRCode.toDataURL(
      `chaincacao://lot/${lotId}`,
      { errorCorrectionLevel: 'M', margin: 2 }
    );

    return res.status(201).json({
      lotId:  lotId.toString(),
      qrCode,
      txHash: receipt.hash,
    });
  } catch (err) {
    console.error('[createLot]', err);
    return res.status(500).json({ error: parseError(err) });
  }
});

// ── POST /api/transferLot ────────────────────────────────────────────────────
// Body: { lotId, toActor, notes? }
// Returns: { success, txHash }
app.post('/api/transferLot', async (req, res) => {
  const { lotId, toActor, notes } = req.body;

  if (lotId == null || !toActor) {
    return res.status(400).json({ error: 'Champs requis manquants : lotId, toActor' });
  }

  if (!ethers.isAddress(toActor)) {
    return res.status(400).json({ error: 'toActor n\'est pas une adresse Ethereum valide' });
  }

  try {
    const tx      = await contract.transferLot(BigInt(lotId), toActor, notes || '');
    const receipt = await tx.wait();

    return res.json({ success: true, txHash: receipt.hash });
  } catch (err) {
    console.error('[transferLot]', err);
    const msg = parseError(err);
    const status = msg.includes('not owner') || msg.includes('not registered') ? 403 : 500;
    return res.status(status).json({ error: msg });
  }
});

// ── GET /api/lot/:lotId ──────────────────────────────────────────────────────
// Returns: { lot, history }
app.get('/api/lot/:lotId', async (req, res) => {
  const id = req.params.lotId;

  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ error: 'lotId doit être un entier positif' });
  }

  try {
    const [lot, history] = await Promise.all([
      contract.getLot(BigInt(id)),
      contract.getLotHistory(BigInt(id)),
    ]);

    return res.json({
      lot:     serializeLot(lot),
      history: history.map(serializeTransfer),
    });
  } catch (err) {
    console.error('[getLot]', err);
    const msg = parseError(err);
    const status = msg.includes('does not exist') ? 404 : 500;
    return res.status(status).json({ error: msg });
  }
});

// ── GET /api/lots ────────────────────────────────────────────────────────────
// Retourne tous les lots créés via cette API (in-memory)
// Returns: { lots, count }
app.get('/api/lots', async (req, res) => {
  try {
    const ids = [...knownLotIds].sort((a, b) => a - b);

    const settled = await Promise.allSettled(
      ids.map((id) => contract.getLot(BigInt(id)))
    );

    const lots = settled
      .map((result, i) => {
        if (result.status === 'fulfilled') return serializeLot(result.value);
        console.warn(`[getLots] Impossible de lire lot ${ids[i]}:`, result.reason?.message);
        return null;
      })
      .filter(Boolean);

    return res.json({ lots, count: lots.length });
  } catch (err) {
    console.error('[getLots]', err);
    return res.status(500).json({ error: parseError(err) });
  }
});

// ─── Health check ─────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', relayer: wallet.address, contract: CONTRACT_ADDRESS });
});

// ─── Start ───────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`ChainCacao API  →  http://localhost:${PORT}`);
  console.log(`Contrat         →  ${CONTRACT_ADDRESS}`);
  console.log(`Relayer wallet  →  ${wallet.address}`);
  console.log(`Réseau RPC      →  ${RPC_URL}`);
});
