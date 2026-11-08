import hre from "hardhat";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
import { zeroAddress } from "viem";
import { softDevice, makeBatch, args } from "./helpers.mjs";

const USD = (n) => BigInt(n) * 10n ** 6n;
// thresholds (hundredths of g, peak with gravity included) and withholdings in basis points
const TERMS = {
  collateral: USD(50), lightCg: 800, mediumCg: 3000, strongCg: 8000,
  lightBps: 1000, mediumBps: 4000, strongBps: 10000, set: false,
};

describe("RentalEscrow", () => {
  async function setup() {
    const [owner, alice, bob] = await hre.viem.getWalletClients();
    const log = await hre.viem.deployContract("CustodyLog");
    const usd = await hre.viem.deployContract("DemoUSD");
    const esc = await hre.viem.deployContract("RentalEscrow", [log.address, usd.address]);
    const dev = softDevice();
    await log.write.registerDevice([dev.qx, dev.qy]);
    // rental asset: the owner is its custodian, no "final receiver"
    await log.write.createShipment([dev.deviceId, owner.account.address, zeroAddress, TERMS.lightCg]);
    await esc.write.setTerms([1n, TERMS]);
    const as = async (w) => ({
      log: await hre.viem.getContractAt("CustodyLog", log.address, { client: { wallet: w } }),
      usd: await hre.viem.getContractAt("DemoUSD", usd.address, { client: { wallet: w } }),
      esc: await hre.viem.getContractAt("RentalEscrow", esc.address, { client: { wallet: w } }),
    });
    let seq = 0;
    const batch = (peaks) => log.write.submitBatch(args(1n, makeBatch(dev, ++seq, peaks)));

    async function start(w) {
      const c = await as(w);
      await c.usd.write.faucet();
      await c.usd.write.approve([esc.address, TERMS.collateral]);
      await (await as(owner)).log.write.proposeHandoff([1n, w.account.address]);
      await c.log.write.acceptHandoff([1n]);
      await c.esc.write.startRental([1n]);
    }
    async function end(w) {
      await (await as(w)).log.write.proposeHandoff([1n, owner.account.address]);
      await (await as(owner)).log.write.acceptHandoff([1n]);
      await esc.write.endRental([1n]); // anyone can close
      return (await esc.getEvents.RentalSettled())[0].args;
    }
    return { log, usd, esc, owner, alice, bob, as, batch, start, end };
  }

  it("rental without shocks: collateral fully refunded", async () => {
    const { usd, alice, batch, start, end } = await setup();
    await start(alice);
    await batch([100, 120, 180]);
    const s = await end(alice);
    expect(s.tier).to.equal(0);
    expect(s.fee).to.equal(0n);
    expect(await usd.read.balanceOf([alice.account.address])).to.equal(USD(1000));
  });

  it("medium drop: withholds 40% and gives it to the owner", async () => {
    const { usd, owner, alice, batch, start, end } = await setup();
    await start(alice);
    await batch([100, 4200, 300]); // 42 g
    const s = await end(alice);
    expect(s.peakCg).to.equal(4200);
    expect(s.tier).to.equal(2);
    expect(s.fee).to.equal(USD(20));
    expect(await usd.read.balanceOf([owner.account.address])).to.equal(USD(20));
    expect(await usd.read.balanceOf([alice.account.address])).to.equal(USD(1000 - 20));
  });

  it("one customer's shock does not weigh on the next customer's rental", async () => {
    const { usd, alice, bob, batch, start, end } = await setup();
    await start(alice);
    await batch([12000]); // 120 g: strong
    expect((await end(alice)).fee).to.equal(USD(50));
    await start(bob);
    await batch([150]);
    const s = await end(bob);
    expect(s.tier).to.equal(0);
    expect(await usd.read.balanceOf([bob.account.address])).to.equal(USD(1000));
  });

  it("cannot be closed while the customer holds the asset; only the custodian deposits; only the owner sets the terms", async () => {
    const { esc, owner, alice, bob, as, start } = await setup();
    await expect((await as(bob)).esc.write.startRental([1n])).to.be.rejectedWith("NotCustodian");
    await start(alice);
    await expect(esc.write.endRental([1n])).to.be.rejectedWith("StillInCustody");
    await expect((await as(alice)).esc.write.setTerms([1n, TERMS])).to.be.rejectedWith("NotOwner");
    await expect((await as(owner)).esc.write.setTerms([1n, TERMS])).to.be.rejectedWith("RentalActive");
  });
});
