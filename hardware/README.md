# CircuitSentry — Hardware Setup

## 1. Hardware Overview

CircuitSentry uses an ESP32 DevKit V1 to monitor three low-voltage test zones.

The initial prototype will simulate voltage abnormalities using push buttons and voltage-divider circuits.

## 2. Component List

| Component | Quantity |
|---|---:|
| ESP32 DevKit V1 | 1 |
| Breadboard | 1 |
| 10 kΩ resistors | 6 |
| Push buttons | 3 |
| Jumper wires | As required |
| INA219 sensor | 1 (optional) |
| DHT22 sensor | 1 (optional) |
| 0.96-inch OLED display | 1 (optional) |

## 3. ESP32 Pin Configuration

| Signal | ESP32 GPIO |
|---|---|
| Zone A voltage | GPIO34 |
| Zone B voltage | GPIO35 |
| Zone C voltage | GPIO32 |
| Supply | 3V3 |
| Ground | GND |

## 4. Three-Zone Test Circuit

Each zone uses:
- One 10 kΩ resistor between 3V3 and the sense node.
- One 10 kΩ resistor between the sense node and GND.
- One normally-open push button between the sense node and GND.
- One ADC connection from the sense node to the assigned GPIO.

## 5. Expected Operation

- Normal condition: approximately 1.65 V at the sense node.
- Button pressed: voltage drops close to 0 V.
- ESP32: reads the voltage and identifies abnormal deviations.

## 6. Safety Precautions

- Use only the ESP32 3.3 V supply for this demonstration.
- Never apply 5 V or mains voltage to an ESP32 ADC pin.
- Disconnect USB power before changing wiring.
- Verify connections and voltage using a multimeter before powering the circuit.

## 7. Testing Status

Hardware assembly and electrical testing are pending component availability.
