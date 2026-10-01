import React, { useEffect, useState } from "react";
import { backend, LabControls } from "../../shared/LabControls";
import {
  type Finding,
  type RemediationCapability,
  type RemediationProposal,
  type RemediationRun,
} from "@agentcore2/contracts";

// Same seam as Previews A/B. This UI renders structured ACTION CARDS rather
// than a table or a chat page — testing whether generative UI reads clearer.

export function App(): React.ReactElement {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [caps, setCaps] = useState<RemediationCapability[]>([]);

  useEffect(() => {
    const load = () => {
      backend.listFindings({ status: "NON_COMPLIANT" }).then((f) => setFindings(f.slice(0, 24))).catch(() => setFindings([]));
      backend.listCapabilities().then(setCaps);
    };
    load(); window.addEventListener("lab-backend-changed", load);
    return () => window.removeEventListener("lab-backend-changed", load);
  }, []);

  return (
    <>
      <header className="topbar">
        <h1>AgentCore Lab · Preview C — Agent action cards</h1>
        <span className={`badge ${backend.mode}`}>{backend.mode.replace("_", " ")}</span>
      </header>
      <LabControls />
      <div className="wrap">
        <p className="lead">
          Each card is a structured, agent-proposed remediation for one finding: the impacted resource,
          the tool the agent selected, the approval state, the run state, and the evidence result — no free-text chat.
        </p>
        <div className="grid">
          {findings.map((f) => (
            <ActionCard key={f.id} finding={f} capability={caps.find((c) => c.id === f.remediationCapabilityId)} />
          ))}
        </div>
      </div>
    </>
  );
}

function ActionCard({ finding, capability }: { finding: Finding; capability?: RemediationCapability }): React.ReactElement {
  const [proposal, setProposal] = useState<RemediationProposal | undefined>();
  const [run, setRun] = useState<RemediationRun | undefined>();
  const [busy, setBusy] = useState(false);

  const state = run?.state ?? (proposal ? "PROPOSED" : "PROPOSED");

  async function propose() {
    setBusy(true);
    try { setProposal(await backend.proposeRemediation(finding.id)); }
    catch { /* no capability */ }
    finally { setBusy(false); }
  }
  async function decide(decision: "APPROVE_ONCE" | "REJECT") {
    if (!proposal) return;
    setBusy(true);
    try {
      await backend.decide(proposal.proposalId, decision, "lab-operator");
      setRun(await backend.execute(proposal.proposalId));
    } finally { setBusy(false); }
  }

  return (
    <div className="card">
      <div className="head">
        <span className={`sev ${finding.severity}`}>{finding.severity}</span>
        <span className={`state ${state}`}>{state}</span>
      </div>
      <div className="title">{finding.title}</div>
      <div className="row"><span>Impacted resource</span><span className="v">{finding.resource.id}</span></div>
      <div className="row"><span>Type</span><span className="v">{finding.resource.type}</span></div>
      <div className="tool">Tool selected: <b>{capability ? capability.title : "none registered"}</b>{capability ? ` · executor ${capability.executor}` : ""}</div>

      {!proposal && (
        <div className="acts">
          <button className="secondary" disabled={!capability || busy} onClick={propose}>Generate remediation</button>
        </div>
      )}
      {proposal && !run && (
        <>
          <div className="row"><span>Proposed</span><span className="v" style={{ maxWidth: 180, textAlign: "right" }}>{proposal.summary}</span></div>
          <div className="acts">
            <button disabled={busy} onClick={() => decide("APPROVE_ONCE")}>Approve Once</button>
            <button className="danger" disabled={busy} onClick={() => decide("REJECT")}>Reject</button>
          </div>
        </>
      )}
      {run && (
        <ul className="evid">
          {run.evidence.map((e, i) => <li key={i}><span className="k">{e.kind}</span>{e.summary}</li>)}
          <li style={{ marginTop: 4 }}>{run.providerExecutionId ? `Provider exec: ${run.providerExecutionId}` : "No writes performed."}</li>
        </ul>
      )}
    </div>
  );
}
