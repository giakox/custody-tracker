import hre from "hardhat";
import { mkdirSync, writeFileSync } from "node:fs";

// CustodyLog (registro firmato dal device) + DemoUSD (stablecoin finta di testnet) +
// RentalEscrow (collaterale del noleggio, legge CustodyLog).
const log = await hre.viem.deployContract("CustodyLog");
const token = await hre.viem.deployContract("DemoUSD");
const escrow = await hre.viem.deployContract("RentalEscrow", [log.address, token.address]);
const chainId = await (await hre.viem.getPublicClient()).getChainId();
const out = { address: log.address, escrow: escrow.address, token: token.address, chainId };
mkdirSync("deployments", { recursive: true });
writeFileSync(`deployments/${hre.network.name}.json`, JSON.stringify(out, null, 2));
console.log(`CustodyLog ${log.address} · RentalEscrow ${escrow.address} · DemoUSD ${token.address} (chain ${chainId}) -> deployments/${hre.network.name}.json`);
