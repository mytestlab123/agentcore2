/**
 * Agent catalogue — the planned specialist agents for the compliance lab.
 *
 * At Milestone 1 every agent is PLANNED or MOCK (no LIVE agent yet). The
 * catalogue holds between 5 and 8 agents, matching the Issue #3 starter set.
 */

/** Where an agent is intended to run once live. */
export type PlannedRuntime = "HARNESS" | "CUSTOM";

/** How ready an agent is. No LIVE agents at M1. */
export type AgentReadiness = "PLANNED" | "MOCK" | "LIVE";

/** A single capability an agent can perform. */
export interface AgentCapability {
  id: string;
  title: string;
  /** True when the capability produces a deterministic, reproducible result. */
  deterministic: boolean;
  /** True when the capability mutates a resource and needs approval. */
  requiresApproval: boolean;
}

/** Definition of a planned or mock agent. */
export interface AgentDefinition {
  id: string;
  name: string;
  /** Primary domain the agent specialises in. */
  domain: string;
  description: string;
  plannedRuntime: PlannedRuntime;
  readiness: AgentReadiness;
  capabilities: AgentCapability[];
}

/**
 * The M1 starter catalogue (7 agents). All readiness MOCK or PLANNED.
 *
 * Capability ids here are the same ids referenced by mock remediations via
 * {@link Remediation.capabilityId}, so previews can trace a proposed fix back
 * to the agent capability that owns it.
 */
export const AGENT_CATALOGUE: AgentDefinition[] = [
  {
    id: "agent-s3-ssl",
    name: "S3 SSL Enforcement Specialist",
    domain: "S3",
    description:
      "Ensures S3 buckets deny non-TLS (HTTP) access via bucket policy.",
    plannedRuntime: "HARNESS",
    readiness: "MOCK",
    capabilities: [
      {
        id: "cap-s3-enforce-ssl",
        title: "Enforce aws:SecureTransport bucket policy",
        deterministic: true,
        requiresApproval: true,
      },
    ],
  },
  {
    id: "agent-s3-logging",
    name: "S3 Access Logging Specialist",
    domain: "S3",
    description: "Enables server access logging on S3 buckets.",
    plannedRuntime: "HARNESS",
    readiness: "MOCK",
    capabilities: [
      {
        id: "cap-s3-enable-logging",
        title: "Enable S3 server access logging",
        deterministic: true,
        requiresApproval: true,
      },
    ],
  },
  {
    id: "agent-s3-backup",
    name: "S3 Backup / Versioning Specialist",
    domain: "S3",
    description: "Enables versioning and backup posture on S3 buckets.",
    plannedRuntime: "HARNESS",
    readiness: "MOCK",
    capabilities: [
      {
        id: "cap-s3-enable-versioning",
        title: "Enable S3 bucket versioning",
        deterministic: true,
        requiresApproval: true,
      },
    ],
  },
  {
    id: "agent-sg-specialist",
    name: "Security Group Specialist",
    domain: "EC2",
    description:
      "Detects and closes overly permissive inbound security group rules.",
    plannedRuntime: "HARNESS",
    readiness: "MOCK",
    capabilities: [
      {
        id: "cap-sg-restrict-ingress",
        title: "Restrict 0.0.0.0/0 ingress on sensitive ports",
        deterministic: true,
        requiresApproval: true,
      },
    ],
  },
  {
    id: "agent-ebs-backup",
    name: "EBS Backup Specialist",
    domain: "EBS",
    description: "Ensures EBS volumes have snapshot/backup coverage.",
    plannedRuntime: "HARNESS",
    readiness: "MOCK",
    capabilities: [
      {
        id: "cap-ebs-enable-backup",
        title: "Enable EBS snapshot backup policy",
        deterministic: true,
        requiresApproval: true,
      },
    ],
  },
  {
    id: "agent-finding-triage",
    name: "Finding Triage & Explanation Assistant",
    domain: "Cross-cutting",
    description:
      "Explains findings in plain language and proposes prioritisation.",
    plannedRuntime: "HARNESS",
    readiness: "PLANNED",
    capabilities: [
      {
        id: "cap-explain-finding",
        title: "Explain a finding and its remediation",
        deterministic: false,
        requiresApproval: false,
      },
    ],
  },
  {
    id: "agent-evidence-report",
    name: "Evidence & Report Assistant",
    domain: "Cross-cutting",
    description:
      "Compiles evidence timelines and remediation reports for review.",
    plannedRuntime: "HARNESS",
    readiness: "PLANNED",
    capabilities: [
      {
        id: "cap-compile-evidence",
        title: "Compile an evidence / remediation report",
        deterministic: false,
        requiresApproval: false,
      },
    ],
  },
];

/** Look up a capability across all agents by id. */
export function findCapability(
  capabilityId: string,
): { agent: AgentDefinition; capability: AgentCapability } | null {
  for (const agent of AGENT_CATALOGUE) {
    for (const capability of agent.capabilities) {
      if (capability.id === capabilityId) {
        return { agent, capability };
      }
    }
  }
  return null;
}
