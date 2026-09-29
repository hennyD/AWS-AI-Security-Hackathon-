/**
 * Deterministic Agent Security Control Plane policy engine.
 * Pure functions — no network, no filesystem, no command execution.
 */

import type {
  AgentMode,
  PolicyDecision,
  PolicyResult,
  ToolName,
  ToolRequest,
} from "./types";
import { resolveResource } from "./resources";

const RECKLESS_TOOLS: ToolName[] = [
  "calendar.read",
  "files.read",
  "email.send",
];

const GUARDED_TOOLS: ToolName[] = ["calendar.read", "files.read"];

const GUARDED_ALLOWED_RESOURCES = new Set([
  "/calendar/team_meeting.txt",
  "/files/project_notes.txt",
]);

function decision(
  value: PolicyDecision,
  explanation: string,
  control?: string,
): PolicyResult {
  return { decision: value, explanation, control };
}

/**
 * Evaluate a tool request for the given agent mode.
 * Reckless mode grants all tools and resources (demo of over-permission).
 * Guarded mode enforces least privilege, classification, and approval gates.
 */
export function evaluatePolicy(request: ToolRequest): PolicyResult {
  const resource = resolveResource(request.resource);

  if (request.agent === "reckless") {
    if (!RECKLESS_TOOLS.includes(request.tool)) {
      return decision(
        "BLOCK",
        `Unknown tool "${request.tool}" is not registered.`,
        "Tool allowlist",
      );
    }
    return decision(
      "ALLOW",
      "Reckless agent has no meaningful security controls — request permitted.",
      "None (demo over-permission)",
    );
  }

  // --- Guarded Agent Security Control Plane ---

  // 1. Is the tool permitted?
  if (!GUARDED_TOOLS.includes(request.tool)) {
    if (request.tool === "email.send") {
      return decision(
        "REQUIRE_APPROVAL",
        "External action email.send requires human approval before execution.",
        "Human approval gate for external actions",
      );
    }
    return decision(
      "BLOCK",
      `Tool "${request.tool}" is not in the guarded agent allowlist.`,
      "Least-privilege tool authorization",
    );
  }

  // 2. Is the requested resource within scope?
  if (!GUARDED_ALLOWED_RESOURCES.has(request.resource)) {
    return decision(
      "BLOCK",
      `Agent attempted to access "${request.resource}" outside its authorized scope.`,
      "Resource-level scope enforcement",
    );
  }

  // 3. Is the data sensitive?
  const classification =
    resource?.classification ?? request.classification;
  if (classification === "RESTRICTED") {
    return decision(
      "BLOCK",
      "Agent attempted to access a RESTRICTED resource outside its authorized scope.",
      "Classification-based access control",
    );
  }

  // 4. External actions (email) are handled above via REQUIRE_APPROVAL.
  // 5. Human approval already applied for email.send.

  if (!resource) {
    return decision(
      "BLOCK",
      `Unknown resource "${request.resource}".`,
      "Resource inventory check",
    );
  }

  return decision(
    "ALLOW",
    `Permitted: ${request.tool} on ${request.resource} (${classification}).`,
    "Least-privilege tool + resource policy",
  );
}

export function isSensitiveAccessAttempt(request: ToolRequest): boolean {
  return (
    request.classification === "RESTRICTED" ||
    request.resource.includes("CEO_SECRET") ||
    request.tool === "email.send"
  );
}

export function describeMode(mode: AgentMode): string {
  return mode === "reckless"
    ? "No meaningful security controls."
    : "Security policies protect sensitive tools and information.";
}
