
#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>

// ---------- Hardware pins ----------
const int ZONE_A_PIN = 34;
const int ZONE_B_PIN = 35;
const int ZONE_C_PIN = 32;

const int RED_LED_PIN = 26;
const int GREEN_LED_PIN = 25;

// ---------- Wi-Fi ----------
const char* WIFI_SSID = "Wokwi-GUEST";
const char* WIFI_PASSWORD = "";

// Your ngrok HTTPS backend URL
const char* SERVER_URL =
  "https://economy-sandbag-doorframe.ngrok-free.dev/api/data";

// ---------- Detection settings ----------
const int SAMPLE_COUNT = 10;
const int CALIBRATION_COUNT = 50;

const float FAULT_THRESHOLD = 0.30;

// Send one reading every 15 seconds during this short demo.
// Mokxi Free has a limited daily request allowance.
const unsigned long SEND_INTERVAL = 15000;

float baselineA = 0;
float baselineB = 0;
float baselineC = 0;

unsigned long lastSendTime = 0;

float readVoltage(int pin) {
  long total = 0;

  for (int i = 0; i < SAMPLE_COUNT; i++) {
    total += analogRead(pin);
    delay(5);
  }

  float average = total / (float)SAMPLE_COUNT;
  return average * 3.3 / 4095.0;
}

float calibrateZone(int pin) {
  float total = 0;

  for (int i = 0; i < CALIBRATION_COUNT; i++) {
    total += readVoltage(pin);
    delay(10);
  }

  return total / CALIBRATION_COUNT;
}

void calibrateSensors() {
  Serial.println("\nCalibrating sensors...");
  Serial.println("Keep all three zones in their normal positions.");

  baselineA = calibrateZone(ZONE_A_PIN);
  baselineB = calibrateZone(ZONE_B_PIN);
  baselineC = calibrateZone(ZONE_C_PIN);

  Serial.println("Calibration complete.");
  Serial.printf("Baseline A: %.2f V\n", baselineA);
  Serial.printf("Baseline B: %.2f V\n", baselineB);
  Serial.printf("Baseline C: %.2f V\n", baselineC);
}

void connectWiFi() {
  Serial.print("\nConnecting to Mokxi Wi-Fi");

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  unsigned long start = millis();

  while (WiFi.status() != WL_CONNECTED &&
         millis() - start < 20000) {
    delay(500);
    Serial.print(".");
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWi-Fi connected.");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nWi-Fi connection failed.");
  }
}

void sendToBackend(float a, float b, float c,
                   bool faultA, bool faultB, bool faultC) {

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Wi-Fi disconnected. Skipping upload.");
    return;
  }

  HTTPClient http;

  if (!http.begin(SERVER_URL)) {
    Serial.println("Could not initialize HTTPS connection.");
    return;
  }

  http.addHeader("Content-Type", "application/json");

  String payload = "{";
  payload += "\"deviceId\":\"CircuitSentry-Mokxi\",";
  payload += "\"zones\":{";
  payload += "\"A\":" + String(a, 3) + ",";
  payload += "\"B\":" + String(b, 3) + ",";
  payload += "\"C\":" + String(c, 3);
  payload += "}";
  payload += "}";

  Serial.println("\nSending readings to backend:");
  Serial.println(payload);

  int responseCode = http.POST(payload);

  Serial.print("Backend HTTP response: ");
  Serial.println(responseCode);

  if (responseCode > 0) {
    Serial.println(http.getString());
  } else {
    Serial.println(http.errorToString(responseCode));
  }

  http.end();
}

void setup() {
  Serial.begin(115200);

  pinMode(RED_LED_PIN, OUTPUT);
  pinMode(GREEN_LED_PIN, OUTPUT);

  analogReadResolution(12);

  digitalWrite(RED_LED_PIN, LOW);
  digitalWrite(GREEN_LED_PIN, HIGH);

  connectWiFi();

  // Calibrate with all zones in their normal positions.
  calibrateSensors();

  lastSendTime = millis() - SEND_INTERVAL;
}

void loop() {
  float voltageA = readVoltage(ZONE_A_PIN);
  float voltageB = readVoltage(ZONE_B_PIN);
  float voltageC = readVoltage(ZONE_C_PIN);

  bool faultA = abs(voltageA - baselineA) > FAULT_THRESHOLD;
  bool faultB = abs(voltageB - baselineB) > FAULT_THRESHOLD;
  bool faultC = abs(voltageC - baselineC) > FAULT_THRESHOLD;

  bool anyFault = faultA || faultB || faultC;

  digitalWrite(RED_LED_PIN, anyFault ? HIGH : LOW);
  digitalWrite(GREEN_LED_PIN, anyFault ? LOW : HIGH);

  Serial.println("\n------ CircuitSentry ------");

  Serial.printf("Zone A: %.2f V | Fault: %s\n",
                voltageA, faultA ? "YES" : "NO");

  Serial.printf("Zone B: %.2f V | Fault: %s\n",
                voltageB, faultB ? "YES" : "NO");

  Serial.printf("Zone C: %.2f V | Fault: %s\n",
                voltageC, faultC ? "YES" : "NO");

  if (anyFault) {
    Serial.println("STATUS: FAULT DETECTED");
  } else {
    Serial.println("STATUS: NORMAL");
  }

  if (millis() - lastSendTime >= SEND_INTERVAL) {
    sendToBackend(
      voltageA, voltageB, voltageC,
      faultA, faultB, faultC
    );

    lastSendTime = millis();
  }

  delay(1000);
}
