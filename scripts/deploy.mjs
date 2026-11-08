import hre from "hardhat";
import { mkdirSync, writeFileSync } from "node:fs";

const log = await hre.viem.deployContract("CustodyLog");
const chainId = await (await hre.viem.getPublicClient()).getChainId();
mkdirSync("deployments", { recursive: true });
writeFileSync(`deployments/${hre.network.name}.json`, JSON.stringify({ address: log.address, chainId }, null, 2));
console.log(`CustodyLog @ ${log.address} (chain ${chainId}) -> deployments/${hre.network.name}.json`);
