import Badge from "@cloudscape-design/components/badge";
import type { LabMode } from "@agentcore2/contracts";

const COLOR_BY_MODE: Record<LabMode, "blue" | "green" | "red"> = {
  MOCK: "blue",
  RECORDED: "green",
  LIVE_LAB: "red",
};

const LABEL_BY_MODE: Record<LabMode, string> = {
  MOCK: "MOCK",
  RECORDED: "RECORDED",
  LIVE_LAB: "LIVE LAB",
};

export interface LabModeBadgeProps {
  mode: LabMode;
}

/**
 * Prominent, always-visible indicator of which lab mode the backend adapter is
 * operating in (SPEC.md MUST: visibly label MOCK / RECORDED / LIVE LAB).
 */
export function LabModeBadge({ mode }: LabModeBadgeProps): JSX.Element {
  return (
    <span data-testid="lab-mode-badge">
      <Badge color={COLOR_BY_MODE[mode]}>{LABEL_BY_MODE[mode]}</Badge>
    </span>
  );
}
