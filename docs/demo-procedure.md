# Hackathon judge demonstration procedure

## Objective

Demonstrate the simulated three-zone monitoring pipeline: voltage sampling, baseline comparison, fault localization, HTTPS upload, backend event storage and dashboard display.

## Before the presentation

1. Confirm the laptop has Node.js 18+ and dependencies installed.
2. Start the backend in a terminal: `cd backend` then `npm start`.
3. Check `http://127.0.0.1:3000/api/health`.
4. Start the frontend in a second terminal: `cd frontend` then `npm run dev`.
5. Open the Vite URL printed by the terminal.
6. Start an HTTPS tunnel forwarding to port 3000 and update the simulator's `SERVER_URL` if the URL changed.
7. Confirm Mokxi Real Internet quota is available. The Free tier has a limited daily request allowance and may return HTTP 429 after it is exhausted.
8. Open Mokxi Serial Monitor and ensure all zones are in their normal positions before calibration.

## Live demonstration

### Part A — Normal condition

- Start the Mokxi simulation.
- Show Wi-Fi connection and calibration output in Serial Monitor.
- Keep all three potentiometers at the calibrated normal positions.
- Show normal voltage readings and green status LED.
- Confirm the dashboard reports normal readings.

### Part B — Inject a fault

- Change only the Zone B potentiometer.
- Show the measured Zone B voltage moving away from its baseline and the Zone B fault flag.
- Show the red status LED.
- Wait for the next permitted upload interval.
- Show the successful HTTP response in Serial Monitor.
- Refresh or wait for the dashboard update and identify Zone B as the affected zone.

### Part C — Recovery

- Return Zone B to its normal calibrated position.
- Wait for a new reading.
- Show the restored normal condition on the dashboard.

### Part D — Backend evidence

- Open `http://127.0.0.1:3000/api/events`.
- Show the recorded timestamp, device ID and three zone voltages.
- If using the JSON-file persistence implementation in this branch, restart the backend and confirm the event history remains available.

## Explain limitations accurately

- This demonstration uses a virtual ESP32 circuit in Mokxi; it is not a physical PCB validation.
- The current threshold-based classifier is a prototype and does not identify every possible PCB defect.
- The current sampling and averaging approach is not a guarantee of microsecond transient capture.
- Verilog classifier/testbench results should be shown only after implementation and simulation.
- A Digital Twin should be demonstrated only if the corresponding visualization is present in the checked-out frontend build.

## Troubleshooting

| Symptom | Check |
|---|---|
| Dashboard says backend offline | Backend terminal, port 3000, Vite proxy |
| No events in API | Mokxi Wi-Fi, Real Internet toggle, HTTPS URL, Serial Monitor response |
| HTTP 429 | Mokxi Free quota/rate limit; stop repeated uploads and check reset |
| HTTP 404 from tunnel | Tunnel target/port and `/api/data` path |
| Fault appears immediately after startup | Recalibrate with all pots at normal positions |
| Data disappears after restart | Confirm the JSON-file persistence branch is running and inspect `backend/data/events.json` |
