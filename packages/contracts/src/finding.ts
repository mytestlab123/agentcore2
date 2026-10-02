/**
 * Shared compliance-domain contracts.
 *
 * These types are the stable seam every preview UI and every backend adapter
 * (mock, recorded, or live AgentCore) speaks. They are deliberately provider-
 * shaped (Config / Security Hub / CloudSCAPE-style) so a real finding source
 * can be adapted without changing the UI.
 *
 * DURABLE asset — candidate for harvest into cloudscape-remediation.
 */

/** How the data behind a screen or action was produced. Every preview must show this. */
export type ExecutionMode = "MOCK" | "RECORDED" | "LIVE_LAB";

export type ComplianceStatus = "COMPLIANT" | "NON_COMPLIANT" | "NOT_APPLICABLE" | "INSUFFICIENT_DATA";

export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFORMATIONAL";

/** The cloud resource a finding is about. Kept minimal and provider-neutral. */
export interface ResourceRef {
  /** Stable resource id, e.g. an S3 bucket name or ARN. */
  id: string;
  /** Resource type in a provider-neutral form, e.g. "AWS::S3::Bucket". */
  type: string;
  region: string;
  accountId: string;
  /** Human label for operators; never a secret. */
  name?: string;
  tags?: Record<string, string>;
}

/** A single compliance finding, the primary object operators reason about. */
export interface Finding {
  id: string;
  /** Rule / control the finding maps to, e.g. "s3-bucket-ssl-requests-only". */
  ruleId: string;
  title: string;
  description: string;
  severity: Severity;
  status: ComplianceStatus;
  resource: ResourceRef;
  /** Free-form control framework references (CIS, PCI, etc.). */
  frameworks?: string[];
  firstObservedAt: string;
  lastObservedAt: string;
  /** Id of a registered remediation capability that can address this finding, if any. */
  remediationCapabilityId?: string;
}

export interface FindingQuery {
  status?: ComplianceStatus;
  severity?: Severity;
  resourceType?: string;
  ruleId?: string;
  /** Case-insensitive substring across title/resource id. */
  search?: string;
}
