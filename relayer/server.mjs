import { fileURLToPath } from "node:url";
// Relayer: riceve i batch firmati dal device (HTTP, stessa rete/hotspot), conserva le letture
// off-chain e ancora root + firma sul contratto. Il relayer NON è fidato: se altera qualcosa
// la verifica P-256 on-chain fallisce. Serve anche la dashboard su http://<ip>:8787.
import http from "node:http";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { networkInterfaces } from "node:os";
import { createPublicClient, createWalletClient, http as rpc, parseEther, formatEther } from "viem";
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
import { hardhat, baseSepolia } from "viem/chains";
import { merkleRoot, decodeRecord, merkleProof, deviceIdOf, hex, unhex, lowS } from "../lib/protocol.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
try { process.loadEnvFile(fileURLToPath(new URL("../.env", import.meta.url))); } catch {}
const NET = process.env.NETWORK || "localhost";
const chain = NET === "baseSepolia" ? baseSepolia : hardhat;
const RPC = process.env.RPC_URL || (NET === "baseSepolia" ? "https://sepolia.base.org" : "http://127.0.0.1:8545");
const PORT = Number(process.env.PORT || 8787);
const MAX_CG = Number(process.env.MAX_CG || 1500); // soglia danno: 15 g
// Prima chiave di default di `hardhat node`: solo per la chain locale.
const HARDHAT_KEY0 = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const RELAYER_KEY = NET === "localhost" ? HARDHAT_KEY0 : process.env.PRIVATE_KEY; // in locale ignora .env
if (!RELAYER_KEY) throw new Error("Serve PRIVATE_KEY per " + NET);

const { address } = JSON.parse(readFileSync(`${ROOT}deployments/${NET}.json`, "utf8"));
const { abi } = JSON.parse(readFileSync(`${ROOT}artifacts/contracts/CustodyLog.sol/CustodyLog.json`, "utf8"));

const pub = createPublicClient({ chain, transport: rpc(RPC) });
const walletFor = (pk) => createWalletClient({ account: privateKeyToAccount(pk), chain, transport: rpc(RPC) });
const relayer = walletFor(RELAYER_KEY);

// --- stato locale (data availability delle letture) ---
mkdirSync(`${ROOT}data`, { recursive: true });
const DB = `${ROOT}data/${NET}.json`;
const db = existsSync(DB) ? JSON.parse(readFileSync(DB, "utf8")) : { roles: null, shipments: {}, batches: [] };
const save = () => writeFileSync(DB, JSON.stringify(db, null, 2));

// Ruoli demo: mittente = relayer; vettori e destinatario con chiavi proprie (firmano gli handoff).
if (!db.roles) {
  db.roles = Object.fromEntries(["carrierA", "carrierB", "receiver"].map((r) => [r, generatePrivateKey()]));
  save();
}
const roleAddr = (r) => privateKeyToAccount(db.roles[r]).address;

async function fundRoles() {
  for (const r of Object.keys(db.roles)) {
    const bal = await pub.getBalance({ address: roleAddr(r) });
    if (bal < parseEther("0.0002")) {
      const hash = await relayer.sendTransaction({ to: roleAddr(r), value: parseEther("0.0005") });
      await pub.waitForTransactionReceipt({ hash, timeout: 60_000 });
    }
  }
}

const write = async (wallet, functionName, args) => {
  const hash = await wallet.writeContract({ address, abi, functionName, args });
  const rc = await pub.waitForTransactionReceipt({ hash, timeout: 60_000 });
  if (rc.status !== "success") throw new Error(`${functionName} reverted`);
  return { hash, gasUsed: rc.gasUsed.toString() };
};

// Coda seriale: niente nonce in conflitto se arrivano due batch insieme.
// Ogni job ha un timeout: una transazione appesa (RPC caduto, cambio di rete) non deve
// bloccare per sempre tutti i batch successivi.
const JOB_TIMEOUT_MS = Number(process.env.JOB_TIMEOUT_MS || 90_000);
let queue = Promise.resolve();
const serial = (fn) => {
  const job = queue.then(() => Promise.race([
    fn(),
    new Promise((_, rej) => setTimeout(() => rej(new Error(`timeout ${JOB_TIMEOUT_MS / 1000}s (RPC lento o appeso)`)), JOB_TIMEOUT_MS)),
  ]));
  queue = job.catch(() => {});
  return job;
};

async function ensureShipment(qx, qy) {
  const deviceId = hex(deviceIdOf(qx, qy));
  if (db.shipments[deviceId]) return db.shipments[deviceId];
  const [, , registered] = await pub.readContract({ address, abi, functionName: "devices", args: [deviceId] });
  if (!registered) await write(relayer, "registerDevice", [qx, qy]);
  await write(relayer, "createShipment", [deviceId, roleAddr("carrierA"), roleAddr("receiver"), MAX_CG]);
  const id = Number(await pub.readContract({ address, abi, functionName: "shipmentCount" }));
  db.shipments[deviceId] = { id, custodian: "carrierA", qx, qy };
  save();
  console.log(`device ${deviceId.slice(0, 10)}… registrato, spedizione #${id}`);
  return db.shipments[deviceId];
}

