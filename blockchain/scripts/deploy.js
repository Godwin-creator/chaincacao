const { ethers } = require("hardhat");
const fs   = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying ChainCacao with:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "MATIC");

  const ChainCacao = await ethers.getContractFactory("ChainCacao");
  const contract   = await ChainCacao.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("ChainCacao deployed to:", address);

  const network     = await ethers.provider.getNetwork();
  const blockNumber = await ethers.provider.getBlockNumber();

  const deployment = {
    contractName: "ChainCacao",
    address,
    deployer:     deployer.address,
    network:      network.name,
    chainId:      Number(network.chainId),
    deployedAt:   new Date().toISOString(),
    blockNumber,
  };

  const outPath = path.join(__dirname, "..", "deployment.json");
  fs.writeFileSync(outPath, JSON.stringify(deployment, null, 2));
  console.log("Deployment info saved to deployment.json");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
