import React, { useEffect, useMemo, useState } from "react";
import { backend, LabControls } from "../../shared/LabControls";
import {
  type Finding,
  type RemediationProposal,
  type RemediationRun,
  type ComplianceStatus,
  type RemediationCapability,
} from "@agentcore2/contracts";

// Same seam as Preview A. The ONLY difference is the interaction model.
const PAGE = 25;

interface ChatMsg { who: "user" | "agent"; text: string; }
type Fixability = "AUTOMATED" | "MANUAL";
const fixability = (f: Finding): Fixability => f.status === "NON_COMPLIANT" && !!f.remediationCapabilityId ? "AUTOMATED" : "MANUAL";

function initialTheme(): "light" | "dark" {
  try { return localStorage.getItem("preview-b-theme") === "dark" ? "dark" : "light"; }
  catch { return "light"; }
}

export function App(): React.ReactElement {
  const [all, setAll] = useState<Finding[]>([]);
  const [status, setStatus] = useState<ComplianceStatus | "">("NON_COMPLIANT");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Finding | undefined>();
  const [fixFilter, setFixFilter] = useState<Fixability | "">("");
  const [theme, setTheme] = useState(initialTheme);
  const [capabilities, setCapabilities] = useState<RemediationCapability[]>([]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem("preview-b-theme", theme); } catch { /* Storage may be disabled. */ }
  }, [theme]);

  useEffect(() => {
    const load = () => {
      setSelected(undefined);
      backend.listFindings().then(setAll).catch(() => setAll([]));
      backend.listCapabilities().then(setCapabilities).catch(() => setCapabilities([]));
    };
    load(); window.addEventListener("lab-backend-changed", load);
    return () => window.removeEventListener("lab-backend-changed", load);
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return all.filter((f) => {
      if (status && f.status !== status) return false;
      if (fixFilter && fixability(f) !== fixFilter) return false;
      if (q && !`${f.title} ${f.resource.id}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [all, status, search, fixFilter]);

  const pageItems = filtered.slice(page * PAGE, page * PAGE + PAGE);

  return (
    <>
      <header className="topbar">
        <h1>AgentCore Lab · Preview B — Contextual Copilot v1.1</h1>
        <span className={`badge ${backend.mode}`}>{backend.mode.replace("_", " ")}</span>
        <span style={{ fontSize: 12, opacity: 0.8 }}>finding stays bounded context — not a generic chatbot</span>
        <button className="secondary theme-toggle" onClick={() => setTheme(theme === "light" ? "dark" : "light")} aria-label="Toggle theme">{theme === "light" ? "Dark theme" : "Light theme"}</button>
      </header>
      <LabControls />
      <div className="layout">
        <div className="main">
          <div className="panel">
            <div className="panel-h"><span>Findings</span></div>
            <div className="filters">
              <select aria-label="Status filter" value={status} onChange={(e) => { setStatus(e.target.value as ComplianceStatus | ""); setPage(0); }}>
                <option value="">All statuses</option>
                <option value="NON_COMPLIANT">NON_COMPLIANT</option>
                <option value="COMPLIANT">COMPLIANT</option>
                <option value="NOT_APPLICABLE">NOT_APPLICABLE</option>
                <option value="INSUFFICIENT_DATA">INSUFFICIENT_DATA</option>
              </select>
              <select aria-label="Fixability filter" value={fixFilter} onChange={e => { setFixFilter(e.target.value as Fixability | ""); setPage(0); }}>
                <option value="">All fixability</option><option value="AUTOMATED">Automated</option><option value="MANUAL">Manual</option>
              </select>
              <input aria-label="Search findings" placeholder="Search…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} />
            </div>
            <div style={{ maxHeight: 560, overflow: "auto" }}>
              <table>
                <thead><tr><th>Severity</th><th>Finding</th><th>Resource</th><th>Status</th><th>Fixability</th></tr></thead>
                <tbody>
                  {pageItems.map((f) => (
                    <tr key={f.id} className={selected?.id === f.id ? "selected" : ""} onClick={() => setSelected(f)}>
                      <td className={`sev ${f.severity}`}>{f.severity}</td>
                      <td><button className="finding-link" onClick={() => setSelected(f)}>{f.title}</button></td>
                      <td><code>{f.resource.id}</code></td>
                      <td><span className={`status-pill ${f.status}`}>{f.status}</span></td>
                      <td>{fixability(f)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!pageItems.length && <p className="note">No findings match these filters.</p>}
            </div>
            <div className="pagination"><span>{filtered.length} findings · Page {page + 1} of {Math.max(1, Math.ceil(filtered.length / PAGE))}</span><button className="secondary" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</button><button className="secondary" disabled={(page + 1) * PAGE >= filtered.length} onClick={() => setPage(page + 1)}>Next</button></div>
          </div>
        </div>
        <Copilot key={selected?.id ?? "none"} finding={selected} capability={capabilities.find(c => c.id === selected?.remediationCapabilityId)} />
      </div>
    </>
  );
}

function Copilot({ finding, capability }: { finding: Finding | undefined; capability: RemediationCapability | undefined }): React.ReactElement {
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [proposal, setProposal] = useState<RemediationProposal | undefined>();
  const [run, setRun] = useState<RemediationRun | undefined>();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setProposal(undefined); setRun(undefined);
    if (finding) {
      setMsgs([{ who: "agent", text: `Context loaded: "${finding.title}" on ${finding.resource.id} (${finding.status}, ${finding.severity}). Ask me to Explain, Investigate, or Preview Fix.` }]);
    } else {
      setMsgs([]);
    }
  }, [finding?.id]);

  function say(who: ChatMsg["who"], text: string) { setMsgs((m) => [...m, { who, text }]); }

  async function explain() {
    if (!finding) return;
    say("user", "Explain this finding.");
    say("agent", `${finding.description} Rule ${finding.ruleId}; frameworks ${(finding.frameworks ?? []).join(", ") || "n/a"}. This is a deterministic explanation over the finding record — no chain-of-thought exposed.`);
  }
  async function investigate() {
    if (!finding) return;
    say("user", "Investigate impact.");
    say("agent", `Target ${finding.resource.id} in ${finding.resource.region}. ${finding.remediationCapabilityId ? `A registered remediation capability exists (${finding.remediationCapabilityId}). I can Preview Fix.` : "No registered remediation capability; this needs manual handling."}`);
  }
  async function previewFix() {
    if (!finding) return;
    setBusy(true);
    try {
      setRun(undefined);
      const p = await backend.proposeRemediation(finding.id);
      setProposal(p);
      say("user", "Preview a fix.");
      say("agent", `Proposed: ${p.summary}. Exact target ${p.target.id}. ${p.requiresApproval ? "Requires Approve Once before any write." : "No approval required."}`);
    } catch (e) {
      say("agent", `Cannot propose: ${(e as Error).message}`);
    } finally { setBusy(false); }
  }
  async function decide(decision: "APPROVE_ONCE" | "REJECT") {
    if (!proposal) return;
    setBusy(true);
    try {
      await backend.decide(proposal.proposalId, decision, "lab-operator");
      const r = await backend.execute(proposal.proposalId);
      setRun(r);
      say("user", decision === "APPROVE_ONCE" ? "Approve once." : "Reject.");
      say("agent", `Run ${r.runId} → ${r.state} (${r.mode}). ${r.providerExecutionId ? `Provider execution ${r.providerExecutionId}.` : "No provider execution identifier recorded."} See recorded evidence below.`);
    } catch (e) { say("agent", `Run request failed: ${(e as Error).message}. Do not assume a provider write succeeded. Resume by the durable run ID if available.`); }
    finally { setBusy(false); }
  }

  const canFix = finding?.status === "NON_COMPLIANT" && !!finding.remediationCapabilityId;

  return (
    <div className="copilot panel">
      <div className="panel-h">Contextual Copilot</div>
      {finding ? (
        <section className="ctx-chip" aria-label="Remediation summary"><h2>Remediation summary</h2><b>{finding.title}</b>
          <dl><dt>Why it matters</dt><dd>{finding.description}</dd>
          <dt>Resource / Region</dt><dd><code>{finding.resource.id}</code> · {finding.resource.region}</dd>
          <dt>Status / Fixability</dt><dd>{finding.status} · {fixability(finding)}</dd>
          <dt>Registered capability</dt><dd>{finding.remediationCapabilityId ? <>{capability?.title ?? "Name not available"}<br /><code>{finding.remediationCapabilityId}</code></> : "None registered — manual handling"}</dd>
          <dt>Proposed deterministic change</dt><dd>{proposal ? <>{proposal.summary}<pre>{JSON.stringify(proposal.expectedChange, null, 2)}</pre></> : "Not proposed. Use Preview Fix for the exact target and change."}</dd>
          <dt>Approval required</dt><dd>{proposal ? (proposal.requiresApproval ? "Yes — Approve Once before a write" : "No — backend proposal") : capability ? (capability.requiresApproval ? "Yes — registered capability" : "No — registered capability") : "Unknown / no registered capability"}</dd>
          <dt>Last run / result in this view</dt><dd>{run ? <>{run.runId} · {run.state} · {run.mode}</> : "No run loaded"}</dd></dl>
        </section>
      ) : (
        <div className="ctx-chip empty">Select a finding — it becomes the assistant's bounded context automatically.</div>
      )}
      <div className="chat">
        {msgs.map((m, i) => (
          <div key={i} className={`msg ${m.who}`}><div className="who">{m.who}</div>{m.text}</div>
        ))}
      </div>
      {run && (
        <section className="evidence" aria-label="Evidence timeline"><h2>Evidence timeline · {run.mode}</h2>
          <ol>{([
            ["PROPOSAL", "Proposal"], ["APPROVAL", "Approval"], ["EXECUTION", "Provider write"],
            ["PROVIDER_READBACK", "Provider readback"], ["COMPLIANCE_READBACK", "Compliance result"],
          ] as const).map(([kind, label]) => {
            const entries = run.evidence.filter(e => e.kind === kind);
            return <li key={kind} data-step={kind}><b>{label}</b>{entries.length ? entries.map((e, i) => <div key={i}><time>{e.at}</time> · {e.mode}<p>{e.summary}</p>{e.detail && <pre>{JSON.stringify(e.detail, null, 2)}</pre>}</div>) : <p className="absent">Not recorded in this run. No operation or success is inferred.</p>}</li>;
          })}</ol>
          {run.providerExecutionId && <p>Provider execution ID: <code>{run.providerExecutionId}</code></p>}
          {run.evidence.filter(e => e.kind === "NOTE" || e.kind === "CLEANUP").map((e,i) => <p key={i}>{e.at} · {e.mode} · {e.summary}</p>)}
        </section>
      )}
      <div className="quick">
        <button className="secondary" disabled={!finding || busy} onClick={explain}>Explain</button>
        <button className="secondary" disabled={!finding || busy} onClick={investigate}>Investigate</button>
        <button className="secondary" disabled={!canFix || busy} onClick={previewFix}>Preview Fix</button>
        {proposal && !run && <>
          <button disabled={busy} onClick={() => decide("APPROVE_ONCE")}>Approve Once</button>
          <button className="danger" disabled={busy} onClick={() => decide("REJECT")}>Reject</button>
        </>}
      </div>
    </div>
  );
}
