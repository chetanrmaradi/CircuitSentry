
import { useCallback, useEffect, useState } from "react";
import "./App.css";

type Zone = {
  id: string;
  name: string;
  voltage: number;
};

type EventRecord = {
  timestamp: string;
  deviceId: string;
  zones: {
    A: number;
    B: number;
    C: number;
  };
};

const initialZones: Zone[] = [
  { id: "A", name: "Zone A", voltage: 1.65 },
  { id: "B", name: "Zone B", voltage: 1.65 },
  { id: "C", name: "Zone C", voltage: 1.65 },
];

function App() {
  const [zones, setZones] = useState<Zone[]>(initialZones);
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState("Waiting for data...");
  const [message, setMessage] = useState(
    "Waiting for backend readings."
  );

  const faultCount = zones.filter(
    (zone) => zone.voltage < 1.3
  ).length;

  const faultZone = zones.find(
    (zone) => zone.voltage < 1.3
  );

  const fetchReadings = useCallback(async () => {
    try {
      const response = await fetch("/api/events");

      if (!response.ok) {
        throw new Error("Backend request failed");
      }

      const data = await response.json();

      const events: EventRecord[] = data.events ?? [];

      setConnected(true);

      if (events.length > 0) {
        const latest = events[events.length - 1];

        setZones([
          { id: "A", name: "Zone A", voltage: latest.zones.A },
          { id: "B", name: "Zone B", voltage: latest.zones.B },
          { id: "C", name: "Zone C", voltage: latest.zones.C },
        ]);

        setLastUpdate(
          new Date(latest.timestamp).toLocaleTimeString()
        );

        setMessage(
          `Latest readings received from ${latest.deviceId}.`
        );
      } else {
        setMessage("Backend connected. Waiting for sensor readings.");
      }
    } catch (error) {
      setConnected(false);
      setMessage("Cannot communicate with the backend.");
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchReadings();

    const timer = window.setInterval(fetchReadings, 2000);

    return () => window.clearInterval(timer);
  }, [fetchReadings]);

  async function sendTestReading(
    readings: { A: number; B: number; C: number }
  ) {
    try {
      const response = await fetch("/api/data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deviceId: "CircuitSentry-Demo",
          zones: readings,
        }),
      });

      if (!response.ok) {
        throw new Error("Could not send readings");
      }

      await fetchReadings();
    } catch (error) {
      console.error(error);
      setMessage("Failed to send readings to the backend.");
    }
  }

  function simulateFault() {
    sendTestReading({
      A: 1.65,
      B: 0.65,
      C: 1.65,
    });
  }

  function restoreNormal() {
    sendTestReading({
      A: 1.65,
      B: 1.65,
      C: 1.65,
    });
  }

  return (
    <main className="dashboard">
      <header className="header">
        <div>
          <h1>⚡ CircuitSentry</h1>
          <p>
            Intelligent PCB Fault Fingerprinting & Localization
          </p>
        </div>

        <span className="system-badge">
          {connected ? "● BACKEND ONLINE" : "● BACKEND OFFLINE"}
        </span>
      </header>

      <section className="overview">
        <div className="overview-card">
          <p>MONITORING ZONES</p>
          <h2>03</h2>
        </div>

        <div className="overview-card">
          <p>ACTIVE FAULTS</p>
          <h2 className={faultCount > 0 ? "fault-text" : ""}>
            {faultCount}
          </h2>
        </div>

        <div className="overview-card">
          <p>SYSTEM STATUS</p>
          <h2 className={faultCount > 0 ? "fault-text" : "normal-text"}>
            {faultCount > 0 ? "WARNING" : "NORMAL"}
          </h2>
        </div>
      </section>

      <section className="section">
        <h2>PCB Zone Monitoring</h2>

        <p className="subtitle">
          Voltage readings received from the backend
        </p>

        <div className="zone-grid">
          {zones.map((zone) => {
            const isFault = zone.voltage < 1.3;

            return (
              <article className="zone-card" key={zone.id}>
                <div className="zone-heading">
                  <h3>{zone.name}</h3>

                  <span
                    className={
                      isFault ? "fault-badge" : "normal-badge"
                    }
                  >
                    {isFault ? "FAULT" : "NORMAL"}
                  </span>
                </div>

                <p className="voltage">
                  {zone.voltage.toFixed(2)}
                  <span> V</span>
                </p>

                <div className="voltage-track">
                  <div
                    className={`voltage-fill ${
                      isFault ? "low-fill" : ""
                    }`}
                    style={{
                      width: `${(zone.voltage / 3.3) * 100}%`,
                    }}
                  />
                </div>

                <p className="zone-description">
                  {isFault
                    ? "Abnormal voltage detected"
                    : "Voltage within expected range"}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="alert-panel">
        <h2>Fault Detection Report</h2>

        <p>{message}</p>

        {faultZone && (
          <p className="fault-report">
            Suspected fault location: <strong>{faultZone.name}</strong>
          </p>
        )}
      </section>

      <section className="controls">
        <h2>Testing Controls</h2>

        <p className="subtitle">
          Send simulated voltage readings to the backend.
        </p>

        <div className="button-row">
          <button
            className="fault-button"
            onClick={simulateFault}
            disabled={!connected}
          >
            Simulate Fault
          </button>

          <button
            className="restore-button"
            onClick={restoreNormal}
            disabled={!connected}
          >
            Restore Normal
          </button>
        </div>
      </section>

      <footer>
        Backend: {connected ? "Connected" : "Disconnected"}
        <br />
        Last update: {lastUpdate}
        <br />
        CircuitSentry | ESP32-based PCB monitoring prototype
        <br />
        Demo mode — test readings are simulated, not live hardware data.
      </footer>
    </main>
  );
}

export default App;
