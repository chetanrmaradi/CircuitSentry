```js
const express = require("express");
const fs = require("node:fs");
const path = require("node:path");

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const MAX_HISTORY = 200;
const VALID_ZONES = ["A", "B", "C"];
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "events.json");
const FRONTEND_DIST = path.resolve(__dirname, "../frontend/dist");

app.disable("x-powered-by");
app.use(express.json({ limit: "10kb", strict: true }));

function loadHistory() {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(DATA_FILE)) return [];
    const parsed = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    if (!Array.isArray(parsed)) {
      throw new Error("Event store must contain an array");
    }
    return parsed.slice(-MAX_HISTORY);
  } catch (error) {
    console.error("Could not load event store:", error.message);
    return [];
  }
}

let readingsHistory = loadHistory();

function persistHistory(records) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const temporaryFile = DATA_FILE + ".tmp";
  fs.writeFileSync(temporaryFile, JSON.stringify(records, null, 2), "utf8");
  fs.renameSync(temporaryFile, DATA_FILE);
}

function validateReading(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return "Request body must be a JSON object.";
  }

  const { deviceId, zones } = body;

  if (
    typeof deviceId !== "string" ||
    deviceId.trim().length === 0 ||
    deviceId.trim().length > 64
  ) {
    return "deviceId must be a non-empty string of at most 64 characters.";
  }

  if (!zones || typeof zones !== "object" || Array.isArray(zones)) {
    return "zones must be an object containing A, B and C.";
  }

  const keys = Object.keys(zones);

  if (
    keys.length !== 3 ||
    !VALID_ZONES.every((zone) => Object.hasOwn(zones, zone))
  ) {
    return "zones must contain exactly A, B and C.";
  }

  for (const zone of VALID_ZONES) {
    const value = zones[zone];

    if (
  typeof value !== "number" ||
  !Number.isFinite(value) ||
  value < 0 ||
  value > 3.3
) {
  return "Zone " + zone + " must be a finite voltage from 0 to 3.3 V.";
}

  return null;
}

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    storage: "json-file",
    records: readingsHistory.length
  });
});

app.post("/api/data", (req, res, next) => {
  const validationError = validateReading(req.body);

  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const record = {
    timestamp: new Date().toISOString(),
    deviceId: req.body.deviceId.trim(),
    zones: {
      A: req.body.zones.A,
      B: req.body.zones.B,
      C: req.body.zones.C
    }
  };

  const nextHistory = [...readingsHistory, record].slice(-MAX_HISTORY);

  try {
    persistHistory(nextHistory);
    readingsHistory = nextHistory;

    return res.status(201).json({
      message: "Reading accepted",
      record
    });
  } catch (error) {
    return next(error);
  }
});

app.get("/api/events", (_req, res) => {
  res.json({
    count: readingsHistory.length,
    events: readingsHistory
  });
});

// Serve the production React build.
app.use(express.static(FRONTEND_DIST));

app.get("/", (_req, res, next) => {
  const indexFile = path.join(FRONTEND_DIST, "index.html");

  if (fs.existsSync(indexFile)) {
    return res.sendFile(indexFile);
  }

  return res.status(503).json({
    error: "Frontend build not found. Check the Render build logs."
  });
});

// Handle malformed JSON, oversized requests and other errors.
app.use((error, _req, res, _next) => {
  console.error("API error:", error.message);

  if (error.type === "entity.parse.failed") {
    return res.status(400).json({
      error: "Malformed JSON request body."
    });
  }

  if (error.type === "entity.too.large") {
    return res.status(413).json({
      error: "Request body exceeds the 10 KB limit."
    });
  }

  return res.status(500).json({
    error: "Internal server error."
  });
});

app.listen(PORT, () => {
  console.log(`CircuitSentry API listening on port ${PORT}`);
  console.log(`Persistent event store: ${DATA_FILE}`);
});
```
