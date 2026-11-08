import { fileURLToPath } from "node:url";
// Relayer: riceve i batch firmati dal device (HTTP, stessa rete/hotspot), conserva le letture
// off-chain e ancora root + firma su CustodyLog. Il relayer NON è fidato: se altera qualcosa
// la verifica P-256 on-chain fallisce. Gestisce anche la demo del noleggio con collaterale
// (RentalEscrow) e serve la dashboard su http://<ip>:8787.
//
// Ruoli demo: owner = proprietario del bene (chiave del relayer); alice e bob = clienti,
// con chiavi proprie generate in data/<rete>.json. In un'app reale ogni parte firma dal
// proprio wallet: il relayer tiene le chiavi solo per rendere la demo un clic.
import http from "node:http";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { networkInterfaces } from "node:os";
import { createPublicClient, createWalletClient, http as rpc, parseEther, formatEther, formatUnits, zeroAddress, parseEventLogs } from "viem";
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
import { hardhat, baseSepolia } from "viem/chains";
import { merkleRoot, decodeRecord, merkleProof, deviceIdOf, hex, unhex, lowS } from "../lib/protocol.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
try { process.loadEnvFile(fileURLToPath(new URL("../.env", import.meta.url))); } catch {}
const NET = process.env.NETWORK || "localhost";
const chain = NET === "baseSepolia" ? baseSepolia : hardhat;
const RPC = process.env.RPC_URL || (NET === "baseSepolia" ? "https://sepolia.base.org" : "http://127.0.0.1:8545");
const PORT = Number(process.env.PORT || 8787);
// Prima chiave di default di `hardhat node`: solo per la chain locale.
const HARDHAT_KEY0 = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const RELAYER_KEY = NET === "localhost" ? HARDHAT_KEY0 : process.env.PRIVATE_KEY; // in locale ignora .env
if (!RELAYER_KEY) throw new Error("Serve PRIVATE_KEY per " + NET);

// Condizioni del noleggio (provvisorie: da tarare con il test di caduta, docs/CALIBRATION.md).
// Picco = |a| con gravità inclusa, in centesimi di g. Trattenute in punti base del collaterale.
const TERMS = {
  collateral: 50_000_000n, // 50 dUSD (6 decimali)
  lightCg: 800, mediumCg: 3000, strongCg: 8000,
  lightBps: 1000, mediumBps: 4000, strongBps: 10000, set: false,
};

const dep = JSON.parse(readFileSync(`${ROOT}deployments/${NET}.json`, "utf8"));
const artifact = (n) => JSON.parse(readFileSync(`${ROOT}artifacts/contracts/${n}.sol/${n}.json`, "utf8")).abi;
const C = {
  log: { address: dep.address, abi: artifact("CustodyLog") },
  escrow: { address: dep.escrow, abi: artifact("RentalEscrow") },
  usd: { address: dep.token, abi: artifact("DemoUSD") },
};
if (!C.escrow.address) throw new Error(`deployments/${NET}.json senza escrow: rifare il deploy (scripts/deploy.mjs)`);
const { address } = C.log;

const pub = createPublicClient({ chain, transport: rpc(RPC) });
const walletFor = (pk) => createWalletClient({ account: privateKeyToAccount(pk), chain, transport: rpc(RPC) });
const relayer = walletFor(RELAYER_KEY);

// --- stato locale (data availability delle letture) ---
mkdirSync(`${ROOT}data`, { recursive: true });
const DB = `${ROOT}data/${NET}.json`;
let db = existsSync(DB) ? JSON.parse(readFileSync(DB, "utf8")) : null;
if (!db || db.escrow !== C.escrow.address) {
  // nuovo deploy (o vecchio formato a "spedizioni"): si riparte da zero
  db = { escrow: C.escrow.address, roles: null, shipments: {}, batches: [], settlements: [] };
}
const save = () => writeFileSync(DB, JSON.stringify(db, null, 2));
if (!db.roles) {
  db.roles = { alice: generatePrivateKey(), bob: generatePrivateKey() };
  save();
}
const keyOf = (r) => (r === "owner" ? RELAYER_KEY : db.roles[r]);
const roleAddr = (r) => privateKeyToAccount(keyOf(r)).address;
const ROLES = ["owner", "alice", "bob"];
const roleOf = (addr) => ROLES.find((r) => roleAddr(r).toLowerCase() === addr.toLowerCase()) ?? addr;

async function fundRoles() {
  // Su Base Sepolia una transazione dei clienti costa ~1e-7–1e-6 ETH: 0,00001 ETH bastano per decine.
  const fund = parseEther(process.env.ROLE_FUND_ETH || (NET === "localhost" ? "0.0005" : "0.00001"));
  for (const r of ["alice", "bob"]) {
    const bal = await pub.getBalance({ address: roleAddr(r) });
    if (bal < fund / 2n) {
      const hash = await relayer.sendTransaction({ to: roleAddr(r), value: fund });
      await pub.waitForTransactionReceipt({ hash, timeout: 60_000 });
    }
  }
}

