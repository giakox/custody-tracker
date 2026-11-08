# Accelerometer calibration and shock thresholds

## What the other team gave us

A MicroPython driver for the ADXL375 on a Raspberry Pi Pico (I2C on GP0/GP1). In short:

- `BW_RATE = 0x0A`, i.e. **100 Hz** output data rate (usable bandwidth about 50 Hz);
- reads the 6 bytes `DATAX0..DATAZ1`, two's complement, 49 mg/LSB scale converted to m/s²;
- **static calibration**: 100 samples with the device still and flat, then `offset_x = mean_x`, `offset_y = mean_y`, `offset_z = mean_z − 1 g`, subtracted from every reading;
- in the example the reading is polled every 500 ms.

### What is worth taking

- **Zeroing the offset is correct and useful.** At rest our sensor reads 0.77–1.15 g instead of 1.00 g: this is the factory per-axis offset (up to a few hundred mg), consistent with the datasheet. It does not matter for the "strong" threshold (tens of g); it does for a "light" threshold of a few g.

### What should not be taken, and why

1. **100 Hz is too low for shocks.** An impact on a rigid surface lasts 1–5 ms. With one sample every 10 ms, a 2 ms peak is seen on average once in five times. On top of that, the chip's internal filter at 50 Hz bandwidth attenuates exactly the peak. The result is a systematic and random underestimate of the peak. Our firmware samples at **1600 Hz** (about 800 Hz bandwidth) in FIFO stream mode, drained every 5 ms: no samples lost.
2. **Polling every 500 ms** without the FIFO: in practice every shock is missed. You need the FIFO, or at least a threshold interrupt (`THRESH_SHOCK` on INT1).
3. **The calibration assumes Z pointing up.** If the chip is mounted sideways (on a bike frame, vertically), `z − 1 g` introduces a 1 g error on one axis and "hides" it on another. The device must work in any orientation.

## What we do

### 1. Dynamic peak, independent of orientation

Today the firmware records `peakCg = max |a|`, i.e. the magnitude of the vector, which **includes gravity**: at rest it is about 1 g, regardless of how it is mounted. For thresholds the dynamic component is better:

- **simple:** `|a| − 1 g` (maximum error ±1 g, irrelevant above 5 g);
- **correct:** estimate gravity with a per-axis low-pass filter (τ ≈ 0.5–1 s) while the device is still, then `peak = max |a − g_estimated|`. It works in any orientation and also if the object tilts slowly.

### 2. Offset zeroing, in hardware

The ADXL375 has the registers `OFSX/OFSY/OFSZ` (0x1E–0x20, 0.196 g/LSB, two's complement) that subtract the offset inside the chip. Procedure (serial command `CAL` to be added to the firmware):

1. device still, in any known orientation (better: flat);
2. average about 1600 samples (1 s);
3. per-axis offset = mean − expected value (0, 0, ±1 g on the vertical axis), rounded to 0.196 g;
4. write to `OFS*` and save to NVS, then reapply at every boot.

Expected residual after calibration: less than 0.1 g, i.e. below the quantization noise (49 mg/LSB).

### 3. Three-level thresholds (light / medium / strong)

The product (see `docs/VISION.md`) withholds a fee based on the severity of the shock. The thresholds **must be measured**, not invented, because the peak depends almost entirely on **how** the object stops:

- from a height h the impact velocity is v = √(2gh);
- if the stop happens over a distance d, the average peak is a/g ≈ h/d;
- 50 cm onto a rigid floor with d ≈ 1–2 mm gives **250–500 g**, beyond the 200 g full scale; the same drop inside a padded box with d ≈ 1 cm gives about **50 g**.

**So the same shock gives different numbers depending on object, mounting and surface: calibration is done per object type, with the chip mounted as in the product.**

Indicative orders of magnitude, to be replaced with our measurements:

| Context | Typical peaks |
|---|---|
| bike: potholes, curbs | 5–20 g on the frame |
| bike or scooter falling to the ground from standstill | 20–80 g |
| object (camera) dropped on a hard surface | 100–500 g, often saturating |
| car: low-speed impact (parking) | 3–10 g, but long (50–150 ms) |

The last row shows the limit of the peak alone: a rear-end bump has a low peak but lasts a long time. For cars we also need **Δv** (the integral of the dynamic acceleration during the event), which is a better damage indicator than the peak.

### Drop test procedure

1. Chip rigidly fixed to the object (or to the demo box), normal firmware with `CAL` already done.
2. Heights: 10, 20, 30, 50, 80 cm; surfaces: wooden table, floor, mat. **5 repetitions** per combination.
3. For each trial: recorded peak (from the on-chain batch or the serial log), noting whether it saturates (≥ 200 g on an axis).
4. Table and chart of peak vs height per surface, with mean and spread.
5. Proposed thresholds: **light** = above the normal-use noise (maximum over 10 minutes of use without drops) + margin; **medium** = drop from about 30 cm; **strong** = drop from about 80 cm or saturation.

The chart is material for the slides: it shows that the thresholds come from measurements, not from an arbitrarily chosen number.

## Status

- [x] 1600 Hz sampling in FIFO, per-second peak, immediate batch closure after a shock.
- [ ] `CAL` command with offset in `OFS*` + NVS.
- [ ] Dynamic peak (gravity subtracted).
- [ ] Three thresholds in place of `SHOCK_CG` / `maxAllowedCg` (firmware + contract).
- [ ] Drop test and table.
