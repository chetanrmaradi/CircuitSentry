# CircuitSentry

## Intelligent PCB Fault Fingerprinting and Localization

CircuitSentry is a low-cost, three-zone voltage-monitoring prototype. An ESP32 samples three analog inputs, establishes a normal baseline, flags deviations, and can transmit voltage readings to a Node.js API for display in a React dashboard.

> **Prototype status:** The Mokxi simulation and simulated ESP32-to-API-to-dashboard workflow have been reported as passing by the project team. This is simulation evidence, not proof of physical PCB performance. Physical hardware validation and Verilog classifier verification remain separate tasks.

## What is implemented

- ESP32 Arduino firmware for three ADC zones (GPIO 34, 35 and 32), baseline calibration, averaging and threshold-based fault flags.
- Mokxi circuit configuration with three potentiometers and status LEDs.
- Node.js/Express REST API with validation and event retrieval.
- React + TypeScript + Vite dashboard with three-zone readings, status indicators and demo fault/recovery controls.
- HTTPS forwarding for the simulator-to-local-backend demonstration using a tunnel such as ngrok.

The current frontend source should be checked before describing a Digital Twin as implemented: a 3D/interactive board-level twin is not evident in the committed `frontend/src/App.tsx` inspected for this update.

## Architecture

```text
Mokxi ESP32 simulation (or future physical ESP32)
  ├─ ADC: Zone A GPIO34
  ├─ ADC: Zone B GPIO35
  └─ ADC: Zone C GPIO32
          |
          | Wi-Fi + HTTPS POST /api/data
          v
HTTPS tunnel (demo only; e.g. ngrok)
          |
          v
Node.js + Express API :3000
          |
          ├─ JSON-file event persistence (backend/data/events.json)
          ├─ GET /api/health
          └─ GET /api/events
          |
          v
React + TypeScript + Vite :5173
```

For local browser development, Vite proxies `/api` requests to `http://127.0.0.1:3000`. The simulator cannot reach a laptop's localhost directly; the Mokxi Real Internet feature and a public HTTPS tunnel are needed for that route.

## Repository layout

| Path | Purpose |
|---|---|
| `backend/` | Express API and persistent event store |
| `frontend/` | React dashboard |
| `firmware/` | Embedded firmware sources, if present in this branch |
| `hardware/` | Physical circuit documentation |
| `simulation/` | Simulation resources, if present |
| `diagram.mokxi.json` | Mokxi/Wokwi-compatible circuit and embedded sketch |
| `docs/` | Architecture, simulation and demo instructions |
| `screenshots/` | Evidence images added by the team |

## Requirements

- Windows 10/11, macOS or Linux
- Node.js 18 or newer and npm
- A modern browser
- Mokxi account/project for the virtual ESP32 demonstration
- ngrok or another HTTPS tunnel only when Mokxi must send data to a backend running on your computer

## Run locally (Windows Command Prompt)

Open **two** Command Prompt windows.

### 1. Start the backend

```cmd
cd /d "path\to\CircuitSentry\backend"
npm install
npm start
```

The API listens on port 3000.

Check it in a browser or a third Command Prompt:

```cmd
curl.exe http://127.0.0.1:3000/api/health
```

Expected response includes `"status":"ok"` and `"storage":"json-file"`.

### 2. Start the dashboard

```cmd
cd /d "path\to\CircuitSentry\frontend"
npm install
npm run dev
```

Open the Vite URL printed in the terminal (normally http://localhost:5173).

### 3. Send a test reading

```cmd
curl.exe -X POST http://127.0.0.1:3000/api/data -H "Content-Type: application/json" -d "{\"deviceId\":\"CMD-Demo\",\"zones\":{\"A\":1.65,\"B\":0.65,\"C\":1.65}}"
```

Refresh `http://127.0.0.1:3000/api/events` and the dashboard. Zone B should show the low-voltage demo reading.

## Deploy a public dashboard (free)

This repository includes a Render Blueprint in `render.yaml`. It builds the React frontend and serves it from the Express backend, so the public dashboard and `/api` endpoints share one origin. No laptop Command Prompt, local Vite server, or ngrok tunnel is needed after deployment.

1. Push/merge the deployment branch to the GitHub branch you want to deploy (recommended: `main`).
2. Sign in to [Render](https://render.com/) and connect the GitHub account that owns this repository.
3. In Render, choose **New → Blueprint**, select `chetanrmaradi/CircuitSentry`, and select the branch containing `render.yaml`.
4. Review the service and select the **Free** plan if prompted, then create/apply the Blueprint.
5. Wait for the build and deploy to finish. Open the generated `https://<service-name>.onrender.com` URL.
6. Verify `/api/health` returns `status: ok` and open the dashboard root URL.

Render can automatically redeploy from the configured Git branch when new commits are pushed. Do not add a tunnel URL to the deployed frontend: it calls the same-origin `/api` endpoints.

### Free-hosting limitations

- Render Free web services spin down after 15 minutes without inbound traffic; the first request after sleep can take about a minute to wake the service.
- The free service filesystem is ephemeral. The JSON-file event store in this project is suitable for a demo but **not durable in hosted free mode**; records may disappear after sleep, restart or redeploy. Keep local test data backed up separately.
- Free service availability, monthly usage limits and build minutes are subject to Render's current plan terms. This is a demo/hobby deployment, not production hosting.
- Mokxi Real Internet still has its own request quota. Hosting the API publicly does not remove the simulator's quota.

See [Render Free limitations](https://render.com/docs/free) before the event.

## Mokxi simulator connection

Follow [the Mokxi simulation guide](docs/mokxi-simulation.md). Use the Wi-Fi SSID/password shown in the actual simulator's ESP32 board properties; do not assume Wokwi defaults are valid in every Mokxi project. Keep the HTTPS tunnel and backend running while testing.

**Free-tier note:** Mokxi Real Internet has request quotas. The team previously encountered HTTP 429 after exhausting its project allowance. Reduce upload frequency and use the simulator's current quota documentation; quota reset timing and limits can change. Do not put authentication tokens or other secrets in this repository.

## API

### `GET /api/health`

Returns service status, storage mode and number of stored records.

### `POST /api/data`

Request body:

```json
{
  "deviceId": "CircuitSentry-Mokxi",
  "zones": { "A": 1.65, "B": 0.65, "C": 1.65 }
}
```

Each zone must be a finite number from 0 through 3.3 V. Exactly the keys A, B and C are accepted.

### `GET /api/events`

Returns the retained event count and readings (up to 200 most recent records).

## Validation status

See [the validation report](docs/validation-status.md) and [judge demo procedure](docs/demo-procedure.md). Verilog classifier/testbench results must be added only after the module is implemented and its testbench has actually run. Physical ESP32 measurements must be recorded separately from Mokxi simulation results.

## Safety

- This is a controlled, low-voltage prototype.
- Never connect mains voltage to an ESP32 or breadboard test circuit.
- ESP32 ADC pins must remain within the board's permitted input range (do not apply 5 V).
- Use appropriate voltage dividers, current limiting and protection for external signals.

## Contribution / status

The repository is an evolving hackathon prototype. Please document the simulator version, firmware revision, test conditions and evidence when reporting results.