const tx = async (wallet, c, functionName, args = []) => {
  const hash = await wallet.writeContract({ address: c.address, abi: c.abi, functionName, args });
  const rc = await pub.waitForTransactionReceipt({ hash, timeout: 60_000 });
  if (rc.status !== "success") throw new Error(`${functionName} reverted`);
  return { hash, gasUsed: rc.gasUsed.toString(), logs: rc.logs };
};
const read = (c, functionName, args = []) => pub.readContract({ address: c.address, abi: c.abi, functionName, args });

// Coda seriale: niente nonce in conflitto se arrivano due batch insieme.
// Ogni job ha un timeout: una transazione appesa (RPC caduto, cambio di rete) non deve
// bloccare per sempre tutti i batch successivi.
const JOB_TIMEOUT_MS = Number(process.env.JOB_TIMEOUT_MS || 90_000);
let queue = Promise.resolve();
const serial = (fn, ms = JOB_TIMEOUT_MS) => {
  const job = queue.then(() => Promise.race([
    fn(),
    new Promise((_, rej) => setTimeout(() => rej(new Error(`timeout ${ms / 1000}s (RPC lento o appeso)`)), ms)),
  ]));
  queue = job.catch(() => {});
  return job;
};

// Un device = un bene a noleggio. Il proprietario (relayer) ne è il primo custode e
// non c'è "destinatario finale": il bene passa di cliente in cliente.
async function ensureAsset(qx, qy) {
  const deviceId = hex(deviceIdOf(qx, qy));
  if (db.shipments[deviceId]) return db.shipments[deviceId];
  const [, , registered] = await read(C.log, "devices", [deviceId]);
  if (!registered) await tx(relayer, C.log, "registerDevice", [qx, qy]);
  await tx(relayer, C.log, "createShipment", [deviceId, roleAddr("owner"), zeroAddress, TERMS.lightCg]);
  const id = Number(await read(C.log, "shipmentCount"));
  await tx(relayer, C.escrow, "setTerms", [BigInt(id), TERMS]);
  db.shipments[deviceId] = { id, custodian: "owner", qx, qy };
  save();
  console.log(`device ${deviceId.slice(0, 10)}… registrato, bene #${id}`);
  return db.shipments[deviceId];
}

async function handleBatch(b) {
  const recs = b.records.map(unhex);
  if (recs.some((r) => r.length !== 19)) throw new Error("record di lunghezza errata");
  const root = hex(merkleRoot(recs));
  if (root.toLowerCase() !== b.root.toLowerCase()) throw new Error(`root non coincide: device ${b.root} vs ricalcolata ${root}`);
  const ship = await ensureAsset(b.qx, b.qy);
  const t = await tx(relayer, C.log, "submitBatch", [
    BigInt(ship.id), b.seq, root, recs.length, b.maxPeakCg, b.tStart, b.tEnd, b.r, lowS(b.s),
  ]);
  const entry = {
    shipmentId: ship.id, seq: b.seq, root, maxPeakCg: b.maxPeakCg, hw: !!b.hw, custodian: ship.custodian,
    records: b.records, decoded: recs.map(decodeRecord), tx: t.hash, gasUsed: t.gasUsed, at: Date.now(),
  };
  db.batches.push(entry);
  save();
  const dmg = b.maxPeakCg >= TERMS.lightCg ? `  ⚠ URTO ${(b.maxPeakCg / 100).toFixed(1)} g → ${ship.custodian}` : "";
  console.log(`#${ship.id} seq ${b.seq} · ${recs.length} letture · gas ${t.gasUsed} · ${t.hash}${dmg}`);
  return entry;
}

const currentAsset = () => {
  const ship = Object.values(db.shipments).at(-1);
  if (!ship) throw new Error("nessun bene registrato: aspetta il primo batch del device");
  return ship;
};

// Sblocco: owner propone, cliente accetta (due firme), cliente deposita il collaterale.
async function startRental(renter) {
  if (!["alice", "bob"].includes(renter)) throw new Error("cliente sconosciuto (alice | bob)");
  const ship = currentAsset();
  if (ship.custodian !== "owner") throw new Error(`il bene è già noleggiato da ${ship.custodian}`);
  await fundRoles();
  const w = walletFor(keyOf(renter));
  const bal = await read(C.usd, "balanceOf", [roleAddr(renter)]);
  if (bal < TERMS.collateral) await tx(w, C.usd, "faucet");
  await tx(w, C.usd, "approve", [C.escrow.address, TERMS.collateral]);
  const id = BigInt(ship.id);
  const p = await tx(relayer, C.log, "proposeHandoff", [id, roleAddr(renter)]);
  const a = await tx(w, C.log, "acceptHandoff", [id]);
  const s = await tx(w, C.escrow, "startRental", [id]);
  ship.custodian = renter;
  save();
  console.log(`noleggio #${ship.id} iniziato da ${renter}: collaterale ${formatUnits(TERMS.collateral, 6)} dUSD`);
  return { renter, propose: p.hash, accept: a.hash, deposit: s.hash };
}

