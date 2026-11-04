# Mokxi simulation and cloud connection

## Circuit

The committed `diagram.mokxi.json` describes an ESP32, three potentiometers and two status LEDs with 220-ohm series resistors.

| Zone | ESP32 ADC pin | Potentiometer wiper |
|---|---:|---|
| A | GPIO34 | potA pin 2 |
| B | GPIO35 | potB pin 2 |
| C | GPIO32 | potC pin 2 |

Each potentiometer's outer terminals are connected to 3V3 and GND. Red LED is driven from GPIO26 through a 220-ohm resistor; green LED is driven from GPIO25 through a 220-ohm resistor. Verify actual pin labels in the simulator before running.

## Firmware behavior

The sketch embedded in `diagram.mokxi.json`:
1. Connects to the Wi-Fi SSID/password configured in the ESP32 board properties.
2. Calibrates each zone while all potentiometers are in the normal position.
3. Samples each ADC input and averages ten samples.
4. Flags a zone when its voltage differs from its calibrated baseline by more than 0.30 V.
5. Displays status in Serial Monitor and sends JSON readings to `POST /api/data`.

**Wi-Fi credentials:** The checked-in diagram currently specifies `Wokwi-GUEST` with an empty password. Use the exact credentials supported by the current Mokxi project settings. Do not assume the checked-in values are correct unless the simulator successfully connects.

## Connect Mokxi to a local backend

Mokxi's simulated Wi-Fi does not automatically provide access to services on the developer laptop. For the cloud upload demonstration:

1. Start the backend locally on port 3000.
2. Start an HTTPS tunnel forwarding to `http://localhost:3000`.
3. Copy the current HTTPS forwarding URL into the firmware's `SERVER_URL`, ending in `/api/data`.
4. Enable Mokxi's Real Internet feature and use the configured Wi-Fi network.
5. Start the simulation with all three zones in their normal positions so calibration captures the normal baseline.
6. Open Serial Monitor and check for a successful Wi-Fi connection and HTTP 201 response.
7. Change one potentiometer, wait for the next upload, and confirm the corresponding voltage is visible in `GET /api/events` and the dashboard.

Tunnel URLs can change when a tunnel restarts. Never commit access tokens, passwords or other secrets. A public tunnel exposes the forwarded API to the internet; stop it when the demo is over.

## Mokxi Real Internet free-tier limitation

The team observed HTTP **429** after reaching the Free-tier request quota. The Mokxi notice shown during testing stated a daily limit of 100 requests per account and 50 per project, with a UTC reset; limits and plan terms can change. Treat 429 as a quota/rate-limit response, not as a fault in ADC measurement or the local Express API.

To conserve requests:
- Use a slower upload interval outside the short demo window.
- Avoid leaving the simulation uploading continuously.
- Check the current Mokxi Cloud/Real Internet quota notice before the event.
- Use Serial Monitor for local sampling checks that do not require an HTTP upload.

## Evidence to capture

Save genuine screenshots under `screenshots/`:
- `mokxi-circuit.png`: complete wired circuit and board properties.
- `mokxi-serial-normal.png`: three normal readings and successful upload.
- `mokxi-serial-fault.png`: one changed zone and its fault flag.
- `dashboard-normal.png`: dashboard with all zones normal.
- `dashboard-fault.png`: dashboard with the affected zone flagged.
- `digital-twin.png`: only if the implemented Digital Twin is visible in the current frontend.

Record simulator date/version, configured upload interval, HTTP status and observed voltage values alongside the images.
