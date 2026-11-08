require("@nomicfoundation/hardhat-viem");

// .env (excluded from git): PRIVATE_KEY, RPC_URL. Node >= 20.12.
try { process.loadEnvFile(".env"); } catch {}

const { PRIVATE_KEY, RPC_URL } = process.env;

module.exports = {
  solidity: { version: "0.8.24", settings: { optimizer: { enabled: true, runs: 200 } } },
  networks: {
    // Base Sepolia: has the P-256 precompile (RIP-7212), so signature verification is cheap.
    baseSepolia: {
      url: RPC_URL || "https://sepolia.base.org",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 84532,
    },
  },
};
