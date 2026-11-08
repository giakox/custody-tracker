import hre from "hardhat";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
import { merkleProof, hex } from "../lib/protocol.mjs";
import { softDevice, makeBatch, args } from "./helpers.mjs";

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

  it("anchors a signed batch and verifies a reading with a Merkle proof", async () => {
    const { log, dev, relayer, as } = await setup();
    const b = makeBatch(dev, 1, [101, 98, 103, 99, 100]); // 5 leaves: exercises the odd node
    await (await as(relayer)).write.submitBatch(args(1n, b));
    for (const i of [0, 3, 4]) {
      const proof = merkleProof(b.records, i).map(hex);
      expect(await log.read.verifyReading([1n, 1, hex(b.records[i]), BigInt(i), proof])).to.equal(true);
    }
    const forged = Buffer.from(b.records[2]); forged[17] = 0; // zero out the peak: tampered reading
    const proof = merkleProof(b.records, 2).map(hex);
    expect(await log.read.verifyReading([1n, 1, hex(forged), 2n, proof])).to.equal(false);
  });

  it("rejects tampered batches, replays and signatures from another device", async () => {
    const { log, dev } = await setup();
    const b = makeBatch(dev, 1, [100, 100]);
    const tampered = { ...b, h: { ...b.h, maxPeakCg: 100 - 1 } }; // the relayer tries to lower the peak
    await expect(log.write.submitBatch(args(1n, tampered))).to.be.rejectedWith("BadSignature");
    await log.write.submitBatch(args(1n, b));
    await expect(log.write.submitBatch(args(1n, b))).to.be.rejectedWith("BadSequence");
    const other = softDevice();
    const fake = makeBatch({ ...other, deviceId: dev.deviceId }, 2, [100]);
    await expect(log.write.submitBatch(args(1n, fake))).to.be.rejectedWith("BadSignature");
  });

  it("attributes the damage to the custodian at the time", async () => {
    const { log, dev, carrierA, carrierB, receiver, as } = await setup();
    await log.write.submitBatch(args(1n, makeBatch(dev, 1, [100, 120])));
    await (await as(carrierA)).write.proposeHandoff([1n, carrierB.account.address]);
    await (await as(carrierB)).write.acceptHandoff([1n]);
    await log.write.submitBatch(args(1n, makeBatch(dev, 2, [100, 4200, 300]))); // drop: 42 g

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
