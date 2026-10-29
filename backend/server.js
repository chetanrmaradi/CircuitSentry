
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "10kb" }));

// Temporary in-memory storage.
// Data will be lost when the server restarts.
const readingsHistory = [];
const MAX_HISTORY = 200;

const VALID_ZONES = ["A", "B", "C"];

app.get("/", (req, res) => {
  res.json({
    project: "CircuitSentry",
    mode: "prototype",
    message: "Backend API is running"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    storage: "in-memory",
    records: readingsHistory.length
  });
});

app.post("/api/data", (req, res) => {
  const { deviceId, zones } = req.body ?? {};

  if (
    typeof deviceId !== "string" ||
    deviceId.trim().length === 0 ||
    !zones ||
    typeof zones !== "object" ||
    Array.isArray(zones)
  ) {
    return res.status(400).json({
      error: "Provide a deviceId and zones object."
    });
  }

  const zoneNames = Object.keys(zones);

  if (
    zoneNames.length !== 3 ||
    !VALID_ZONES.every((zone) =>
      Object.hasOwn(zones, zone)
    )
  ) {
    return res.status(400).json({
      error: "zones must contain exactly A, B, and C."
    });
  }

  for (const zone of VALID_ZONES) {
    const value = zones[zone];

    if (
      typeof value !== "number" ||
      !Number.isFinite(value) ||
      value < 0 ||
      value > 3.3
    ) {
      return res.status(400).json({
        error: `Zone ${zone} must be a voltage from 0 to 3.3 V.`
      });
    }
  }

  const record = {
    timestamp: new Date().toISOString(),
    deviceId: deviceId.trim().slice(0, 64),
    zones: {
      A: zones.A,
      B: zones.B,
      C: zones.C
    }
  };

  readingsHistory.push(record);

  if (readingsHistory.length > MAX_HISTORY) {
    readingsHistory.shift();
  }

  res.status(201).json({
    message: "Reading accepted",
    record
  });
});

app.get("/api/events", (req, res) => {
  res.json({
    count: readingsHistory.length,
    events: readingsHistory
  });
});

app.listen(PORT, () => {
  console.log(`CircuitSentry API listening on port ${PORT}`);
});
