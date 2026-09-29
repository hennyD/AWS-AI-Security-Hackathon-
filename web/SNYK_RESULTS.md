# Snyk Results — Agent Breakout

**Date:** 2026-09-29  
**Branch:** `cursor/agent-breakout-harden-c621`  
**Scopes attempted:** `/workspace/web` (primary Next.js app), `/workspace` (root Guild agent package)  
**Honesty note:** Results below are from real CLI runs on this date with `SNYK_TOKEN` (value never recorded here; redacted as `snyk_uat.***`). No vulnerability findings are fabricated.

## Authentication status

**SUCCESS — CLI authenticated via `SNYK_TOKEN`.** Token was loaded from gitignored env files only (`/workspace/.env`, `/workspace/web/.env.local`). Identity: `hennyD`. Org id from SCA JSON: `ce0d9e95-d4b8-41a4-9316-9790b9102889`.

| Channel | Result |
| --- | --- |
| `cd web && npx snyk test` | **OK** — 54 deps, **0** vulnerable paths |
| `cd web && npx snyk test --dev` | **Issues found** — see SCA (devDependencies) below |
| `cd web && npx snyk code test` | **BLOCKED** — `SNYK-CODE-0005` / 403 — Snyk Code not enabled for org |
| `cd /workspace && npx snyk test` | **OK** — 3 deps, **0** vulnerable paths |
| `npx snyk secrets test` | **BLOCKED** — `SNYK-CLI-0016` / 403 — Snyk Secrets not enabled for org |
| Snyk MCP `snyk_sca_scan` / `snyk_code_scan` | **Not authenticated** — MCP session separate from CLI token (`User not authenticated. Please run 'snyk_auth' first`) |

### Secret handling (confirmed this run)

- Token written only to gitignored files: `/workspace/.env`, `/workspace/web/.env.local` (`SNYK_TOKEN=…`, mode `600`)
- **Not** in `NEXT_PUBLIC_*` or any committed file
- `git check-ignore -v` matches both secret files
- `git status` does **not** list them as staged/tracked
- Never `git add`’d
- **Rotate the token** — it was exposed in chat (`snyk_uat.***`)

### Env / `.snyk` path policy

`.gitignore` / `web/.gitignore` cover `.env`, `.env.*`, `.env.local`, `.env.*.local`, `.env*.local` (with `!.env.example` exceptions).  
`.snyk` and `web/.snyk` exclude `.env` / `.env.*` / `.env.local` scan paths so local secret files do not create noise. This does **not** ignore real dependency or code vulnerabilities.

## SCA summary (`npx snyk test`, production deps — primary)

| Scope | Dependencies | CRITICAL | HIGH | MEDIUM | LOW | Result |
| --- | --- | --- | --- | --- | --- | --- |
| `/workspace/web` | 54 | 0 | 0 | 0 | 0 | Clean (`ok: true`) |
| `/workspace` | 3 | 0 | 0 | 0 | 0 | Clean (`ok: true`) |

No production SCA issue titles/IDs — none reported.

## SCA summary (`npx snyk test --dev`, web only — supplemental)

DevDependency / lint toolchain scan (not production runtime):

| Severity | Unique count | Notes |
| --- | --- | --- |
| CRITICAL | 0 | — |
| HIGH | 2 | See issues below |
| MEDIUM | 1 | See issues below |
| LOW | 0 | — |

Open issue paths reported: **3 unique** / **5** vulnerability instances (duplicate paths via eslint vs `@eslint/eslintrc`).

| Severity | Title | ID | Package | Introduced by | Fix available? |
| --- | --- | --- | --- | --- | --- |
| HIGH | Infinite loop | `SNYK-JS-URIJS-19963963` | `uri-js@4.4.1` | `eslint` / `@eslint/eslintrc` → `ajv` → `uri-js` | Partial path suggests `eslint@10.0.0`; **`fixedIn: []`**; package already latest on npm |
| HIGH | Uncontrolled Recursion | `SNYK-JS-BRACES-19963945` | `braces@3.0.3` | `eslint-config-next` → `fast-glob` → `micromatch` → `braces` | **No** (`isUpgradable: false`, `fixedIn: []`; already latest) |
| MEDIUM | Improper Encoding or Escaping of Output | `SNYK-JS-URIJS-19963961` | `uri-js@4.4.1` | same as uri-js HIGH | Same as uri-js HIGH |

### Why not auto-fixed

- Both `uri-js` and `braces` are already at the newest published versions (`4.4.1`, `3.0.3`); Snyk reports empty `fixedIn`.
- Jumping to `eslint@10` would only drop one path, leave `@eslint/eslintrc` → `uri-js`, and risks Next.js eslint-config compatibility churn — not a safe no-redesign fix.
- Findings are confined to **eslint tooling (devDependencies)**, not the Next.js production bundle scanned by default `snyk test`.

## Snyk Code summary (`npx snyk code test`)

| Severity | Count | Notes |
| --- | --- | --- |
| CRITICAL | n/a | Scan did not run |
| HIGH | n/a | Scan did not run |
| MEDIUM | n/a | Scan did not run |
| LOW | n/a | Scan did not run |

**Remaining blocker:** enable **Snyk Code** for org `ce0d9e95-d4b8-41a4-9316-9790b9102889` in Snyk settings, then re-run `cd web && npx snyk code test`.

## Issues fixed via Snyk this run

None — production SCA was clean; `--dev` HIGH/MEDIUM issues have no publishable fixed versions / no safe drop-in upgrade.

Manual security review fixes (separate from Snyk) remain documented in hardening work / `SECURITY.md` and are **not** claimed as Snyk remediations.

## Remaining

1. **Snyk Code** — org feature disabled (`SNYK-CODE-0005`); no SAST results until enabled.
2. **Snyk Secrets** — org feature disabled (`SNYK-CLI-0016`); optional once enabled.
3. **DevDependency SCA** — `SNYK-JS-URIJS-19963963` (HIGH), `SNYK-JS-BRACES-19963945` (HIGH), `SNYK-JS-URIJS-19963961` (MEDIUM) — wait for upstream fixed releases or a compatible eslint/Next toolchain bump that removes the paths.
4. **Rotate `SNYK_TOKEN`** — exposed in chat; revoke/recreate at https://app.snyk.io/account and update local gitignored env only.
5. **Snyk MCP** — still needs MCP `snyk_auth` (CLI token does not authenticate MCP).

Re-run after Code is enabled / token rotated:

```bash
# Token only via env file — do not echo
set -a; source web/.env.local; set +a
cd web && npx snyk test && npx snyk test --dev && npx snyk code test
```
