/**
 * Guild.ai adapter for the Agent Security Control Plane.
 *
 * Architecture (always):
 *   Agent Request → Guild Adapter → Policy Decision → ALLOW/BLOCK/REQUIRE_APPROVAL → Tool
 *
 * DEMO MODE (default / only mode available without Guild credentials + SDK policy API):
 *   Local deterministic policy engine — no network. source: "local-demo"
 *
 * GUILD MODE (not wired):
 *   Would call a real Guild security/policy API when one exists and credentials are present.
 *   source: "guild" ONLY if Guild actually evaluated the request.
 *
 * Do NOT invent Guild APIs. Do NOT claim Guild enforcement for local decisions.
 *
 * Credentials (optional, gitignored):
 *   Load from `web/.env.local` or root `.env` via Next.js / process.env:
 *   - GUILD_API_TOKEN / GUILD_API_KEY (token starting with glda_)
 *   - GUILD_ENTITY_ID / GUILD_WORKSPACE_ID (UUID before the colon in Guild credential pairs)
 *   Presence of these vars does NOT switch source to "guild" — they are stored for
 *   future Guild CLI / API calls once a real policy-eval SDK exists.
 */

import { evaluatePolicy } from "./policy-engine";
import type {
  EnforcementSource,
  GuildSecurityAdapter,
  PolicyResult,
  ToolRequest,
} from "./types";

function withSource(
  result: Omit<PolicyResult, "source">,
  source: EnforcementSource,
): PolicyResult {
  return { ...result, source };
}

/** Read Guild API token from env if present (never hardcode; never NEXT_PUBLIC_*). */
export function readGuildApiToken(): string | undefined {
  const token =
    process.env.GUILD_API_TOKEN?.trim() ||
    process.env.GUILD_API_KEY?.trim() ||
    undefined;
  return token || undefined;
}

/** Read entity/workspace id from env if present. */
export function readGuildEntityId(): string | undefined {
  const id =
    process.env.GUILD_ENTITY_ID?.trim() ||
    process.env.GUILD_WORKSPACE_ID?.trim() ||
    undefined;
  return id || undefined;
}

/** True when a Guild API token is configured locally (does not imply live enforcement). */
export function hasGuildCredentials(): boolean {
  return Boolean(readGuildApiToken());
}

/**
 * Local demo enforcement — always available, no credentials required.
 * This is SIMULATED / local policy, not Guild cloud enforcement.
 */
export class DemoGuildAdapter implements GuildSecurityAdapter {
  readonly mode = "demo" as const;

  /** Sync path used by the deterministic client demo runner. */
  evaluateSync(request: ToolRequest): PolicyResult {
    return withSource(evaluatePolicy(request), "local-demo");
  }

  async evaluate(request: ToolRequest): Promise<PolicyResult> {
    return this.evaluateSync(request);
  }
}

/**
 * Placeholder for a real Guild-backed evaluator.
 *
 * BLOCKED — missing to integrate for real:
 * 1. A Guild SDK/API that evaluates tool requests and returns ALLOW/BLOCK/REQUIRE_APPROVAL
 *    (@guildai/agents-sdk v0.7.6 exposes llmAgent/tools only — no policy-eval API)
 * 2. Credentials: GUILD_API_TOKEN or GUILD_API_KEY (never hardcode) — may already be
 *    present in gitignored `.env` / `.env.local` for future use / Guild CLI
 * 3. Optional: Guild CLI (`guild`) for agent save/test — not installed in this environment
 * 4. Docs for the security control-plane endpoint (none found in local SDK README)
 *
 * Until those exist, this adapter MUST throw — never fake a Guild response.
 */
export class GuildRemoteAdapter implements GuildSecurityAdapter {
  readonly mode = "guild" as const;

  async evaluate(request: ToolRequest): Promise<PolicyResult> {
    void request;
    throw new Error(
      "Guild remote adapter is not configured: no Guild policy-evaluation API " +
        "available. Credentials may exist in env for future use, but createAdapter() " +
        "keeps DemoGuildAdapter (source: local-demo). Do not invent a Guild policy API.",
    );
  }
}

/**
 * Factory: prefer Guild only when explicitly enabled AND credentials exist AND
 * a real evaluator is wired. Today always returns DemoGuildAdapter — truthful.
 *
 * If GUILD_API_TOKEN is set, it is acknowledged for future Guild CLI/API work
 * but does not change enforcement source away from "local-demo".
 */
export function createAdapter(): GuildSecurityAdapter {
  const guildEnabled = process.env.GUILD_SECURITY_MODE === "guild";
  // Do not use NEXT_PUBLIC_* for enablement — that would expose intent client-side
  // and cannot carry secrets. Client demo always uses DemoGuildAdapter.
  const hasCreds = hasGuildCredentials();

  if (guildEnabled && hasCreds) {
    // Still no Guild policy API to call — refuse to return GuildRemoteAdapter
    // that would only throw, and refuse to pretend Demo is Guild.
    // Credentials remain available via readGuildApiToken() for future wiring.
    return new DemoGuildAdapter();
  }

  return new DemoGuildAdapter();
}

/** Singleton used by the client demo runner (always local-demo). */
export const securityControlPlane = new DemoGuildAdapter();

/**
 * Enforce a tool request through the adapter boundary (sync, local-demo).
 * Prefer this over calling evaluatePolicy() directly from UI/attack paths.
 */
export function enforceToolRequest(request: ToolRequest): PolicyResult {
  return securityControlPlane.evaluateSync(request);
}

/** Subtle UI label — never says "Guild" unless source === "guild". */
export function enforcementPlaneLabel(source: EnforcementSource): string {
  return source === "guild"
    ? "Security Control Plane / Guild Enforcement"
    : "Security Control Plane / Local Demo Policy";
}
