require("@nomicfoundation/hardhat-viem");

// .env (escluso da git): PRIVATE_KEY, RPC_URL. Node >= 20.12.
try { process.loadEnvFile(".env"); } catch {}

const { PRIVATE_KEY, RPC_URL } = process.env;

module.exports = {
  solidity: { version: "0.8.24", settings: { optimizer: { enabled: true, runs: 200 } } },
  networks: {
    // Base Sepolia: ha il precompile P-256 (RIP-7212), verifica firma a costo basso.
    baseSepolia: {
      url: RPC_URL || "https://sepolia.base.org",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 84532,
    },
  },
};
