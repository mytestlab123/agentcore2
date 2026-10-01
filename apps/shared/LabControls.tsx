import React, { useState } from "react";
import { LiveAgentCoreBackend, MockComplianceBackend, type ComplianceBackend, type LiveRuntimeEvidence } from "@agentcore2/contracts";
import pricing from "./model-pricing.json";

export const models = pricing.models;
let active: ComplianceBackend = new MockComplianceBackend();
let token = "";
let endpoint = "http://127.0.0.1:8443";
function bridgeUrl(value: string): string {
  const url = new URL(value);
  // Bearer tokens travel only over loopback HTTP or authenticated TLS.
  if (url.username || url.password || url.search || url.hash || url.pathname !== "/" ||
      !(url.protocol === "https:" || (url.protocol === "http:" && url.hostname === "127.0.0.1"))) {
    throw new Error("Use loopback HTTP (127.0.0.1) or HTTPS with no credentials, query or path.");
  }
  return url.origin;
}
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
  const [url, setUrl] = useState(endpoint);
  async function connect() {
    setBusy(true);
    try {
      endpoint = bridgeUrl(url);
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
  return <section className="panel lab-controls" style={{ margin: 16, padding: 12 }}>
    <label>Explanation model <select aria-label="Explanation model" value={model} onChange={e => setModel(e.target.value)}>
      {models.map(m => <option key={m.id} value={m.id}>{m.label} — {(m.input / 0.047).toFixed(1)}x · {m.route}</option>)}
    </select></label>
    <span style={{ marginLeft: 12 }}>Same tools, permissions and approval flow for every model.</span>
    <p title={`${pricing.source}; checked ${pricing.date}`}>Input cost index, not total request cost. {models.filter(m => m.id === model).map(m => <span key={m.id}>${m.input}/M input · ${m.output}/M output</span>)} · rates recorded {pricing.date}</p>
    <p>{connected ? "LIVE LAB connection active. Synthetic data only; inference may cross Regions." : "MOCK until connected. Model choice does not invoke AWS in mock mode."}</p>
    {!connected && <div className="bridge-connection"><label>Bridge URL <input aria-label="Bridge URL" type="url" value={url} onChange={e => setUrl(e.target.value)} /></label><input aria-label="Bridge session token" type="password" autoComplete="off" placeholder="Private operator bridge session token" value={entry} onChange={e => setEntry(e.target.value)} /> <button disabled={busy || !entry} onClick={connect}>Connect LAB</button></div>}
    <button disabled={!connected || busy} onClick={explain}>Inspect and explain SSL control</button>
    {result && <pre style={{ whiteSpace: "pre-wrap", maxHeight: 240, overflow: "auto" }}>{result}</pre>}
  </section>;
}
