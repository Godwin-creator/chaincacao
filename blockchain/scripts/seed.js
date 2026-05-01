const { ethers } = require("hardhat");
const fs   = require("fs");
const path = require("path");

const ACTORS = [
  {
    address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    role:    "FARMER",
    name:    "Kouamé Yao",
  },
  {
    address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    role:    "COLLECTOR",
    name:    "Coopérative Amanlé",
  },
  {
    address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    role:    "PROCESSOR",
    name:    "Usine Abidjan Sud",
  },
  {
    address: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    role:    "EXPORTER",
    name:    "Export Côte d'Ivoire",
  },
];

async function main() {
  const deploymentPath = path.join(__dirname, "..", "deployment.json");
  if (!fs.existsSync(deploymentPath)) {
    throw new Error("deployment.json not found — run 'npm run deploy' first");
  }

  const { address } = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  const [admin]     = await ethers.getSigners();

  console.log(`Using contract at ${address}`);
  console.log(`Admin: ${admin.address}`);

  const contract = await ethers.getContractAt("ChainCacao", address);

  for (const actor of ACTORS) {
    const tx = await contract.connect(admin).registerActor(
      actor.address,
      actor.role,
      actor.name
    );
    await tx.wait();
    console.log(`  [${actor.role}] ${actor.name} → ${actor.address}`);
  }

  console.log(`\nSeed complete — ${ACTORS.length} actors registered.`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
