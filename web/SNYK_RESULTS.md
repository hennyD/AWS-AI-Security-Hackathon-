# Snyk Results — Agent Breakout

**Date:** 2026-09-29  
**Branch:** `cursor/agent-breakout-harden-c621`  
**Scopes attempted:** `/workspace/web` (primary Next.js app), `/workspace` (root Guild agent package)  
**Honesty note:** Results below are from real CLI/MCP attempts on this date. No vulnerability findings are fabricated.

## Authentication status

**BLOCKED — Snyk authentication required.** Interactive OAuth opened a browser login page on the agent VM (`app.snyk.io/login`, SNYK-US-01) but could not be completed without operator credentials. Callback target is `127.0.0.1:8080` / `:18081` on the VM, so laptop-side browser login cannot finish the CLI handshake. `SNYK_TOKEN` was not set in the environment.

| Channel | Result |
| --- | --- |
| `cd web && npx snyk auth` | OAuth URL shown; **authentication failed (timeout)** (`SNYK-CLI-0000`) after ~2 minutes — login page stayed on GitHub/Google provider chooser |
| `cd web && npx snyk test` | `ERROR Authentication error (SNYK-0005)` — 401 Unauthorized |
| `cd web && npx snyk code test` | `ERROR Authentication error (SNYK-0005)` — 401 Unauthorized |
| `cd /workspace && npx snyk test` | `ERROR Authentication error (SNYK-0005)` — 401 Unauthorized |
| Snyk MCP `snyk_trust` `/workspace/web` | Already trusted |
| Snyk MCP `snyk_auth` | Timed out (`MCP error -32001`); browser OAuth also opened; not completed |
| Snyk MCP `mcp_auth` | Failed: `Interaction query handler is not initialized` |
| Snyk MCP `snyk_sca_scan` / `snyk_code_scan` / `snyk_secret_scan` on `/workspace/web` | `User not authenticated. Please run 'snyk_auth' first` |

### Exact action the user must perform

```bash
# Option A — CLI (interactive browser login on a machine where you can finish OAuth)
cd web
npx snyk auth
npx snyk test
npx snyk code test

# Option B — preferred for Cloud Agents / CI (headless)
# Create a token at https://app.snyk.io/account → Auth Token
export SNYK_TOKEN="<your-snyk-api-token>"
cd web
npx snyk test
npx snyk code test

# Option C — Cursor Snyk MCP
# Invoke snyk_auth in the Snyk MCP namespace and complete the browser login
# (must complete in the same environment so localhost callback works),
# then re-run snyk_sca_scan / snyk_code_scan / snyk_secret_scan on /workspace/web
```

For this Cloud Agent environment, **Option B (`SNYK_TOKEN`)** is the reliable path. After auth succeeds, re-run scans and update this file with classified CRITICAL/HIGH/MEDIUM/LOW counts and remediations.

## Issues discovered

| Severity | Count | Notes |
| --- | --- | --- |
| CRITICAL | unknown | Scans did not execute (auth) |
| HIGH | unknown | Scans did not execute (auth) |
| MEDIUM | unknown | Scans did not execute (auth) |
| LOW | unknown | Scans did not execute (auth) |

No SCA, Snyk Code, or secret-scan findings were returned because every authenticated endpoint rejected the session.

## Issues fixed

None via Snyk — no authenticated scan output was available to act on.

Manual security review fixes (separate from Snyk) are documented in the hardening work / `SECURITY.md` (path validation, headers, least-privilege Guild agent tools, truthful enforcement `source`, audit event cap). Those are **not** claimed as Snyk remediations.

## Env / secret path policy

Guild API credentials (if any) live **only** in gitignored files:

- `/workspace/.env`
- `/workspace/web/.env.local`

Committed placeholders: `.env.example`, `web/.env.example` (no real values).

Snyk policy files (`.snyk`, `web/.snyk`) **exclude** `.env` / `.env.*` / `.env.local` from scan paths so local secret files do not create noise. This does **not** ignore real dependency or code vulnerabilities — do not broaden those excludes.

## Remaining

All Snyk SCA / SAST / secret findings remain **unknown until auth succeeds**. Blocker: provide `SNYK_TOKEN` (or complete `npx snyk auth` / MCP `snyk_auth` in an environment where the localhost OAuth callback is reachable), then re-run:

```bash
cd web && npx snyk test && npx snyk code test
# MCP: snyk_sca_scan, snyk_code_scan, snyk_secret_scan on /workspace/web
```

Update this document with real discovered / fixed / remaining classifications after that run. Do not fabricate results.
