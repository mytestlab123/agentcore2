import { useCallback, useEffect, useState } from "react";

import Alert from "@cloudscape-design/components/alert";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import ColumnLayout from "@cloudscape-design/components/column-layout";
import Container from "@cloudscape-design/components/container";
import Header from "@cloudscape-design/components/header";
import KeyValuePairs from "@cloudscape-design/components/key-value-pairs";
import Modal from "@cloudscape-design/components/modal";
import SpaceBetween from "@cloudscape-design/components/space-between";
import type {
  BackendAdapter,
  EvidenceEvent,
  ExecutionState,
  Finding,
  Remediation,
} from "@agentcore2/contracts";

import { ComplianceIndicator, SeverityBadge } from "./status.js";
import { EvidenceTimeline } from "./EvidenceTimeline.js";

export interface FindingDetailProps {
  adapter: BackendAdapter;
  finding: Finding;
}

/**
 * Detail view for a single finding: full fields, the proposed remediation,
 * Preview Fix / Remediate actions gated by an Approve Once / Reject dialog, and
 * the live evidence timeline. Everything runs through the BackendAdapter seam.
 */
export function FindingDetail({
  adapter,
  finding,
}: FindingDetailProps): JSX.Element {
  const [remediation, setRemediation] = useState<Remediation | null>(null);
  const [previewed, setPreviewed] = useState(false);
  const [events, setEvents] = useState<EvidenceEvent[]>([]);
  const [execution, setExecution] = useState<ExecutionState | null>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  const refreshTimeline = useCallback(async () => {
    const timeline = await adapter.getEvidenceTimeline(finding.id);
    setEvents(timeline);
  }, [adapter, finding.id]);

  useEffect(() => {
    let active = true;
    setPreviewed(false);
    setExecution(null);
    void (async () => {
      const [proposed, timeline] = await Promise.all([
        adapter.getRemediationForFinding(finding.id),
        adapter.getEvidenceTimeline(finding.id),
      ]);
      if (!active) {
        return;
      }
      setRemediation(proposed);
      setEvents(timeline);
    })();
    return () => {
      active = false;
    };
  }, [adapter, finding.id]);

  const onPreviewFix = useCallback(async () => {
    setBusy(true);
    try {
      const proposed = await adapter.previewFix(finding.id);
      setRemediation(proposed);
      setPreviewed(true);
    } finally {
      setBusy(false);
    }
  }, [adapter, finding.id]);

  const onDecision = useCallback(
    async (approve: boolean) => {
      setBusy(true);
      try {
        const result = await adapter.requestRemediation(finding.id, {
          approve,
        });
        setExecution(result);
        await refreshTimeline();
      } finally {
        setBusy(false);
        setConfirmVisible(false);
      }
    },
    [adapter, finding.id, refreshTimeline],
  );

  return (
    <SpaceBetween size="l">
      <Container
        header={
          <Header
            variant="h2"
            actions={
              <SpaceBetween direction="horizontal" size="xs">
                <Button
                  data-testid="preview-fix-button"
                  disabled={busy || remediation === null}
                  onClick={() => void onPreviewFix()}
                >
                  Preview Fix
                </Button>
                <Button
                  data-testid="remediate-button"
                  variant="primary"
                  disabled={busy || remediation === null || execution !== null}
                  onClick={() => setConfirmVisible(true)}
                >
                  {execution === null ? "Remediate" : "Remediation recorded"}
                </Button>
              </SpaceBetween>
            }
          >
            {finding.title}
          </Header>
        }
      >
        <SpaceBetween size="m">
          <ColumnLayout columns={2} variant="text-grid">
            <KeyValuePairs
              columns={1}
              items={[
                {
                  label: "Severity",
                  value: <SeverityBadge severity={finding.severity} />,
                },
                {
                  label: "Compliance",
                  value: (
                    <ComplianceIndicator status={finding.complianceStatus} />
                  ),
                },
                { label: "Service", value: finding.service },
                { label: "Rule", value: finding.ruleId },
              ]}
            />
            <KeyValuePairs
              columns={1}
              items={[
                { label: "Resource", value: finding.resourceId },
                { label: "Resource type", value: finding.resourceType },
                { label: "Region", value: finding.region },
                { label: "Account", value: finding.accountId },
                { label: "Last observed", value: finding.lastObservedAt },
              ]}
            />
          </ColumnLayout>
        </SpaceBetween>
      </Container>

      <Container
        header={
          <Header variant="h2">
            Proposed remediation
            {previewed ? " (previewed)" : ""}
          </Header>
        }
      >
        {remediation === null ? (
          <Box color="text-status-inactive">
            No remediation is available for this finding.
          </Box>
        ) : (
          <KeyValuePairs
            columns={1}
            items={[
              { label: "Title", value: remediation.title },
              { label: "Description", value: remediation.description },
              {
                label: "Proposed action",
                value: remediation.proposedActionSummary,
              },
              { label: "Capability", value: remediation.capabilityId },
              {
                label: "Deterministic",
                value: remediation.deterministic ? "Yes" : "No",
              },
              {
                label: "Requires approval",
                value: remediation.requiresApproval ? "Yes" : "No",
              },
            ]}
          />
        )}
      </Container>

      {execution !== null ? (
        <Alert
          data-testid="execution-result"
          type={execution.status === "REJECTED" ? "warning" : "success"}
          header={`Execution ${execution.status}`}
        >
          Execution ID: <strong>{execution.executionId}</strong> · approved:{" "}
          {execution.approved ? "yes" : "no"}
        </Alert>
      ) : null}

      <Container header={<Header variant="h2">Evidence timeline</Header>}>
        <EvidenceTimeline events={events} />
      </Container>

      <Modal
        visible={confirmVisible}
        onDismiss={() => setConfirmVisible(false)}
        header="Approve remediation"
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button
                data-testid="reject-button"
                disabled={busy}
                onClick={() => void onDecision(false)}
              >
                Reject
              </Button>
              <Button
                data-testid="approve-button"
                variant="primary"
                disabled={busy}
                onClick={() => void onDecision(true)}
              >
                Approve Once
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <SpaceBetween size="s">
          <Box>
            Approving runs the deterministic remediation once and records the
            full evidence chain. Rejecting records the decision and mutates
            nothing.
          </Box>
          {remediation !== null ? (
            <Box variant="awsui-key-label">
              {remediation.proposedActionSummary}
            </Box>
          ) : null}
        </SpaceBetween>
      </Modal>
    </SpaceBetween>
  );
}
