import { generateKeyPairSync, sign } from "node:crypto";
import {
  encodeRecord, merkleRoot, merkleProof, batchPreimage, deviceIdOf, hex, lowS,
} from "../lib/protocol.mjs";

export function softDevice() {
  const { privateKey, publicKey } = generateKeyPairSync("ec", { namedCurve: "P-256" });
  const jwk = publicKey.export({ format: "jwk" });
  const qx = hex(Buffer.from(jwk.x, "base64url"));
  const qy = hex(Buffer.from(jwk.y, "base64url"));
  return {
    qx, qy, deviceId: hex(deviceIdOf(qx, qy)),
    // ECDSA su sha256(preimage) = stessa firma che l'ATECC fa sul digest
    sign: (pre) => {
      const sig = sign("sha256", pre, { key: privateKey, dsaEncoding: "ieee-p1363" });
      return { r: hex(sig.subarray(0, 32)), s: lowS(hex(sig.subarray(32))) };
    },
  };
}

export function makeBatch(dev, seq, peaks) {
  const records = peaks.map((peakCg, i) =>
    encodeRecord({ n: seq * 100 + i, t: 1794200000 + i, lat: 45.4505 + i * 1e-4, lon: 9.1890, peakCg, flags: 1 }));
  const h = {
    deviceId: dev.deviceId, seq, root: hex(merkleRoot(records)), count: records.length,
    maxPeakCg: Math.max(...peaks), tStart: 1794200000, tEnd: 1794200000 + peaks.length - 1,
  };
  return { records, h, sig: dev.sign(batchPreimage(h)) };
}

export const args = (id, { h, sig }) => [id, h.seq, h.root, h.count, h.maxPeakCg, h.tStart, h.tEnd, sig.r, sig.s];

