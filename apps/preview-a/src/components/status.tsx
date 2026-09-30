import Badge from "@cloudscape-design/components/badge";
import StatusIndicator from "@cloudscape-design/components/status-indicator";
import type { ComplianceStatus, Severity } from "@agentcore2/contracts";

const SEVERITY_COLOR: Record<Severity, "red" | "grey" | "blue"> = {
  CRITICAL: "red",
  HIGH: "red",
  MEDIUM: "blue",
  LOW: "grey",
  INFORMATIONAL: "grey",
};

export function SeverityBadge({ severity }: { severity: Severity }): JSX.Element {
  return <Badge color={SEVERITY_COLOR[severity]}>{severity}</Badge>;
}

export function ComplianceIndicator({
  status,
}: {
  status: ComplianceStatus;
}): JSX.Element {
  switch (status) {
    case "COMPLIANT":
      return <StatusIndicator type="success">Compliant</StatusIndicator>;
    case "NON_COMPLIANT":
      return <StatusIndicator type="error">Non-compliant</StatusIndicator>;
    case "NOT_APPLICABLE":
    default:
      return (
        <StatusIndicator type="stopped">Not applicable</StatusIndicator>
      );
  }
}
