import React, { useState } from "react";
import { LiveAgentCoreBackend, MockComplianceBackend, type ComplianceBackend, type LiveRuntimeEvidence } from "@agentcore2/contracts";

export const models = [
  { id: "apac.amazon.nova-micro-v1:0", label: "Nova Micro — Economy", route: "APAC" },
  { id: "apac.amazon.nova-lite-v1:0", label: "Nova Lite — Default", route: "APAC" },
  { id: "global.amazon.nova-2-lite-v1:0", label: "Nova 2 Lite — Enhanced", route: "Global" },
];
let active: ComplianceBackend = new MockComplianceBackend();
let token = "";
const endpoint = "http://127.0.0.1:8703";
// Delegate the same governance seam in all three previews. Credentials stay in
// the operator bridge; its session token stays in memory only, never storage.
export const backend = new Proxy({} as ComplianceBackend, {
  get(_target, key) { const v = active[key as keyof ComplianceBackend]; return typeof v === "function" ? v.bind(active) : v; },
});
async function request(body: unknown): Promise<unknown> {
  const r = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || "Operator bridge request failed");
  return data;
}
export function LabControls(): React.ReactElement {
  const [model, setModel] = useState("apac.amazon.nova-lite-v1:0");
  const [entry, setEntry] = useState("");
  const [connected, setConnected] = useState(false);
  const [result, setResult] = useState("");
  const [busy, setBusy] = useState(false);
  async function connect() {
    setBusy(true);
    try {
      token = entry;
      const evidence = await request({ method: "evidence" }) as LiveRuntimeEvidence;
      active = new LiveAgentCoreBackend(evidence, (method, args) => request({ method, args }));
      setConnected(true); setEntry(""); setResult("Connected to the authenticated personal LAB backend.");
      window.dispatchEvent(new Event("lab-backend-changed"));
    } catch (e) { token = ""; setResult(String(e)); }
    finally { setBusy(false); }
  }
  async function explain() {
    setBusy(true);
    try { setResult(JSON.stringify(await request({ method: "model_tool", modelId: model }), null, 2)); }
    catch (e) { setResult(String(e)); }
    finally { setBusy(false); }
  }
  return <section className="panel" style={{ margin: 16, padding: 12 }}>
    <label>Explanation model <select aria-label="Explanation model" value={model} onChange={e => setModel(e.target.value)}>
      {models.map(m => <option key={m.id} value={m.id}>{m.label} · {m.route}</option>)}
    </select></label>
    <span style={{ marginLeft: 12 }}>Same tools, permissions and approval flow for every model.</span>
    <p>{connected ? "LIVE LAB connection active. Synthetic data only; inference may cross Regions." : "MOCK until connected. Model choice does not invoke AWS in mock mode."}</p>
    {!connected && <><input type="password" autoComplete="off" placeholder="Private operator bridge session token" value={entry} onChange={e => setEntry(e.target.value)} /> <button disabled={busy || !entry} onClick={connect}>Connect LAB</button></>}
    <button disabled={!connected || busy} onClick={explain}>Inspect and explain SSL control</button>
    {result && <pre style={{ whiteSpace: "pre-wrap", maxHeight: 240, overflow: "auto" }}>{result}</pre>}
  </section>;
}
