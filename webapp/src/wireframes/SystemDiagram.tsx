// The logical design of the system as a block diagram: what each stage does, who could cheat
// there, and why they can't. Same content as public/diagrams/sharify-system.svg (for the slides):
// change both together.

export const STAGES = [
  {
    name: "Recorder on the object",
    parts: "ADXL375 accelerometer · GPS · ATECC608 secure element",
    does: "1600 samples per second; keeps the peak of each second. Every 16 readings it builds a Merkle root and signs it with a key that never leaves the secure element.",
    cheat: "Someone edits the readings afterwards.",
    why: "Any change breaks the signature. The signature proves which chip produced the data and that it wasn't altered after; it does not prove the sensor itself is intact.",
  },
  {
    name: "Signed batch",
    parts: "root · seq · max peak · start/end time · P-256 signature",
    does: "Only the fingerprint travels with the signature; the 16 readings stay off-chain and can be proven one by one.",
    cheat: "Someone replays an old batch or reorders them.",
    why: "seq is a counter that only goes up: the contract refuses any batch with a seq it has already passed.",
  },
  {
    name: "Relayer (not trusted)",
    parts: "receives batches over Wi-Fi, pays the gas",
    does: "Forwards each batch to the chain and keeps the raw readings for the map and the proofs.",
    cheat: "The relayer drops a batch, or changes one.",
    why: "A change fails the signature check on-chain. A dropped batch leaves a visible hole in the seq numbers.",
  },
  {
    name: "CustodyLog contract",
    parts: "on-chain P-256 verification · custody periods",
    does: "Checks the chip's signature, stores the root, and records the batch against whoever holds the object at that moment. A handover needs both sides: one proposes, the other accepts.",
    cheat: "The owner blames a renter for older damage, or a renter blames the previous one.",
    why: "Every batch is attributed to the custodian of that moment, and each custody period keeps its own peak.",
  },
  {
    name: "RentalEscrow contract",
    parts: "deposit in stablecoins · three shock levels",
    does: "Holds the deposit. After the return anyone can trigger the settlement: it reads the peak of that rental, picks the level and pays the fee to the owner, the rest to the renter.",
    cheat: "The owner keeps the deposit or changes the rules mid-rental.",
    why: "The money sits in the contract, not with the owner, and the rules are locked while a rental is active.",
  },
] as const;

export const LIMITS = [
  "The signature protects the key, not the measurement: replaced firmware or a recorder that is detached or padded produces honest-looking signatures of wrong data.",
  "Today any public key can be registered: there is no manufacturer certificate proving it belongs to a real secure element.",
  "Pairing is open: anyone can create an object on a recorder that is already registered, and the signed batch doesn't name the object, so the same batch counts for every object on that recorder.",
  "The deposit can be held hostage: a return counts only when the owner accepts it, and there is no deadline. Fix: after 24 hours without confirmation the return counts anyway.",
  "A shock is not damage. The levels are a rule both sides accept before the rental.",
  "A batch that reaches the chain after the return counts for the next custodian.",
  "The raw readings live with the relayer; only their fingerprints are on-chain.",
  "In today's demo the relayer also holds the owner's and renters' keys; in the product each side signs from its own wallet.",
] as const;

export function SystemDiagram() {
  return (
    <figure className="sd">
      <ol className="sd-flow">
        {STAGES.map((s, i) => (
          <li key={s.name} className="sd-stage">
            <div className="sd-block">
              <span className="sd-n">{i + 1}</span>
              <h4>{s.name}</h4>
              <p className="sd-parts">{s.parts}</p>
              <p>{s.does}</p>
            </div>
            <div className="sd-cheat">
              <p><b>Could cheat:</b> {s.cheat}</p>
              <p><b>Why it fails:</b> {s.why}</p>
            </div>
          </li>
        ))}
      </ol>
      <figcaption>
        <b>Limits we state ourselves</b>
        <ul>{LIMITS.map((l) => <li key={l}>{l}</li>)}</ul>
        <a href="./diagrams/sharify-system.svg" download>Download the diagram for the slides (SVG)</a>
      </figcaption>
    </figure>
  );
}
