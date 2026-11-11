# Writes public/diagrams/sharify-system.svg (16:9, light, for the slides).
# Same content as src/wireframes/SystemDiagram.tsx, shortened to fit: change both together.
# Run: python3 scripts/build-diagram.py
rows = [
  ("Recorder on the object", "ADXL375 · GPS · ATECC608", ["1600 samples/s, peak of each second kept;", "signs a Merkle root every 16 readings"],
   "Edit the readings afterwards", ["Breaks the signature. It proves which chip", "and no later change, not an intact sensor"]),
  ("Signed batch", "root · seq · max peak · times · P-256", ["Only the fingerprint goes on-chain;", "readings are proven one by one"],
   "Replay or reorder batches", ["seq only goes up: the contract refuses", "any seq it has already passed"]),
  ("Relayer (not trusted)", "Wi-Fi in · pays the gas", ["Forwards batches, keeps the raw", "readings for maps and proofs"],
   "Drop or change a batch", ["A change fails the on-chain signature check;", "a dropped batch leaves a visible seq gap"]),
  ("CustodyLog contract", "P-256 check on-chain · custody periods", ["Stores the root against whoever holds it;", "handover = one proposes, the other accepts"],
   "Blame someone for older damage", ["Each batch belongs to the custodian of that", "moment; each period keeps its own peak"]),
  ("RentalEscrow contract", "deposit · three shock levels", ["Holds the deposit; after the return anyone", "triggers the settlement by the rule"],
   "Keep the deposit, change the rules", ["The money sits in the contract, and the rules", "are locked while a rental is active"]),
]
limits = [
  ["The signature protects the key, not", "the measurement: new firmware or a", "detached recorder signs wrong data."],
  ["No manufacturer certificate yet:", "any public key can be registered."],
  ["Open pairing: anyone can create an", "object on a registered recorder, and a", "batch doesn't name its object."],
  ["Deposit hostage: no deadline if the", "owner never confirms the return.", "Fix: it counts anyway after 24 h."],
  ["A shock is not damage: the levels", "are a rule accepted in advance."],
  ["A batch arriving after the return", "counts for the next custodian."],
  ["Raw readings live with the relayer;", "only fingerprints are on-chain."],
  ["Demo: the relayer holds all keys.", "Product: each side signs itself."],
]
esc = lambda s: s.replace("&", "&amp;").replace("<", "&lt;")
o = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" width="1600" height="900" font-family="Figtree, Helvetica, Arial, sans-serif">',
     '<title>Sharify: how the system is designed</title>',
     '<rect width="1600" height="900" fill="#FFFFFF"/>',
     '<text x="60" y="66" font-size="40" fill="#17191B">How Sharify is designed</text>',
     '<text x="60" y="98" font-size="18" fill="#3B3F43">Each step: what it does, who could cheat there, and why it fails.</text>',
     '<text x="600" y="128" font-size="14" font-family="IBM Plex Mono, Menlo, monospace" fill="#565B60">Who could cheat, and why it fails</text>']
for i, (name, parts, does, cheat, why) in enumerate(rows):
    y = 140 + i * 148
    o.append(f'<rect x="60" y="{y}" width="500" height="118" fill="#FFFFFF" stroke="#17191B" stroke-width="2"/>')
    o.append(f'<circle cx="60" cy="{y}" r="15" fill="#0297DE"/><text x="60" y="{y+5}" font-size="14" font-family="IBM Plex Mono, Menlo, monospace" fill="#02070A" text-anchor="middle">{i+1}</text>')
    o.append(f'<text x="82" y="{y+32}" font-size="24" fill="#17191B">{esc(name)}</text>')
    o.append(f'<text x="82" y="{y+56}" font-size="14" font-family="IBM Plex Mono, Menlo, monospace" fill="#565B60">{esc(parts)}</text>')
    for k, l in enumerate(does): o.append(f'<text x="82" y="{y+82+k*21}" font-size="17" fill="#17191B">{esc(l)}</text>')
    o.append(f'<rect x="600" y="{y}" width="520" height="118" rx="4" fill="#FAF8F5" stroke="#D9D3CA" stroke-dasharray="6 4"/>')
    o.append(f'<text x="620" y="{y+32}" font-size="17" fill="#17191B"><tspan font-family="IBM Plex Mono, Menlo, monospace" font-size="13" fill="#0297DE">Could cheat  </tspan>{esc(cheat)}</text>')
    o.append(f'<text x="620" y="{y+62}" font-size="13" font-family="IBM Plex Mono, Menlo, monospace" fill="#565B60">Why it fails</text>')
    for k, l in enumerate(why): o.append(f'<text x="620" y="{y+84+k*21}" font-size="17" fill="#17191B">{esc(l)}</text>')
    o.append(f'<line x1="560" y1="{y+59}" x2="600" y2="{y+59}" stroke="#D9D3CA" stroke-width="1.5"/>')
    if i < len(rows) - 1:
        ax = 310
        o.append(f'<line x1="{ax}" y1="{y+118}" x2="{ax}" y2="{y+142}" stroke="#0297DE" stroke-width="2"/><path d="M{ax-7},{y+135} L{ax},{y+146} L{ax+7},{y+135}" fill="none" stroke="#0297DE" stroke-width="2"/>')
o.append('<rect x="1160" y="140" width="380" height="710" rx="4" fill="#FFFFFF" stroke="#D9D3CA" stroke-width="1.5"/>')
o.append('<text x="1180" y="178" font-size="24" fill="#17191B">Limits we state</text>')
y = 208
for lim in limits:
    o.append(f'<rect x="1180" y="{y-9}" width="8" height="8" fill="none" stroke="#0297DE"/>')
    for k, l in enumerate(lim): o.append(f'<text x="1196" y="{y+k*20}" font-size="15" fill="#17191B">{esc(l)}</text>')
    y += len(lim) * 20 + 14
assert y < 860, f"limits overflow the box: {y}"
o.append('</svg>')
open('public/diagrams/sharify-system.svg', 'w').write("\n".join(o))
print("ok, limits end at", y)
