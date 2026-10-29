# CircuitSentry 🔧

### Intelligent PCB Fault Fingerprinting and Localization

CircuitSentry is a low-cost electronics project that uses an ESP32 to monitor voltage changes in different circuit zones, detect unusual behavior, and identify the zone that may be responsible for a fault.

The goal is to make it easier to spot intermittent electrical problems that can be difficult to find during manual testing.

## 🎯 Problem Statement

Brief or intermittent electrical faults can disappear before a circuit is inspected. Finding the affected section of a PCB can take time and require repeated manual testing.

CircuitSentry explores a low-cost way to monitor circuit behavior, detect abnormal voltage readings, and record fault events for further investigation.

## 💡 Proposed Solution

The system is designed around an ESP32 that reads voltage levels from multiple test zones and checks for deviations from their normal readings.

### Key Features

- **Circuit Monitoring:** Read voltage levels from multiple circuit zones.
- **Fault Detection:** Flag voltage readings that differ significantly from the learned baseline.
- **Fault Localization:** Identify the monitored zone showing abnormal behavior.
- **Event Logging:** Record detected events for later analysis.
- **Self-Learning:** Establish normal readings during calibration and use them as a reference.

## ⚙️ How It Works

1. **Measure:** The ESP32 reads voltage levels from the monitored zones.
2. **Calibrate:** The system establishes baseline readings under normal conditions.
3. **Detect:** New readings are compared with the baseline.
4. **Localize:** The system identifies the zone with the strongest abnormal deviation.
5. **Log:** Detected events are recorded for review.

## 🧰 Planned Hardware

- ESP32 development board
- Breadboard and jumper wires
- Resistors
- LEDs and push buttons for fault simulation
- Optional OLED display

## 💻 Software

- Arduino IDE
- C/C++ for ESP32 firmware
- Serial Monitor for debugging and viewing readings

## 🧪 Prototype and Testing

The initial prototype is intended to use a low-voltage, three-zone test circuit to demonstrate voltage monitoring and simulated fault detection.

Testing will focus on baseline calibration, detecting abnormal readings, identifying the affected zone, and recording events.

## 🚀 Future Improvements

- Add current and temperature monitoring.
- Support more circuit zones.
- Add a Wi-Fi dashboard and fault alerts.
- Explore fault-pattern classification using collected data.

## ⚠️ Current Limitations

This project is a prototype for controlled circuit testing. It does not yet claim to diagnose every PCB fault or reliably capture extremely short electrical transients.

## 👥 Team

Developed as an electronics and embedded-systems project for hackathon prototyping.

## 📌 Project Status

Under development. Hardware, firmware, test results, and demonstration details will be added as the prototype progresses.
