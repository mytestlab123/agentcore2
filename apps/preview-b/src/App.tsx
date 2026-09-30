import React, { useEffect, useMemo, useState } from "react";
import {
  MockComplianceBackend,
  type ComplianceBackend,
  type Finding,
  type RemediationProposal,
  type RemediationRun,
  type ComplianceStatus,
} from "@agentcore2/contracts";

// Same seam as Preview A. The ONLY difference is the interaction model.
const backend: ComplianceBackend = new MockComplianceBackend();
const PAGE = 25;

interface ChatMsg { who: "user" | "agent"; text: string; }

export function App(): React.ReactElement {
  const [all, setAll] = useState<Finding[]>([]);
  const [status, setStatus] = useState<ComplianceStatus | "">("NON_COMPLIANT");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Finding | undefined>();

  useEffect(() => { backend.listFindings().then(setAll); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return all.filter((f) => {
      if (status && f.status !== status) return false;
      if (q && !`${f.title} ${f.resource.id}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [all, status, search]);

  const pageItems = filtered.slice(page * PAGE, page * PAGE + PAGE);

  return (
    <>
      <header className="topbar">
        <h1>AgentCore Lab · Preview B — Cloudscape + contextual Copilot</h1>
        <span className={`badge ${backend.mode}`}>{backend.mode.replace("_", " ")}</span>
        <span style={{ fontSize: 12, opacity: 0.8 }}>finding stays bounded context — not a generic chatbot</span>
      </header>
      <div className="layout">
        <div className="main">
          <div className="panel">
            <div className="panel-h"><span>Findings</span></div>
            <div className="filters">
              <select value={status} onChange={(e) => { setStatus(e.target.value as ComplianceStatus | ""); setPage(0); }}>
                <option value="">All statuses</option>
                <option value="NON_COMPLIANT">NON_COMPLIANT</option>
                <option value="COMPLIANT">COMPLIANT</option>
              </select>
              <input placeholder="Search…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} />
            </div>
            <div style={{ maxHeight: 560, overflow: "auto" }}>
              <table>
                <thead><tr><th>Severity</th><th>Finding</th><th>Resource</th><th>Status</th></tr></thead>
                <tbody>
                  {pageItems.map((f) => (
                    <tr key={f.id} className={selected?.id === f.id ? "selected" : ""} onClick={() => setSelected(f)}>
                      <td className={`sev ${f.severity}`}>{f.severity}</td>
                      <td>{f.title}</td>
                      <td><code>{f.resource.id}</code></td>
                      <td><span className={`status-pill ${f.status}`}>{f.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <Copilot finding={selected} />
      </div>
    </>
  );
}

function Copilot({ finding }: { finding: Finding | undefined }): React.ReactElement {
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
      say("agent", decision === "APPROVE_ONCE"
        ? `Executed. Run ${r.runId} → ${r.state}. Provider exec ${r.providerExecutionId}. Verify below.`
        : `Rejected. Run ${r.runId} → ${r.state}. Zero writes performed.`);
    } finally { setBusy(false); }
  }

  const canFix = finding?.status === "NON_COMPLIANT" && !!finding.remediationCapabilityId;

  return (
    <div className="copilot panel">
      <div className="panel-h">Contextual Copilot</div>
      {finding ? (
        <div className="ctx-chip"><b>Bounded context:</b><br />{finding.title}<br /><span className="r">{finding.resource.id}</span> · {finding.status}</div>
      ) : (
        <div className="ctx-chip empty">Select a finding — it becomes the assistant's bounded context automatically.</div>
      )}
      <div className="chat">
        {msgs.map((m, i) => (
          <div key={i} className={`msg ${m.who}`}><div className="who">{m.who}</div>{m.text}</div>
        ))}
      </div>
      {run && (
        <ul className="evidence">
          {run.evidence.map((e, i) => <li key={i}><span className="k">{e.kind}</span>{e.summary}</li>)}
        </ul>
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
