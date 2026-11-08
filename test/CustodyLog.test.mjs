import hre from "hardhat";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
import { generateKeyPairSync, sign } from "node:crypto";
import {
  encodeRecord, merkleRoot, merkleProof, batchPreimage, deviceIdOf, hex, lowS,
} from "../lib/protocol.mjs";

function softDevice() {
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

function makeBatch(dev, seq, peaks) {
  const records = peaks.map((peakCg, i) =>
    encodeRecord({ n: seq * 100 + i, t: 1794200000 + i, lat: 45.4505 + i * 1e-4, lon: 9.1890, peakCg, flags: 1 }));
  const h = {
    deviceId: dev.deviceId, seq, root: hex(merkleRoot(records)), count: records.length,
    maxPeakCg: Math.max(...peaks), tStart: 1794200000, tEnd: 1794200000 + peaks.length - 1,
  };
  return { records, h, sig: dev.sign(batchPreimage(h)) };
}

const args = (id, { h, sig }) => [id, h.seq, h.root, h.count, h.maxPeakCg, h.tStart, h.tEnd, sig.r, sig.s];

describe("CustodyLog", () => {
  async function setup() {
    const [shipper, carrierA, carrierB, receiver, relayer] = await hre.viem.getWalletClients();
    const log = await hre.viem.deployContract("CustodyLog");
    const dev = softDevice();
    await log.write.registerDevice([dev.qx, dev.qy]);
    await log.write.createShipment([dev.deviceId, carrierA.account.address, receiver.account.address, 1500]);
    const as = (w) => hre.viem.getContractAt("CustodyLog", log.address, { client: { wallet: w } });
    return { log, dev, shipper, carrierA, carrierB, receiver, relayer, as };
  }

  it("ancora un batch firmato e verifica una lettura con Merkle proof", async () => {
    const { log, dev, relayer, as } = await setup();
    const b = makeBatch(dev, 1, [101, 98, 103, 99, 100]); // 5 foglie: testa il nodo dispari
    await (await as(relayer)).write.submitBatch(args(1n, b));
    for (const i of [0, 3, 4]) {
      const proof = merkleProof(b.records, i).map(hex);
      expect(await log.read.verifyReading([1n, 1, hex(b.records[i]), BigInt(i), proof])).to.equal(true);
    }
    const forged = Buffer.from(b.records[2]); forged[17] = 0; // azzero il picco: lettura manomessa
    const proof = merkleProof(b.records, 2).map(hex);
    expect(await log.read.verifyReading([1n, 1, hex(forged), 2n, proof])).to.equal(false);
  });

  it("rifiuta batch alterati, replay e firme di un altro device", async () => {
    const { log, dev } = await setup();
    const b = makeBatch(dev, 1, [100, 100]);
    const tampered = { ...b, h: { ...b.h, maxPeakCg: 100 - 1 } }; // il relayer prova ad abbassare il picco
    await expect(log.write.submitBatch(args(1n, tampered))).to.be.rejectedWith("BadSignature");
    await log.write.submitBatch(args(1n, b));
    await expect(log.write.submitBatch(args(1n, b))).to.be.rejectedWith("BadSequence");
    const other = softDevice();
    const fake = makeBatch({ ...other, deviceId: dev.deviceId }, 2, [100]);
    await expect(log.write.submitBatch(args(1n, fake))).to.be.rejectedWith("BadSignature");
  });

  it("attribuisce il danno al custode del momento", async () => {
    const { log, dev, carrierA, carrierB, receiver, as } = await setup();
    await log.write.submitBatch(args(1n, makeBatch(dev, 1, [100, 120])));
    await (await as(carrierA)).write.proposeHandoff([1n, carrierB.account.address]);
    await (await as(carrierB)).write.acceptHandoff([1n]);
    await log.write.submitBatch(args(1n, makeBatch(dev, 2, [100, 4200, 300]))); // caduta: 42 g

    const dmg = await log.getEvents.DamageDetected();
    expect(dmg).to.have.length(1);
    expect(dmg[0].args.custodian.toLowerCase()).to.equal(carrierB.account.address.toLowerCase());

    await (await as(carrierB)).write.proposeHandoff([1n, receiver.account.address]);
    await (await as(receiver)).write.acceptHandoff([1n]);
    const s = await log.read.shipments([1n]);
    expect(s[7]).to.equal(true); // delivered
    expect(s[8]).to.equal(true); // damaged
    await expect(log.write.submitBatch(args(1n, makeBatch(dev, 3, [100])))).to.be.rejectedWith("AlreadyDelivered");
  });
});
