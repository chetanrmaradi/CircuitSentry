
/*
  CircuitSentry
  ESP32-based voltage monitoring prototype

  Monitors three low-voltage test zones and reports
  readings over the Serial Monitor.
*/

const int ZONE_PINS[] = {34, 35, 32};
const int NUM_ZONES = 3;

void setup() {
  Serial.begin(115200);
  analogReadResolution(12);

  Serial.println();
  Serial.println("CircuitSentry starting...");
  Serial.println("Zone monitoring initialized.");
}

void loop() {
  for (int i = 0; i < NUM_ZONES; i++) {
    int reading = analogRead(ZONE_PINS[i]);

    Serial.print("Zone ");
    Serial.print(i + 1);
    Serial.print(": ");
    Serial.print(reading);
    Serial.print(i == NUM_ZONES - 1 ? "\n" : " | ");
  }

  delay(500);
}
