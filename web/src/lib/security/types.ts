/**
 * Agent Breakout — shared security types for the Agent Security Control Plane.
 */

export type AgentMode = "reckless" | "guarded";

export type ToolName = "calendar.read" | "files.read" | "email.send";

export type Classification = "PUBLIC" | "INTERNAL" | "RESTRICTED";

export type PolicyDecision = "ALLOW" | "BLOCK" | "REQUIRE_APPROVAL";

export type ChallengeId =
  | "prompt-injection"
  | "permission-escape"
  | "data-exfiltration"
  | "tool-poisoning";

export interface ToolRequest {
  agent: AgentMode;
  tool: ToolName;
  resource: string;
  classification: Classification;
  action: string;
  reason: string;
}

export interface PolicyResult {
  decision: PolicyDecision;
  explanation: string;
  control?: string;
}

export interface SimulatedResource {
  path: string;
  classification: Classification;
  content: string;
  description: string;
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  tool: ToolName;
  resource: string;
  decision: PolicyDecision;
  agent: AgentMode;
  challengeId?: ChallengeId;
}

export interface AttackPipelineStep {
  id: "user" | "agent" | "tool" | "policy" | "outcome";
  label: string;
  detail: string;
  status: "pending" | "active" | "pass" | "fail" | "block";
}

export interface AttackOutcome {
  challengeId: ChallengeId;
  agent: AgentMode;
  attackInput: string;
  toolRequest: ToolRequest;
  policy: PolicyResult;
  breached: boolean;
  flag?: string;
  scoreDelta: number;
  learning: {
    whatHappened: string;
    whyDangerous: string;
    whatStoppedIt: string;
    vulnerability: string;
    risk: string;
    defense: string;
  };
  pipeline: AttackPipelineStep[];
  event: SecurityEvent;
}

export interface ChallengeDefinition {
  id: ChallengeId;
  level: number;
  title: string;
  goal: string;
  defaultAttack: string;
  hints: [string, string, string];
  points: number;
}

/** Guild adapter contract — local demo implements this without inventing APIs. */
export interface GuildSecurityAdapter {
  readonly mode: "demo" | "guild";
  evaluate(request: ToolRequest): Promise<PolicyResult>;
}
