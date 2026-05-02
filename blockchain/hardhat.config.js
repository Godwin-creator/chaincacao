require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY        = process.env.PRIVATE_KEY        || "0x" + "0".repeat(64);
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },

  networks: {
    amoy: {
      url:      process.env.AMOY_RPC_URL || "https://rpc-amoy.polygon.technology",
      chainId:  80002,
      accounts: [PRIVATE_KEY],
      gasPrice: 25_000_000_000, // 25 gwei — réduit le coût de déploiement
    },
  },

  etherscan: {
    apiKey: {
      polygonAmoy: POLYGONSCAN_API_KEY,
    },
    customChains: [
      {
        network:  "polygonAmoy",
        chainId:  80002,
        urls: {
          apiURL:     "https://api-amoy.polygonscan.com/api",
          browserURL: "https://amoy.polygonscan.com",
        },
      },
    ],
  },
};
