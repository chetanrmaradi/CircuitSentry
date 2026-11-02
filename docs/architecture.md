# CircuitSentry — System Architecture

## 1\. Overview

CircuitSentry is a proposed low-cost system for monitoring circuit zones, detecting abnormal electrical readings, and identifying the zone most likely associated with a fault.

The project will use an ESP32 for data collection and local fault detection, with a software dashboard for visualization and event analysis.

## 2\. System Components

### Hardware Layer

* ESP32 DevKit V1 for voltage monitoring and processing.
* Three monitored zones for the initial prototype.
* Optional INA219 current sensor, DHT22 temperature/humidity sensor, and OLED display.
* Push buttons or switches to simulate faults during testing.

### Firmware Layer

* Read voltage measurements from each zone.
* Calibrate normal readings during startup.
* Detect deviations from baseline values.
* Identify the zone with the largest abnormal deviation.
* Record fault and recovery events.

### Backend Layer

* Node.js and Express REST API.
* Firebase Realtime Database for readings and event storage.
* Input validation and device authentication.

### Frontend Layer

* React and Tailwind CSS dashboard.
* Zone status and live readings.
* Fault history and health indicators.
* Interactive 2D circuit visualization.

### Verification Layer

* Verilog fault-classification module.
* Self-checking testbench with PASS/FAIL results.
* Comparison of simulated and measured fault scenarios.

## 3\. Data Flow

ESP32 → Wi-Fi → Backend API → Firebase → Dashboard

The dashboard will display readings and events received from the backend. A simulation mode can be developed before the physical hardware is available.

## 4\. Development Status

The CircuitSentry project is currently under development. The software prototype has been implemented with simulated fault detection and dashboard integration. Physical hardware implementation and advanced fault classification are planned next.



\### 4.1 Completed Tasks



\- \[x] Initial project README

\- \[x] Initial ESP32 monitoring firmware file

\- \[x] Backend API development

\- \[x] Backend fault event logging using in-memory storage

\- \[x] Dashboard development using React and TypeScript

\- \[x] Simulated data mode

\- \[x] Frontend and backend integration

\- \[x] Simulated fault detection and recovery testing

\- \[x] GitHub repository setup and project upload



\### 4.2 Pending Tasks



\- \[ ] Three-zone physical hardware prototype

\- \[ ] Hardware baseline calibration and fault detection testing

\- \[ ] Physical fault event logging validation

\- \[ ] Database integration for permanent data storage

\- \[ ] Advanced fault fingerprint matching

\- \[ ] Verilog classifier implementation

\- \[ ] Verilog testbench development and simulation

\- \[ ] ESP32-to-backend live hardware integration

\- \[ ] Complete end-to-end hardware testing



\### 4.3 Current Development Milestone



The initial software prototype is operational. The React dashboard communicates with the Node.js backend and displays simulated three-zone voltage readings and fault events.



The next development phase focuses on building the physical three-zone monitoring circuit using the ESP32 DevKit V1, validating voltage measurements, and integrating real hardware readings with the backend.



\### 4.4 Future Improvements



\- Implement persistent fault history using a database.

\- Improve fault detection accuracy through calibration and filtering.

\- Develop fault fingerprint matching for identifying recurring fault patterns.

\- Integrate the Verilog classifier for digital fault classification.

\- Add real-time monitoring and alert notifications.

\- Evaluate detection speed and reliability under different fault conditions.5. Current Limitations

The architecture describes the intended system, not a fully completed implementation. Each feature must be implemented and tested before it is reported as working.

The initial prototype will use controlled, low-voltage test circuits. Detecting very short electrical transients may require faster sampling or additional hardware.

