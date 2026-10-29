
/*
  CircuitSentry - Prototype v0.2
  Three-zone voltage anomaly detection

  Pins: GPIO34, GPIO35, GPIO32
  Serial Monitor: 115200 baud

  IMPORTANT:
  Start with a safe, low-voltage test circuit.
  Thresholds must be tuned after observing real readings.
*/

const int ZONE_PINS[] = {34, 35, 32};
const int NUM_ZONES = 3;

const int CALIBRATION_SAMPLES = 100;
const int FAULT_THRESHOLD = 500;  // ADC counts; tune during testing
const unsigned long SAMPLE_INTERVAL_MS = 100;

float baseline[NUM_ZONES] = {0};
bool faultActive[NUM_ZONES] = {false};

unsigned long lastSampleTime = 0;

int readZoneAverage(int pin, int samples = 8) {
  long total = 0;

  for (int i = 0; i < samples; i++) {
    total += analogRead(pin);
    delay(2);
  }

  return total / samples;
}

void calibrateZones() {
  Serial.println("Calibration started. Keep circuit normal.");

  for (int zone = 0; zone < NUM_ZONES; zone++) {
    long total = 0;

    for (int i = 0; i < CALIBRATION_SAMPLES; i++) {
      total += analogRead(ZONE_PINS[zone]);
      delay(5);
    }

    baseline[zone] =
        (float)total / CALIBRATION_SAMPLES;

    Serial.print("Zone ");
    Serial.print(zone + 1);
    Serial.print(" baseline: ");
    Serial.println(baseline[zone], 1);
  }

  Serial.println("Calibration complete.");
}

void setup() {
  Serial.begin(115200);
  analogReadResolution(12);

  delay(500);
  Serial.println();
  Serial.println("=== CircuitSentry ===");

  calibrateZones();
}

void loop() {
  if (millis() - lastSampleTime < SAMPLE_INTERVAL_MS) {
    return;
  }

  lastSampleTime = millis();

  int readings[NUM_ZONES];
  int deviations[NUM_ZONES];
  int suspectZone = -1;
  int largestDeviation = 0;
  bool anyFault = false;

  for (int zone = 0; zone < NUM_ZONES; zone++) {
    readings[zone] = readZoneAverage(ZONE_PINS[zone]);
    deviations[zone] =
        abs(readings[zone] - (int)baseline[zone]);

    if (deviations[zone] > FAULT_THRESHOLD) {
      anyFault = true;

      if (deviations[zone] > largestDeviation) {
        largestDeviation = deviations[zone];
        suspectZone = zone;
      }
    }
  }

  for (int zone = 0; zone < NUM_ZONES; zone++) {
    Serial.print("Z");
    Serial.print(zone + 1);
    Serial.print(":");
    Serial.print(readings[zone]);
    Serial.print(" (deviation ");
    Serial.print(deviations[zone]);
    Serial.print(")  ");
  }

  if (anyFault) {
    Serial.print(" | ABNORMAL");

    if (suspectZone >= 0) {
      Serial.print(" | Likely zone: ");
      Serial.print(suspectZone + 1);
    }
  } else {
    Serial.print(" | NORMAL");
  }

  Serial.println();

  for (int zone = 0; zone < NUM_ZONES; zone++) {
    bool isFault =
        deviations[zone] > FAULT_THRESHOLD;

    if (isFault && !faultActive[zone]) {
      Serial.print("EVENT: Zone ");
      Serial.print(zone + 1);
      Serial.println(" became abnormal.");
    }

    if (!isFault && faultActive[zone]) {
      Serial.print("EVENT: Zone ");
      Serial.print(zone + 1);
      Serial.println(" returned to normal.");
    }

    faultActive[zone] = isFault;
  }
}
