import React, { useEffect, useMemo, useState } from "react";
import { backend, LabControls } from "../../shared/LabControls";
import {
  type Finding,
  type RemediationProposal,
  type RemediationRun,
  type Severity,
  type ComplianceStatus,
} from "@agentcore2/contracts";

// The shared adapter remains MOCK until an authenticated operator connects.

const SEVERITIES: Severity[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFORMATIONAL"];
const STATUSES: ComplianceStatus[] = ["NON_COMPLIANT", "COMPLIANT", "NOT_APPLICABLE", "INSUFFICIENT_DATA"];
const PAGE = 25;

export function App(): React.ReactElement {
  const [all, setAll] = useState<Finding[]>([]);
  const [status, setStatus] = useState<ComplianceStatus | "">("NON_COMPLIANT");
  const [severity, setSeverity] = useState<Severity | "">("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Finding | undefined>();

  useEffect(() => {
    const load = () => { backend.listFindings().then(setAll).catch(() => setAll([])); };
    load(); window.addEventListener("lab-backend-changed", load);
    return () => window.removeEventListener("lab-backend-changed", load);
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return all.filter((f) => {
      if (status && f.status !== status) return false;
      if (severity && f.severity !== severity) return false;
      if (q && !`${f.title} ${f.resource.id}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [all, status, severity, search]);

  const pageItems = filtered.slice(page * PAGE, page * PAGE + PAGE);
  const nonCompliant = all.filter((f) => f.status === "NON_COMPLIANT").length;

  return (
    <>
      <header className="topbar">
        <h1>AgentCore Lab · Preview A — Config-style baseline</h1>
        <span className={`badge ${backend.mode}`}>{backend.mode.replace("_", " ")}</span>
        <span style={{ fontSize: 12, opacity: 0.8 }}>operator baseline · little/no AI</span>
      </header>

      <LabControls />

      <div className="layout">
        <div className="main">
          <div className="panel" style={{ marginBottom: 16 }}>
            <div className="summary">
              <div><b>{all.length}</b>total findings</div>
              <div><b style={{ color: "#d13212" }}>{nonCompliant}</b>non-compliant</div>
              <div><b>{filtered.length}</b>matching filter</div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-h">
              <span>Findings</span>
              <span style={{ fontWeight: 400, fontSize: 12, color: "#5f6b7a" }}>{backend.mode === "MOCK" ? "synthetic dataset" : "allowlisted LAB canary"}</span>
            </div>
            <div className="filters">
              <select value={status} onChange={(e) => { setStatus(e.target.value as ComplianceStatus | ""); setPage(0); }}>
                <option value="">All statuses</option>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={severity} onChange={(e) => { setSeverity(e.target.value as Severity | ""); setPage(0); }}>
                <option value="">All severities</option>
                {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <input placeholder="Search title or resource…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} />
            </div>
            <div style={{ maxHeight: 520, overflow: "auto" }}>
              <table>
                <thead>
                  <tr><th>Severity</th><th>Finding</th><th>Resource</th><th>Status</th></tr>
                </thead>
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
            <div className="pager">
              <button className="secondary" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Prev</button>
              <span>Page {page + 1} of {Math.max(1, Math.ceil(filtered.length / PAGE))}</span>
              <button className="secondary" disabled={(page + 1) * PAGE >= filtered.length} onClick={() => setPage((p) => p + 1)}>Next</button>
            </div>
          </div>
        </div>

        <div className="drawer">
          <FindingDetail finding={selected} />
        </div>
      </div>
    </>
  );
}

function FindingDetail({ finding }: { finding: Finding | undefined }): React.ReactElement {
  const [proposal, setProposal] = useState<RemediationProposal | undefined>();
  const [run, setRun] = useState<RemediationRun | undefined>();
  const [busy, setBusy] = useState(false);

  useEffect(() => { setProposal(undefined); setRun(undefined); }, [finding?.id]);

  if (!finding) {
    return <div className="panel"><div className="panel-h">Detail</div><div className="note">Select a finding to see detail, preview a fix, and (with approval) remediate.</div></div>;
  }

  const canRemediate = finding.status === "NON_COMPLIANT" && !!finding.remediationCapabilityId;

  async function previewFix() {
    if (!finding) return;
    setBusy(true);
    try { setProposal(await backend.proposeRemediation(finding.id)); }
    finally { setBusy(false); }
  }
  async function decideAndRun(decision: "APPROVE_ONCE" | "REJECT") {
    if (!proposal) return;
    setBusy(true);
    try {
      await backend.decide(proposal.proposalId, decision, "lab-operator");
      setRun(await backend.execute(proposal.proposalId));
    } finally { setBusy(false); }
  }

  return (
    <div className="panel">
      <div className="panel-h">Finding detail</div>
      <div className="kv"><span>Title</span><span>{finding.title}</span></div>
      <div className="kv"><span>Severity</span><span className={`sev ${finding.severity}`}>{finding.severity}</span></div>
      <div className="kv"><span>Status</span><span className={`status-pill ${finding.status}`}>{finding.status}</span></div>
      <div className="kv"><span>Rule</span><span><code>{finding.ruleId}</code></span></div>
      <div className="kv"><span>Resource</span><span><code>{finding.resource.id}</code></span></div>
      <div className="kv"><span>Type</span><span>{finding.resource.type}</span></div>
      <div className="kv"><span>Region</span><span>{finding.resource.region}</span></div>
      <div className="kv"><span>Frameworks</span><span>{(finding.frameworks ?? []).join(", ") || "—"}</span></div>

      <div className="actions">
        <button className="secondary" disabled={!canRemediate || busy} onClick={previewFix}>Preview Fix</button>
      </div>
      {!canRemediate && <div className="note">No registered remediation capability for this finding, or it is already compliant.</div>}

      {proposal && (
        <>
          <div className="panel-h" style={{ borderTop: "1px solid var(--line)" }}>Proposed remediation</div>
          <div className="kv"><span>Action</span><span>{proposal.summary}</span></div>
          <div className="kv"><span>Exact target</span><span><code>{proposal.target.id}</code></span></div>
          <div className="kv"><span>Requires approval</span><span>{proposal.requiresApproval ? "Yes" : "No"}</span></div>
          {!run && (
            <div className="actions">
              <button disabled={busy} onClick={() => decideAndRun("APPROVE_ONCE")}>Approve Once</button>
              <button className="danger" disabled={busy} onClick={() => decideAndRun("REJECT")}>Reject</button>
            </div>
          )}
        </>
      )}

      {run && (
        <>
          <div className="panel-h" style={{ borderTop: "1px solid var(--line)" }}>
            Run {run.runId} — <span className={`status-pill ${run.state === "REJECTED" || run.state === "PROPOSED" ? "NON_COMPLIANT" : "COMPLIANT"}`}>{run.state}</span>
          </div>
          <ul className="timeline">
            {run.evidence.map((e, i) => (
              <li key={i}><span className="k">{e.kind}</span>{e.summary}</li>
            ))}
          </ul>
          <div className="note">Mode: {run.mode}. {run.providerExecutionId ? `Provider exec: ${run.providerExecutionId}` : "No writes performed."}</div>
        </>
      )}
    </div>
  );
}
