import { useState } from "react";

import AppLayout from "@cloudscape-design/components/app-layout";
import Box from "@cloudscape-design/components/box";
import ContentLayout from "@cloudscape-design/components/content-layout";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";
import SplitPanel from "@cloudscape-design/components/split-panel";
import type { BackendAdapter, Finding } from "@agentcore2/contracts";

import { FindingDetail } from "./components/FindingDetail.js";
import { FindingsTable } from "./components/FindingsTable.js";
import { LabModeBadge } from "./components/LabModeBadge.js";

export interface AppProps {
  adapter: BackendAdapter;
}

export function App({ adapter }: AppProps): JSX.Element {
  const [selected, setSelected] = useState<Finding | null>(null);
  const [splitOpen, setSplitOpen] = useState(false);

  const onSelect = (finding: Finding): void => {
    setSelected(finding);
    setSplitOpen(true);
  };

  return (
    <>
      <Box padding={{ horizontal: "l", vertical: "s" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
          }}
        >
          <Box variant="h1" padding="n">
            Compliance Dashboard · Preview A
          </Box>
          <SpaceBetween direction="horizontal" size="xs" alignItems="center">
            <Box variant="span" color="text-body-secondary">
              Lab mode:
            </Box>
            <LabModeBadge mode={adapter.mode()} />
          </SpaceBetween>
        </div>
      </Box>
      <AppLayout
        toolsHide
        navigationHide
        content={
          <ContentLayout
            header={
              <Header
                variant="h1"
                description="AWS Config / Security Hub-style findings, served entirely from the mock backend adapter. Select a finding to preview and remediate."
              >
                Findings
              </Header>
            }
          >
            <FindingsTable
              adapter={adapter}
              selectedFinding={selected}
              onSelect={onSelect}
            />
          </ContentLayout>
        }
        splitPanelOpen={splitOpen && selected !== null}
        onSplitPanelToggle={({ detail }) => setSplitOpen(detail.open)}
        splitPanel={
          selected !== null ? (
            <SplitPanel header={selected.title} hidePreferencesButton>
              <FindingDetail adapter={adapter} finding={selected} />
            </SplitPanel>
          ) : undefined
        }
      />
    </>
  );
}
