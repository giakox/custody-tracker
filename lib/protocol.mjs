// Format shared by firmware, relayer, simulator and contract. If you change it here, also change
// firmware/CustodyTracker/CustodyTracker.ino (encodeRecord / batchDigest) and CustodyLog.sol.
import { createHash } from "node:crypto";

export const P256_N = 0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551n;
const HALF_N = P256_N >> 1n;

export const sha256 = (...bufs) => createHash("sha256").update(Buffer.concat(bufs)).digest();
export const hex = (b) => "0x" + Buffer.from(b).toString("hex");
export const unhex = (h) => Buffer.from(h.replace(/^0x/, ""), "hex");

/** Reading = 19 bytes big-endian: n u32 | t u32 | latE7 i32 | lonE7 i32 | peakCg u16 | flags u8 */
export function encodeRecord({ n, t, lat, lon, peakCg, flags }) {
  const b = Buffer.alloc(19);
  b.writeUInt32BE(n >>> 0, 0);
  b.writeUInt32BE(t >>> 0, 4);
  b.writeInt32BE(Math.round(lat * 1e7), 8);
  b.writeInt32BE(Math.round(lon * 1e7), 12);
  b.writeUInt16BE(Math.min(peakCg, 0xffff), 16);
  b.writeUInt8(flags, 18);
  return b;
}

export function decodeRecord(b) {
  return {
    n: b.readUInt32BE(0),
    t: b.readUInt32BE(4),
    lat: b.readInt32BE(8) / 1e7,
    lon: b.readInt32BE(12) / 1e7,
    peakCg: b.readUInt16BE(16),
    flags: b.readUInt8(18),
  };
}

const leafHash = (rec) => sha256(Buffer.from([0x00]), rec);
const nodeHash = (l, r) => sha256(Buffer.from([0x01]), l, r);

/** Tree levels: the last odd node is promoted unchanged (no duplication, CVE-2012-2459). */
export function merkleLevels(records) {
  let level = records.map(leafHash);
  const levels = [level];
  while (level.length > 1) {
    const next = [];
    for (let i = 0; i < level.length; i += 2)
      next.push(i + 1 < level.length ? nodeHash(level[i], level[i + 1]) : level[i]);
    levels.push((level = next));
  }
  return levels;
}

export const merkleRoot = (records) => merkleLevels(records).at(-1)[0];

export function merkleProof(records, index) {
  const levels = merkleLevels(records);
  const proof = [];
  for (const level of levels.slice(0, -1)) {
    const isRight = index & 1;
    if (isRight) proof.push(level[index - 1]);
    else if (index + 1 < level.length) proof.push(level[index + 1]);
    index >>= 1;
  }
  return proof;
}

export const deviceIdOf = (qx, qy) => sha256(unhex(qx), unhex(qy));

/** "CLv1" | deviceId 32 | seq u32 | root 32 | count u32 | maxPeakCg u16 | tStart u32 | tEnd u32 */
export function batchPreimage({ deviceId, seq, root, count, maxPeakCg, tStart, tEnd }) {
  const b = Buffer.alloc(4 + 32 + 4 + 32 + 4 + 2 + 4 + 4);
  let o = b.write("CLv1", 0, "ascii");
  unhex(deviceId).copy(b, o); o += 32;
  b.writeUInt32BE(seq, o); o += 4;
  unhex(root).copy(b, o); o += 32;
  b.writeUInt32BE(count, o); o += 4;
  b.writeUInt16BE(maxPeakCg, o); o += 2;
  b.writeUInt32BE(tStart >>> 0, o); o += 4;
  b.writeUInt32BE(tEnd >>> 0, o);
  return b;
}

export const batchDigest = (h) => sha256(batchPreimage(h));

/** OpenZeppelin P256 only accepts s <= n/2: normalize (r, s) -> (r, n - s). The signature stays valid. */
export function lowS(sHex) {
  const s = BigInt(sHex);
  return "0x" + (s > HALF_N ? P256_N - s : s).toString(16).padStart(64, "0");
}