async function handleBatch(b) {
  const recs = b.records.map(unhex);
  if (recs.some((r) => r.length !== 19)) throw new Error("record di lunghezza errata");
  const root = hex(merkleRoot(recs));
  if (root.toLowerCase() !== b.root.toLowerCase()) throw new Error(`root non coincide: device ${b.root} vs ricalcolata ${root}`);
  const ship = await ensureShipment(b.qx, b.qy);
  const tx = await write(relayer, "submitBatch", [
    BigInt(ship.id), b.seq, root, recs.length, b.maxPeakCg, b.tStart, b.tEnd, b.r, lowS(b.s),
  ]);
  const entry = {
    shipmentId: ship.id, seq: b.seq, root, maxPeakCg: b.maxPeakCg, hw: !!b.hw, custodian: ship.custodian,
    records: b.records, decoded: recs.map(decodeRecord), tx: tx.hash, gasUsed: tx.gasUsed, at: Date.now(),
  };
  db.batches.push(entry);
  save();
  const dmg = b.maxPeakCg > MAX_CG ? `  ⚠ DANNO ${(b.maxPeakCg / 100).toFixed(1)} g → ${ship.custodian}` : "";
  console.log(`#${ship.id} seq ${b.seq} · ${recs.length} letture · gas ${tx.gasUsed} · ${tx.hash}${dmg}`);
  return entry;
}

async function handoff(to) {
  const ship = Object.values(db.shipments).at(-1);
  if (!ship) throw new Error("nessuna spedizione");
  await fundRoles();
  const p = await write(walletFor(db.roles[ship.custodian]), "proposeHandoff", [BigInt(ship.id), roleAddr(to)]);
  const a = await write(walletFor(db.roles[to]), "acceptHandoff", [BigInt(ship.id)]);
  ship.custodian = to;
  save();
  return { propose: p.hash, accept: a.hash };
}

async function state() {
  const ship = Object.values(db.shipments).at(-1);
  let onchain = null;
  if (ship) {
    const s = await pub.readContract({ address, abi, functionName: "shipments", args: [BigInt(ship.id)] });
    onchain = { custodian: s[2], lastSeq: s[6], delivered: s[7], damaged: s[8], maxAllowedCg: s[5] };
  }
  return {
    network: NET, chainId: chain.id, contract: address, explorer: chain.blockExplorers?.default?.url ?? null,
    roles: Object.fromEntries(Object.keys(db.roles).map((r) => [r, roleAddr(r)])),
    shipment: ship ?? null, onchain, batches: db.batches.filter((b) => !ship || b.shipmentId === ship.id),
    maxCg: MAX_CG, relayerBalance: formatEther(await pub.getBalance({ address: relayer.account.address })),
  };
}

async function proof(seq, i) {
  const b = db.batches.findLast((x) => x.seq === seq);
  if (!b) throw new Error("batch sconosciuto");
  const recs = b.records.map(unhex);
  const pr = merkleProof(recs, i).map(hex);
  const ok = await pub.readContract({
    address, abi, functionName: "verifyReading", args: [BigInt(b.shipmentId), seq, b.records[i], BigInt(i), pr],
  });
  return { record: b.records[i], decoded: b.decoded[i], proof: pr, root: b.root, verifiedOnChain: ok };
}

const body = (req) => new Promise((ok, ko) => {
  let s = ""; req.on("data", (c) => (s += c)); req.on("end", () => { try { ok(s ? JSON.parse(s) : {}); } catch (e) { ko(e); } });
});
const send = (res, code, obj, type = "application/json") => {
  res.writeHead(code, { "content-type": type, "access-control-allow-origin": "*" });
  res.end(type === "application/json" ? JSON.stringify(obj, (_, v) => (typeof v === "bigint" ? v.toString() : v)) : obj);
};

http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  try {
    if (req.method === "POST" && url.pathname === "/batch") return send(res, 200, await serial(async () => handleBatch(await body(req))));
    if (req.method === "POST" && url.pathname === "/api/handoff") return send(res, 200, await serial(async () => handoff((await body(req)).to)));
    if (url.pathname === "/api/state") return send(res, 200, await state());
    if (url.pathname === "/api/proof") return send(res, 200, await proof(Number(url.searchParams.get("seq")), Number(url.searchParams.get("i"))));
    if (url.pathname === "/") return send(res, 200, readFileSync(`${ROOT}relayer/public/index.html`), "text/html; charset=utf-8");
    send(res, 404, { error: "not found" });
  } catch (e) {
    console.error("✗", e.shortMessage || e.message);
    send(res, 400, { error: e.shortMessage || e.message });
  }
}).listen(PORT, "0.0.0.0", () => {
  const ips = Object.values(networkInterfaces()).flat().filter((i) => i.family === "IPv4" && !i.internal).map((i) => i.address);
  console.log(`relayer su ${NET}, contratto ${address}`);
  console.log(`dashboard: http://localhost:${PORT}   ·   endpoint device: ${ips.map((ip) => `http://${ip}:${PORT}/batch`).join("  ")}`);
});
