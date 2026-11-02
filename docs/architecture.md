# CircuitSentry — System Architecture

## 1. Overview

CircuitSentry is a proposed low-cost system for monitoring circuit zones, detecting abnormal electrical readings, and identifying the zone most likely associated with a fault.

The project will use an ESP32 for data collection and local fault detection, with a software dashboard for visualization and event analysis.

## 2. System Components

### Hardware Layer
- ESP32 DevKit V1 for voltage monitoring and processing.
- Three monitored zones for the initial prototype.
- Optional INA219 current sensor, DHT22 temperature/humidity sensor, and OLED display.
- Push buttons or switches to simulate faults during testing.

### Firmware Layer
- Read voltage measurements from each zone.
- Calibrate normal readings during startup.
- Detect deviations from baseline values.
- Identify the zone with the largest abnormal deviation.
- Record fault and recovery events.

### Backend Layer
- Node.js and Express REST API.
- Firebase Realtime Database for readings and event storage.
- Input validation and device authentication.

### Frontend Layer
- React and Tailwind CSS dashboard.
- Zone status and live readings.
- Fault history and health indicators.
- Interactive 2D circuit visualization.

### Verification Layer
- Verilog fault-classification module.
- Self-checking testbench with PASS/FAIL results.
- Comparison of simulated and measured fault scenarios.

## 3. Data Flow

ESP32 → Wi-Fi → Backend API → Firebase → Dashboard

The dashboard will display readings and events received from the backend. A simulation mode can be developed before the physical hardware is available.

## 4. Development Status

- [x] Initial project README
- [x] Initial ESP32 monitoring firmware file
- [ ] Three-zone hardware prototype
- [ ] Baseline calibration and fault detection testing
- [ ] Fault event logging
- [ ] Backend API and database integration
- [ ] Dashboard and simulated data mode
- [ ] Fault fingerprint matching
- [ ] Verilog classifier and testbench
- [ ] End-to-end system testing

## 5. Current Limitations

The architecture describes the intended system, not a fully completed implementation. Each feature must be implemented and tested before it is reported as working.

The initial prototype will use controlled, low-voltage test circuits. Detecting very short electrical transients may require faster sampling or additional hardware.
