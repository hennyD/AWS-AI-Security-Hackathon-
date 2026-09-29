/**
 * Guild.ai adapter for the Agent Security Control Plane.
 *
 * DEMO MODE (default): local deterministic policy engine — no external calls.
 * GUILD MODE (future): plug real Guild evaluation here when credentials exist.
 *
 * Do NOT invent Guild APIs. This interface is intentionally thin.
 */

import { evaluatePolicy } from "./policy-engine";
import type { GuildSecurityAdapter, PolicyResult, ToolRequest } from "./types";

/**
 * Local demo enforcement — always available, no credentials required.
 */
export class DemoGuildAdapter implements GuildSecurityAdapter {
  readonly mode = "demo" as const;

  async evaluate(request: ToolRequest): Promise<PolicyResult> {
    // Synchronous policy wrapped as async to match the adapter contract.
    return evaluatePolicy(request);
  }
}

/**
 * Placeholder for a real Guild-backed evaluator.
 *
 * TODO(guild-integration):
 * - Wire Guild credentials/config from environment (never hardcode).
 * - Call the official Guild SDK/API once available in this project.
 * - Map Guild decisions onto PolicyResult { decision, explanation, control }.
 * - Keep DemoGuildAdapter as fallback when Guild is unavailable.
 *
 * Connection point: createAdapter() below — UI and attack-runner call only this.
 */
export class GuildRemoteAdapter implements GuildSecurityAdapter {
  readonly mode = "guild" as const;

  async evaluate(request: ToolRequest): Promise<PolicyResult> {
    // TODO(guild-integration): replace with real Guild policy evaluation.
    // Until then, refuse to pretend an external call succeeded.
    void request;
    throw new Error(
      "Guild remote adapter is not configured. Use DEMO MODE (DemoGuildAdapter).",
    );
  }
}

/**
 * Factory: prefer Guild only when explicitly enabled AND credentials exist.
 * Otherwise always return demo adapter so the hackathon demo cannot fail.
 */
export function createAdapter(): GuildSecurityAdapter {
  const guildEnabled =
    process.env.NEXT_PUBLIC_GUILD_SECURITY_MODE === "guild" ||
    process.env.GUILD_SECURITY_MODE === "guild";
  const hasCreds = Boolean(
    process.env.GUILD_API_TOKEN || process.env.GUILD_API_KEY,
  );

  if (guildEnabled && hasCreds) {
    // TODO(guild-integration): return new GuildRemoteAdapter() once wired.
    // Falling back to demo until real SDK integration lands.
    return new DemoGuildAdapter();
  }

  return new DemoGuildAdapter();
}

/** Singleton used by the client demo runner (demo mode only in browser). */
export const securityControlPlane = new DemoGuildAdapter();
