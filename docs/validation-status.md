# Validation status

This document separates reported simulation tests from tests that still require evidence or physical implementation.

## Reported as passed by the project team

The project team reported successful tests for:
- Mokxi ESP32 simulation compiling and running.
- Three-zone ADC sampling and baseline calibration in simulation.
- Threshold-based zone fault detection in simulation.
- Simulated HTTPS upload to the backend after configuring the tunnel and Mokxi Real Internet.
- Backend event retrieval and dashboard update.
- Normal and single-zone fault demonstration.

These are team-reported outcomes from the simulator workflow. Attach dated screenshots/logs before treating them as independently reproducible evidence.

## Code-inspection findings at this revision

- Backend accepted three numeric zone values in the 0–3.3 V range, but originally retained data only in process memory. This branch changes storage to a local JSON file.
- The committed frontend source displays three zone cards and demo controls. A dedicated Digital Twin visualization is not evident in the inspected `frontend/src/App.tsx`; verify the current implementation and add its screenshot only after confirming it exists.
- The Mokxi sketch is embedded in `diagram.mokxi.json`, not found at the initially assumed `firmware/sketch.ino` path.
- The Mokxi diagram currently contains Wokwi-style Wi-Fi credentials. Verify them against the working Mokxi board settings.
- No Verilog classifier or testbench result was confirmed during this review.

## Pending validation

| Test | Status |
|---|---|
| Physical ESP32 three-zone circuit | Not yet evidenced |
| Physical voltage calibration | Not yet evidenced |
| Physical fault injection and localization | Not yet evidenced |
| Persistent storage across backend restart | Must run after merging this branch |
| Verilog classifier simulation | Not implemented / no result supplied |
| Digital Twin source-level verification | Pending |
| Long-duration reliability and transient response | Not tested |

## Suggested reproducibility checks

1. Start backend, submit a valid reading, stop backend, restart it, and confirm the record remains in `GET /api/events`.
2. Submit missing zones, extra zones, string voltages, NaN/Infinity representations, and values outside 0–3.3 V; expect HTTP 400.
3. Submit malformed JSON; expect HTTP 400 JSON response.
4. Submit an oversized body; expect HTTP 413 JSON response.
5. Run the normal and single-zone fault tests in Mokxi, recording serial output and backend response codes.
6. Repeat the equivalent test with physical hardware before claiming hardware validation.

## Verilog result template

When the classifier and testbench are actually implemented, add:
- HDL simulator and version.
- Module interface and fault-code mapping.
- Test vectors, expected outputs and observed outputs.
- PASS/FAIL count and waveform screenshot.
- Known limitations, including simultaneous-fault behavior.
