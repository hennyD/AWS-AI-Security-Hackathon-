# Snyk Results — Agent Breakout

**Date:** 2026-09-29  
**Scopes attempted:** `/workspace/web`, `/workspace`  
**Honesty note:** Results below are from real CLI/MCP attempts. No vulnerability findings are fabricated.

## Authentication status

**BLOCKED — Snyk authentication required.**

| Channel | Result |
| --- | --- |
| `cd web && npx snyk test` | `ERROR Authentication error (SNYK-0005)` — 401 Unauthorized |
| `cd web && npx snyk code test` | `ERROR Authentication error (SNYK-0005)` — 401 Unauthorized |
| `cd /workspace && npx snyk test` | `ERROR Authentication error (SNYK-0005)` — 401 Unauthorized |
| Snyk MCP `snyk_sca_scan` / `snyk_code_scan` / `snyk_secret_scan` | `User not authenticated. Please run 'snyk_auth' first` |
| Snyk MCP `snyk_auth` | Timed out (interactive browser/device auth not completable in this agent environment) |

### Exact action the user must perform

```bash
# Option A — CLI (interactive browser login)
cd web
npx snyk auth
npx snyk test
npx snyk code test

# Option B — CLI with token (CI / headless)
export SNYK_TOKEN="<your-snyk-api-token>"   # from https://app.snyk.io/account
cd web
npx snyk test
npx snyk code test

# Option C — Cursor Snyk MCP
# Invoke snyk_auth in the Snyk MCP namespace and complete the browser login,
# then re-run snyk_sca_scan / snyk_code_scan / snyk_secret_scan on /workspace/web
```

## Issues discovered

| Severity | Count | Notes |
| --- | --- | --- |
| CRITICAL | unknown | Scans did not execute (auth) |
| HIGH | unknown | Scans did not execute (auth) |
| MEDIUM | unknown | Scans did not execute (auth) |
| LOW | unknown | Scans did not execute (auth) |

## Issues fixed

None via Snyk — no authenticated scan output was available to act on.

Manual security review fixes (separate from Snyk) are documented in the hardening commit / SECURITY.md (path validation, headers, least-privilege Guild agent tools, truthful enforcement `source`, audit event cap).

## Env / secret path policy

Guild API credentials (if any) live **only** in gitignored files:

- `/workspace/.env`
- `/workspace/web/.env.local`

Committed placeholders: `.env.example`, `web/.env.example` (no real values).

Snyk policy files (`.snyk`, `web/.snyk`) **exclude** `.env` / `.env.*` / `.env.local` from scan paths so local secret files do not create noise. This does **not** ignore real dependency or code vulnerabilities — do not broaden those excludes.

## Remaining

All Snyk SCA/SAST/secret findings remain **unknown until auth succeeds**. Re-run the commands above after `snyk auth` or `SNYK_TOKEN`, then update this file with classified CRITICAL/HIGH/MEDIUM/LOW results and remediations.
