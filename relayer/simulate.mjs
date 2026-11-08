import { fileURLToPath } from "node:url";
// Device simulato: stesso formato del firmware, chiave P-256 software (data/sim-device.pem).
// Uso: node relayer/simulate.mjs [--batches 6] [--drop 3] [--every 3000] [--url http://localhost:8787]
import { generateKeyPairSync, createPrivateKey, createPublicKey, sign } from "node:crypto";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { encodeRecord, merkleRoot, batchPreimage, deviceIdOf, hex } from "../lib/protocol.mjs";

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const URL_ = arg("url", "http://localhost:8787");
const N_BATCHES = Number(arg("batches", 6));
const DROP_AT = Number(arg("drop", 3)); // batch in cui simulare la caduta (0 = mai)
const EVERY = Number(arg("every", 3000));
const PER_BATCH = 16;

const ROOT = fileURLToPath(new URL("..", import.meta.url));
mkdirSync(`${ROOT}data`, { recursive: true });
const PEM = `${ROOT}data/sim-device.pem`;
if (!existsSync(PEM))
  writeFileSync(PEM, generateKeyPairSync("ec", { namedCurve: "P-256" }).privateKey.export({ type: "pkcs8", format: "pem" }));
const key = createPrivateKey(readFileSync(PEM));
const jwk = createPublicKey(key).export({ format: "jwk" });
const qx = hex(Buffer.from(jwk.x, "base64url"));
const qy = hex(Buffer.from(jwk.y, "base64url"));
const deviceId = hex(deviceIdOf(qx, qy));

// Percorso: Bocconi (via Sarfatti) → Linate, interpolato
const A = [45.4505, 9.1890], B = [45.4600, 9.2780];
let n = 0;
// Contatore monotono persistente (sul device lo fa il counter hardware dell'ATECC608)
const SEQ = `${ROOT}data/sim-seq.txt`;
const seqStart = existsSync(SEQ) ? Number(readFileSync(SEQ, "utf8")) : 0;

for (let k = 1; k <= N_BATCHES; k++) {
  const records = [];
  let maxPeakCg = 0;
  const t0 = Math.floor(Date.now() / 1000);
  for (let i = 0; i < PER_BATCH; i++) {
    const f = ((k - 1) * PER_BATCH + i) / (N_BATCHES * PER_BATCH);
    const drop = k === DROP_AT && i === 9;
    const peakCg = drop ? 3800 + Math.floor(Math.random() * 1500) : 100 + Math.floor(Math.random() * 60);
    maxPeakCg = Math.max(maxPeakCg, peakCg);
    records.push(encodeRecord({
      n: n++, t: t0 + i, lat: A[0] + (B[0] - A[0]) * f + (Math.random() - 0.5) * 2e-5,
      lon: A[1] + (B[1] - A[1]) * f + (Math.random() - 0.5) * 2e-5, peakCg, flags: 0b01 | (drop ? 0b10 : 0),
    }));
  }
  writeFileSync(SEQ, String(seqStart + k));
  const h = { deviceId, seq: seqStart + k, root: hex(merkleRoot(records)), count: PER_BATCH, maxPeakCg, tStart: t0, tEnd: t0 + PER_BATCH - 1 };
  const sig = sign("sha256", batchPreimage(h), { key, dsaEncoding: "ieee-p1363" });
  const res = await fetch(`${URL_}/batch`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...h, qx, qy, records: records.map(hex), r: hex(sig.subarray(0, 32)), s: hex(sig.subarray(32)), hw: false }),
  });
  const out = await res.json();
  console.log(res.ok ? `batch ${k}/${N_BATCHES} seq ${h.seq} peak ${(maxPeakCg / 100).toFixed(1)} g → ${out.tx}` : `✗ ${out.error}`);
  if (k < N_BATCHES) await new Promise((r) => setTimeout(r, EVERY));
}
