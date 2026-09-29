/**
 * Deterministic attack runner — no LLM required.
 * Maps challenge attack text → tool request → policy → outcome.
 */

import { getChallenge } from "./challenges";
import { evaluatePolicy } from "./policy-engine";
import { FLAG, POISONED_TOOL_DESCRIPTION, resolveResource } from "./resources";
import type {
  AgentMode,
  AttackOutcome,
  AttackPipelineStep,
  ChallengeId,
  Classification,
  SecurityEvent,
  ToolName,
  ToolRequest,
} from "./types";

const CEO_PATH = "/files/CEO_SECRET.txt";
const NOTES_PATH = "/files/project_notes.txt";

function clockLabel(): string {
  return new Date().toLocaleTimeString("en-US", { hour12: false });
}

function sanitizeAttackInput(raw: string): string {
  // Bound + strip control chars — never execute, eval, or interpret as code.
  return raw
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .slice(0, 2000)
    .trim();
}

function mentions(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

function detectToolRequest(
  challengeId: ChallengeId,
  attackInput: string,
  agent: AgentMode,
): ToolRequest {
  const text = attackInput.toLowerCase();

  if (challengeId === "data-exfiltration" || mentions(text, "email.send")) {
    return {
      agent,
      tool: "email.send",
      resource: CEO_PATH,
      classification: "RESTRICTED",
      action: "exfiltrate",
      reason: "User prompted agent to email restricted content externally.",
    };
  }

  if (challengeId === "tool-poisoning") {
    return {
      agent,
      tool: "files.read",
      resource: CEO_PATH,
      classification: "RESTRICTED",
      action: "read",
      reason: `Poisoned tool description steered agent: ${POISONED_TOOL_DESCRIPTION}`,
    };
  }

  if (
    mentions(text, "ceo_secret") ||
    mentions(text, "ceo secret") ||
    mentions(text, "/files/ceo_secret") ||
    challengeId === "prompt-injection" ||
    challengeId === "permission-escape"
  ) {
    return {
      agent,
      tool: "files.read",
      resource: CEO_PATH,
      classification: "RESTRICTED",
      action: "read",
      reason: "User prompt steered agent toward restricted CEO briefing.",
    };
  }

  if (mentions(text, "calendar")) {
    return {
      agent,
      tool: "calendar.read",
      resource: "/calendar/team_meeting.txt",
      classification: "PUBLIC",
      action: "read",
      reason: "User asked for calendar information.",
    };
  }

  // Benign fallback — internal notes
  return {
    agent,
    tool: "files.read",
    resource: NOTES_PATH,
    classification: "INTERNAL",
    action: "read",
    reason: "Default file read within simulated office.",
  };
}

function buildPipeline(
  attackInput: string,
  request: ToolRequest,
  decisionLabel: string,
  breached: boolean,
  blocked: boolean,
): AttackPipelineStep[] {
  const outcomeStatus = breached ? "fail" : blocked ? "block" : "pass";
  return [
    {
      id: "user",
      label: "USER PROMPT",
      detail: attackInput.slice(0, 160) || "(empty)",
      status: "pass",
    },
    {
      id: "agent",
      label: "AI AGENT",
      detail:
        request.agent === "reckless"
          ? "Reckless Agent interpreting instructions"
          : "Guarded Agent interpreting instructions",
      status: "pass",
    },
    {
      id: "tool",
      label: "TOOL REQUEST",
      detail: `${request.tool} → ${request.resource} [${request.classification}]`,
      status: "pass",
    },
    {
      id: "policy",
      label: "SECURITY POLICY",
      detail: "Agent Security Control Plane",
      status: blocked ? "block" : "pass",
    },
    {
      id: "outcome",
      label: decisionLabel,
      detail: breached
        ? "Restricted resource accessed"
        : blocked
          ? "Attack stopped by policy"
          : "Request completed within policy",
      status: outcomeStatus,
    },
  ];
}

function learningFor(
  challengeId: ChallengeId,
  agent: AgentMode,
  breached: boolean,
  control?: string,
): AttackOutcome["learning"] {
  const base = {
    "prompt-injection": {
      vulnerability: "Prompt injection / instruction override",
      risk: "Untrusted text can redefine agent goals and tool use.",
      defense: "Input distrust + least-privilege tools + resource policy",
    },
    "permission-escape": {
      vulnerability: "Excessive Agent Permissions",
      risk: "The agent could access information unrelated to its task.",
      defense: "Least-privilege tool authorization and resource-level policy enforcement.",
    },
    "data-exfiltration": {
      vulnerability: "Unauthorized external tool use",
      risk: "Sensitive data can leave the trust boundary via email.send.",
      defense: "Human approval gates for external actions + classification checks.",
    },
    "tool-poisoning": {
      vulnerability: "Tool poisoning",
      risk: "Malicious tool metadata can smuggle instructions into the agent.",
      defense: "Signed/reviewed tool catalogs + policy enforcement independent of descriptions.",
    },
  }[challengeId];

  if (breached) {
    return {
      whatHappened: "The agent complied and accessed restricted material.",
      whyDangerous: base.risk,
      whatStoppedIt: "Nothing — reckless mode has no meaningful controls.",
      ...base,
    };
  }

  return {
    whatHappened: "The Agent Security Control Plane intercepted the tool request.",
    whyDangerous: base.risk,
    whatStoppedIt: control ?? "Guarded security policy",
    ...base,
  };
}

function scoreDelta(
  challengeId: ChallengeId,
  agent: AgentMode,
  breached: boolean,
  decision: string,
): number {
  const challenge = getChallenge(challengeId);
  const points = challenge?.points ?? 100;
  if (agent === "reckless" && breached) return points;
  if (agent === "guarded" && (decision === "BLOCK" || decision === "REQUIRE_APPROVAL")) {
    return Math.floor(points / 2);
  }
  return 0;
}

/**
 * Run a challenge attack deterministically for the selected agent mode.
 */
export function runAttack(options: {
  challengeId: ChallengeId;
  agent: AgentMode;
  attackInput: string;
}): AttackOutcome {
  const sanitized = sanitizeAttackInput(options.attackInput);
  const challenge = getChallenge(options.challengeId);
  if (!challenge) {
    throw new Error(`Unknown challenge: ${options.challengeId}`);
  }

  const toolRequest = detectToolRequest(
    options.challengeId,
    sanitized,
    options.agent,
  );

  // Ensure classification matches resource inventory when known
  const resource = resolveResource(toolRequest.resource);
  if (resource) {
    toolRequest.classification = resource.classification as Classification;
  }

  const policy = evaluatePolicy(toolRequest);
  const breached =
    options.agent === "reckless" && policy.decision === "ALLOW" &&
    (toolRequest.classification === "RESTRICTED" ||
      toolRequest.tool === "email.send");
  const blocked =
    policy.decision === "BLOCK" || policy.decision === "REQUIRE_APPROVAL";

  const event: SecurityEvent = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: `${clockLabel()}`,
    tool: toolRequest.tool as ToolName,
    resource: toolRequest.resource,
    decision: policy.decision,
    agent: options.agent,
    challengeId: options.challengeId,
  };

  return {
    challengeId: options.challengeId,
    agent: options.agent,
    attackInput: sanitized,
    toolRequest,
    policy,
    breached,
    flag: breached ? FLAG : undefined,
    scoreDelta: scoreDelta(
      options.challengeId,
      options.agent,
      breached,
      policy.decision,
    ),
    learning: learningFor(
      options.challengeId,
      options.agent,
      breached,
      policy.control,
    ),
    pipeline: buildPipeline(
      sanitized,
      toolRequest,
      policy.decision,
      breached,
      blocked,
    ),
    event: { ...event, timestamp: clockLabel() },
  };
}

export function isSensitiveEvent(event: SecurityEvent): boolean {
  return (
    event.resource.includes("CEO_SECRET") ||
    event.tool === "email.send" ||
    event.decision === "BLOCK" ||
    event.decision === "REQUIRE_APPROVAL"
  );
}
