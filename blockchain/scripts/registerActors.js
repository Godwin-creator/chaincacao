const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Admin wallet :", deployer.address);

  const deploymentPath = path.join(__dirname, "../deployment.json");
  const { address: contractAddress } = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  console.log("Contrat      :", contractAddress);

  const ChainCacao = await ethers.getContractAt("ChainCacao", contractAddress, deployer);

  const actors = [
    { address: deployer.address,                          role: "agriculteur",  name: "Relayer ChainCacao" },
    { address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", role: "cooperative",  name: "Coopérative Amanlé" },
    { address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906", role: "usine",        name: "Usine Abidjan Sud" },
    { address: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65", role: "exportateur",  name: "Export Côte d'Ivoire" },
    { address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", role: "agriculteur",  name: "Kouamé Yao (fermier)" },
  ];

  for (const actor of actors) {
    const info = await ChainCacao.getActor(actor.address);
    if (info.registered) {
      console.log(`✓ Déjà enregistré : ${actor.name} (${actor.address})`);
      continue;
    }
    const tx = await ChainCacao.registerActor(actor.address, actor.role, actor.name);
    console.log(`  Tx : ${tx.hash}`);
    await tx.wait();
    console.log(`✓ Enregistré : ${actor.name}`);
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
