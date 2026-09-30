import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import {
  MockBackendAdapter,
  generateDataset,
  type BackendAdapter,
} from "@agentcore2/contracts";

import { App } from "../App.js";

// A small deterministic dataset keeps the DOM light and the tests fast while
// still exercising filtering, pagination, and the full remediation flow.
function makeAdapter(): BackendAdapter {
  return new MockBackendAdapter({
    dataset: generateDataset({ size: 40, seed: 1 }),
  });
}

describe("Preview A dashboard", () => {
  let adapter: BackendAdapter;

  beforeEach(() => {
    adapter = makeAdapter();
  });

  it("shows the MOCK badge and renders findings rows", async () => {
    render(<App adapter={adapter} />);

    const badge = screen.getByTestId("lab-mode-badge");
    expect(badge).toHaveTextContent("MOCK");

    // Wait for the async listFindings to resolve and rows to render.
    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
      const rows = screen.getAllByRole("row");
      // Header row plus at least one finding row.
      expect(rows.length).toBeGreaterThan(1);
    });
  });

  it("Approve produces an executionId and adds a CONFIG_CONVERGENCE event", async () => {
    const user = userEvent.setup();
    render(<App adapter={adapter} />);

    // Select the first finding row to open the detail split panel.
    await waitFor(() => {
      expect(screen.getAllByRole("row").length).toBeGreaterThan(1);
    });
    const rows = screen.getAllByRole("row");
    const firstRow = rows[1]!;
    const radio = within(firstRow).getByRole("radio");
    await user.click(radio);

    // Open the approval dialog via Remediate, then Approve Once.
    const remediate = await screen.findByTestId("remediate-button");
    await waitFor(() => expect(remediate).not.toBeDisabled());
    await user.click(remediate);

    const approve = await screen.findByTestId("approve-button");
    await user.click(approve);

    // The execution result surfaces an executionId.
    const result = await screen.findByTestId("execution-result");
    expect(result).toHaveTextContent("Execution SUCCEEDED");
    expect(result).toHaveTextContent(/exec-\d{8}/);

    // The evidence timeline gains a CONFIG_CONVERGENCE event.
    await waitFor(() => {
      expect(
        screen.getByTestId("evidence-CONFIG_CONVERGENCE"),
      ).toBeInTheDocument();
    });

    // Post-execution lockout: the Remediate action is disabled and relabeled so
    // the non-idempotent replay can no longer be triggered from the UI.
    await waitFor(() => {
      const remediateAfter = screen.getByTestId("remediate-button");
      expect(remediateAfter).toBeDisabled();
      expect(remediateAfter).toHaveTextContent("Remediation recorded");
    });
  });
});
