
"""
CircuitSentry - Software Fault Simulator
Simulates three voltage zones without physical hardware.

Run:
    python simulation/fault_simulator.py
"""

import random
import time
from datetime import datetime

ZONE_NAMES = ["Zone A", "Zone B", "Zone C"]
NORMAL_VOLTAGE = 1.65
NOISE = 0.025
FAULT_THRESHOLD = 0.30


def generate_readings(fault_zone=None):
    """Generate simulated voltage readings for all zones."""
    readings = {}

    for zone in ZONE_NAMES:
        voltage = NORMAL_VOLTAGE + random.uniform(-NOISE, NOISE)

        if zone == fault_zone:
            voltage -= 0.65  # Simulated voltage drop

        readings[zone] = round(max(0, voltage), 3)

    return readings


def detect_faults(readings):
    """Compare readings against the simulated normal baseline."""
    deviations = {
        zone: abs(voltage - NORMAL_VOLTAGE)
        for zone, voltage in readings.items()
    }

    abnormal = [
        zone for zone, deviation in deviations.items()
        if deviation > FAULT_THRESHOLD
    ]

    suspect = max(
        abnormal,
        key=lambda zone: deviations[zone],
        default=None,
    )

    return abnormal, suspect, deviations


def main():
    print("=" * 48)
    print("       CircuitSentry Fault Simulator")
    print("       SIMULATION MODE - NOT REAL HARDWARE")
    print("=" * 48)

    scenarios = [
        ("Normal operation", None),
        ("Voltage drop in Zone B", "Zone B"),
        ("Normal operation after recovery", None),
        ("Voltage drop in Zone C", "Zone C"),
    ]

    try:
        for scenario, fault_zone in scenarios:
            print(f"\nScenario: {scenario}")
            readings = generate_readings(fault_zone)
            abnormal, suspect, deviations = detect_faults(readings)

            for zone in ZONE_NAMES:
                status = "FAULT" if zone in abnormal else "Healthy"
                print(
                    f"{zone}: {readings[zone]:.3f} V | "
                    f"Deviation: {deviations[zone]:.3f} V | "
                    f"{status}"
                )

            if suspect:
                print(f"Likely affected zone: {suspect}")
                print(f"Event time: {datetime.now().isoformat(timespec='seconds')}")
            else:
                print("System status: NORMAL")

            time.sleep(1)

    except KeyboardInterrupt:
        print("\nSimulation stopped.")

    print("\nSimulation finished.")


if __name__ == "__main__":
    main()