// Riconsegna: cliente propone, owner accetta, poi chiunque chiude e il contratto regola.
async function endRental() {
  const ship = currentAsset();
  const renter = ship.custodian;
  if (renter === "owner") throw new Error("nessun noleggio in corso");
  const id = BigInt(ship.id);
  const p = await tx(walletFor(keyOf(renter)), C.log, "proposeHandoff", [id, roleAddr("owner")]);
  const a = await tx(relayer, C.log, "acceptHandoff", [id]);
  ship.custodian = "owner";
  save();
  const e = await tx(relayer, C.escrow, "endRental", [id]);
  const s = parseEventLogs({ abi: C.escrow.abi, logs: e.logs, eventName: "RentalSettled" })[0].args;
  const out = {
    shipmentId: ship.id, renter, period: Number(s.period), peakCg: Number(s.peakCg), tier: Number(s.tier),
    fee: formatUnits(s.fee, 6), refund: formatUnits(s.refund, 6), tx: e.hash, returnTx: a.hash, proposeTx: p.hash, at: Date.now(),
  };
  db.settlements.push(out);
  save();
  console.log(`noleggio #${ship.id} chiuso (${renter}): picco ${(out.peakCg / 100).toFixed(1)} g, livello ${out.tier}, trattenuti ${out.fee} dUSD, restituiti ${out.refund}`);
  return out;
}

async function state() {
  const ship = Object.values(db.shipments).at(-1);
  let onchain = null, rental = null;
  if (ship) {
    const id = BigInt(ship.id);
    const s = await read(C.log, "shipments", [id]);
    const period = await read(C.log, "custodyPeriod", [id]);
    onchain = { custodian: s[2], custodianRole: roleOf(s[2]), lastSeq: s[6], damaged: s[8], period };
    const r = await read(C.escrow, "rentals", [id]);
    if (r[3]) {
      const peak = await read(C.log, "periodMaxPeakCg", [id, r[1]]);
      const tier = await read(C.escrow, "tierOf", [id, peak]);
      rental = { renter: roleOf(r[0]), period: r[1], collateral: formatUnits(r[2], 6), peakCg: peak, tier };
    }
  }
  const balances = {};
  for (const r of ROLES) balances[r] = formatUnits(await read(C.usd, "balanceOf", [roleAddr(r)]), 6);
  return {
    network: NET, chainId: chain.id, explorer: chain.blockExplorers?.default?.url ?? null,
    contract: address, contracts: { custodyLog: address, escrow: C.escrow.address, token: C.usd.address },
    roles: Object.fromEntries(ROLES.map((r) => [r, roleAddr(r)])),
    terms: { ...TERMS, collateral: formatUnits(TERMS.collateral, 6) },
    shipment: ship ?? null, onchain, rental, balances, settlements: db.settlements,
    batches: db.batches.filter((b) => !ship || b.shipmentId === ship.id),
    maxCg: TERMS.lightCg, relayerBalance: formatEther(await pub.getBalance({ address: relayer.account.address })),
  };
}

async function proof(seq, i) {
  const b = db.batches.findLast((x) => x.seq === seq);
  if (!b) throw new Error("batch sconosciuto");
  const recs = b.records.map(unhex);
  const pr = merkleProof(recs, i).map(hex);
  const ok = await read(C.log, "verifyReading", [BigInt(b.shipmentId), seq, b.records[i], BigInt(i), pr]);
  return { record: b.records[i], decoded: b.decoded[i], proof: pr, root: b.root, verifiedOnChain: ok };
}

const body = (req) => new Promise((ok, ko) => {
  let s = ""; req.on("data", (c) => (s += c)); req.on("end", () => { try { ok(s ? JSON.parse(s) : {}); } catch (e) { ko(e); } });
});
const send = (res, code, obj, type = "application/json") => {
  res.writeHead(code, { "content-type": type, "access-control-allow-origin": "*", "access-control-allow-headers": "content-type" });
  res.end(type === "application/json" ? JSON.stringify(obj, (_, v) => (typeof v === "bigint" ? v.toString() : v)) : obj);
};

http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  try {
    if (req.method === "OPTIONS") return send(res, 204, "", "text/plain");
    if (req.method === "POST" && url.pathname === "/batch") return send(res, 200, await serial(async () => handleBatch(await body(req))));
    if (req.method === "POST" && url.pathname === "/api/rental/start") return send(res, 200, await serial(async () => startRental((await body(req)).renter), 240_000));
    if (req.method === "POST" && url.pathname === "/api/rental/end") return send(res, 200, await serial(() => endRental(), 240_000));
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
  console.log(`relayer su ${NET} · CustodyLog ${address} · RentalEscrow ${C.escrow.address} · dUSD ${C.usd.address}`);
  console.log(`dashboard: http://localhost:${PORT}   ·   endpoint device: ${ips.map((ip) => `http://${ip}:${PORT}/batch`).join("  ")}`);
});
