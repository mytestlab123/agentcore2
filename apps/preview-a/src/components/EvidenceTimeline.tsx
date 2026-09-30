import Badge from "@cloudscape-design/components/badge";
import Box from "@cloudscape-design/components/box";
import SpaceBetween from "@cloudscape-design/components/space-between";
import type { EvidenceEvent, EvidenceKind } from "@agentcore2/contracts";

const COLOR_BY_KIND: Record<EvidenceKind, "blue" | "green" | "red" | "grey"> = {
  DETECTED: "grey",
  EXPLAINED: "grey",
  FIX_PROPOSED: "blue",
  APPROVED: "blue",
  REJECTED: "red",
  EXECUTED: "blue",
  PROVIDER_READBACK: "green",
  CONFIG_CONVERGENCE: "green",
  VERIFIED: "green",
};

export interface EvidenceTimelineProps {
  events: EvidenceEvent[];
}

/**
 * Ordered evidence timeline. Renders the DETECTED -> ... -> PROVIDER_READBACK
 * -> CONFIG_CONVERGENCE -> VERIFIED progression, keeping provider readback and
 * Config convergence as distinct entries (SPEC.md MUST).
 */
export function EvidenceTimeline({
  events,
}: EvidenceTimelineProps): JSX.Element {
  if (events.length === 0) {
    return <Box color="text-status-inactive">No evidence recorded yet.</Box>;
  }

  return (
    <ol
      data-testid="evidence-timeline"
      style={{ listStyle: "none", margin: 0, padding: 0 }}
    >
      <SpaceBetween size="s">
        {events.map((event) => (
          <li key={event.id} data-testid={`evidence-${event.kind}`}>
            <SpaceBetween direction="horizontal" size="xs">
              <Badge color={COLOR_BY_KIND[event.kind]}>{event.kind}</Badge>
              <Box variant="span">{event.summary}</Box>
            </SpaceBetween>
            <Box variant="small" color="text-body-secondary">
              {event.actor} · {new Date(event.timestamp).toLocaleString()}
              {event.executionId !== null ? ` · ${event.executionId}` : ""}
            </Box>
          </li>
        ))}
      </SpaceBetween>
    </ol>
  );
}
