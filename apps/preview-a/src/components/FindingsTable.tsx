import { useEffect, useMemo, useState } from "react";

import Box from "@cloudscape-design/components/box";
import Header from "@cloudscape-design/components/header";
import Input from "@cloudscape-design/components/input";
import Pagination from "@cloudscape-design/components/pagination";
import Select, {
  type SelectProps,
} from "@cloudscape-design/components/select";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Table from "@cloudscape-design/components/table";
import type {
  BackendAdapter,
  ComplianceStatus,
  Finding,
  FindingQuery,
  Paginated,
  ServiceName,
  Severity,
} from "@agentcore2/contracts";

import { ComplianceIndicator, SeverityBadge } from "./status.js";

const PAGE_SIZE = 25;

const ANY: SelectProps.Option = { label: "Any", value: "" };

const COMPLIANCE_OPTIONS: SelectProps.Option[] = [
  ANY,
  { label: "Non-compliant", value: "NON_COMPLIANT" },
  { label: "Compliant", value: "COMPLIANT" },
  { label: "Not applicable", value: "NOT_APPLICABLE" },
];

const SEVERITY_OPTIONS: SelectProps.Option[] = [
  ANY,
  { label: "Critical", value: "CRITICAL" },
  { label: "High", value: "HIGH" },
  { label: "Medium", value: "MEDIUM" },
  { label: "Low", value: "LOW" },
  { label: "Informational", value: "INFORMATIONAL" },
];

const SERVICE_OPTIONS: SelectProps.Option[] = [
  ANY,
  { label: "S3", value: "S3" },
  { label: "EC2", value: "EC2" },
  { label: "EBS", value: "EBS" },
  { label: "IAM", value: "IAM" },
  { label: "RDS", value: "RDS" },
];

type SortKey = keyof Pick<
  Finding,
  "severity" | "complianceStatus" | "title" | "service" | "region"
> | "resourceId" | "lastObservedAt";

export interface FindingsTableProps {
  adapter: BackendAdapter;
  selectedFinding: Finding | null;
  onSelect: (finding: Finding) => void;
}

/**
 * Findings table driven entirely through the adapter's FindingQuery (filters +
 * server-style pagination), so filtering thousands of mock findings stays
 * responsive. Column sorting is applied to the current page.
 */
export function FindingsTable({
  adapter,
  selectedFinding,
  onSelect,
}: FindingsTableProps): JSX.Element {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [compliance, setCompliance] = useState<SelectProps.Option>(
    COMPLIANCE_OPTIONS[0]!,
  );
  const [severity, setSeverity] = useState<SelectProps.Option>(
    SEVERITY_OPTIONS[0]!,
  );
  const [service, setService] = useState<SelectProps.Option>(
    SERVICE_OPTIONS[0]!,
  );
  const [resourceType, setResourceType] = useState("");
  const [result, setResult] = useState<Paginated<Finding> | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("severity");
  const [sortDescending, setSortDescending] = useState(false);

  const query = useMemo<FindingQuery>(() => {
    const q: FindingQuery = { page, pageSize: PAGE_SIZE };
    if (compliance.value) {
      q.complianceStatus = compliance.value as ComplianceStatus;
    }
    if (severity.value) {
      q.severity = severity.value as Severity;
    }
    if (service.value) {
      q.service = service.value as ServiceName;
    }
    if (resourceType.trim()) {
      q.resourceType = resourceType.trim();
    }
    if (search.trim()) {
      q.search = search.trim();
    }
    return q;
  }, [page, compliance, severity, service, resourceType, search]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    void (async () => {
      const paged = await adapter.listFindings(query);
      if (active) {
        setResult(paged);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [adapter, query]);

  // Reset to page 1 whenever a filter changes.
  useEffect(() => {
    setPage(1);
  }, [compliance, severity, service, resourceType, search]);

  const items = useMemo(() => {
    const rows = result?.items ?? [];
    const sorted = [...rows].sort((a, b) => {
      const av = String(a[sortKey]);
      const bv = String(b[sortKey]);
      return av.localeCompare(bv);
    });
    return sortDescending ? sorted.reverse() : sorted;
  }, [result, sortKey, sortDescending]);

  return (
    <Table<Finding>
      variant="full-page"
      loading={loading}
      loadingText="Loading findings"
      items={items}
      trackBy="id"
      selectionType="single"
      selectedItems={selectedFinding ? [selectedFinding] : []}
      onSelectionChange={({ detail }) => {
        const next = detail.selectedItems[0];
        if (next) {
          onSelect(next);
        }
      }}
      sortingColumn={{ sortingField: sortKey }}
      sortingDescending={sortDescending}
      onSortingChange={({ detail }) => {
        setSortKey((detail.sortingColumn.sortingField as SortKey) ?? "severity");
        setSortDescending(detail.isDescending ?? false);
      }}
      columnDefinitions={[
        {
          id: "severity",
          header: "Severity",
          sortingField: "severity",
          cell: (f) => <SeverityBadge severity={f.severity} />,
        },
        {
          id: "complianceStatus",
          header: "Compliance",
          sortingField: "complianceStatus",
          cell: (f) => <ComplianceIndicator status={f.complianceStatus} />,
        },
        {
          id: "title",
          header: "Title",
          sortingField: "title",
          cell: (f) => f.title,
        },
        {
          id: "service",
          header: "Service",
          sortingField: "service",
          cell: (f) => f.service,
        },
        {
          id: "resourceId",
          header: "Resource",
          sortingField: "resourceId",
          cell: (f) => f.resourceId,
        },
        {
          id: "region",
          header: "Region",
          sortingField: "region",
          cell: (f) => f.region,
        },
        {
          id: "lastObservedAt",
          header: "Last observed",
          sortingField: "lastObservedAt",
          cell: (f) => f.lastObservedAt,
        },
      ]}
      header={
        <Header
          counter={result ? `(${result.total})` : undefined}
          description="Synthetic compliance findings served by the mock backend adapter."
        >
          Findings
        </Header>
      }
      filter={
        <SpaceBetween size="s">
          <Input
            data-testid="search-input"
            type="search"
            placeholder="Search title, resource, or rule"
            value={search}
            onChange={({ detail }) => setSearch(detail.value)}
          />
          <SpaceBetween direction="horizontal" size="xs">
            <Select
              data-testid="compliance-filter"
              selectedOption={compliance}
              options={COMPLIANCE_OPTIONS}
              onChange={({ detail }) => setCompliance(detail.selectedOption)}
              ariaLabel="Filter by compliance status"
            />
            <Select
              data-testid="severity-filter"
              selectedOption={severity}
              options={SEVERITY_OPTIONS}
              onChange={({ detail }) => setSeverity(detail.selectedOption)}
              ariaLabel="Filter by severity"
            />
            <Select
              data-testid="service-filter"
              selectedOption={service}
              options={SERVICE_OPTIONS}
              onChange={({ detail }) => setService(detail.selectedOption)}
              ariaLabel="Filter by service"
            />
            <Input
              data-testid="resource-type-filter"
              placeholder="Resource type"
              value={resourceType}
              onChange={({ detail }) => setResourceType(detail.value)}
            />
          </SpaceBetween>
        </SpaceBetween>
      }
      pagination={
        <Pagination
          currentPageIndex={result?.page ?? 1}
          pagesCount={result?.totalPages ?? 1}
          onChange={({ detail }) => setPage(detail.currentPageIndex)}
        />
      }
      empty={<Box textAlign="center">No findings match the current filters.</Box>}
    />
  );
}
