# Security — Agent Breakout

## Threat model

| Threat | Description | Demo surface |
| --- | --- | --- |
| Prompt injection | Untrusted text overrides agent goals | Levels 1–2 |
| Excessive agency | Agent has more tools/scope than needed | Reckless mode |
| Unauthorized tool use | Agent invokes tools outside task scope | All levels |
| Sensitive data exposure | RESTRICTED content leaves trust boundary | CEO_SECRET / flag |
| Tool poisoning | Malicious tool metadata steers behavior | Level 4 |
| Data exfiltration | External channel (`email.send`) | Level 3 |

All resources and the flag `FLAG{AGENT_TOO_POWERFUL}` are **fictional**. No real credentials, tokens, or personal data are used.

## REAL vs SIMULATED

| Layer | Status |
| --- | --- |
| Web policy engine (`policy-engine.ts`) | **SIMULATED / local-demo** — deterministic, offline |
| Guild adapter (`guild-adapter.ts`) | **SIMULATED** by default (`source: "local-demo"`) |
| Guild remote enforcement | **NOT INTEGRATED** — no Guild policy-eval API in local SDK |
| Root `agent.ts` Guild agent | Separate Guild scaffold; does **not** enforce the web demo |

UI label when local: `Security Control Plane / Local Demo Policy`.  
UI label only if a real Guild evaluation occurs: `Security Control Plane / Guild Enforcement`.

## Security controls (Guarded mode)

Implemented in `src/lib/security/policy-engine.ts` as the **Agent Security Control Plane**:

1. Tool allowlist (least privilege)
2. Resource-level scope checks
3. Classification gate (RESTRICTED blocked)
4. External action detection (`email.send`)
5. Human approval requirement for external send
6. Simulated path validation (reject `..`, null bytes, non-inventory shapes)

Decisions: `ALLOW` | `BLOCK` | `REQUIRE_APPROVAL` + human-readable explanation + `source`.

## Defensive coding practices

- No hardcoded credentials or secrets (fictional FLAG only)
- No `eval()`, no `dangerouslySetInnerHTML`, no API routes that execute tools
- Attack input sanitized (control chars stripped, length capped at 2000)
- No arbitrary filesystem, shell, or network tool execution in the demo
- Environment variables never rendered in the UI; secrets never use `NEXT_PUBLIC_*`
- Security response headers via `next.config.ts` (CSP, X-Frame-Options, etc.)
- Audit event list capped client-side
- Strict TypeScript
- Client components only for UI state; policy logic is pure/deterministic

## Trust boundary note

Enforcement runs in the browser for the hackathon demo (intentional, offline).
Treat it as an educational control plane, not a production server-side gate.

## Guild adapter

`src/lib/security/guild-adapter.ts` provides:

- `DemoGuildAdapter` — local enforcement (default), stamps `source: "local-demo"`
- `GuildRemoteAdapter` — throws until a real Guild policy API + credentials exist
- `createAdapter()` / `enforceToolRequest()` — demo path; never claims Guild without a real call

**Missing for real Guild integration:** Guild policy-evaluation SDK/API, `GUILD_API_TOKEN`/`GUILD_API_KEY`, Guild CLI, and docs for mapping decisions onto `PolicyResult`.

## Snyk scanning instructions

```bash
cd web
npm install
npx snyk auth          # required — authenticate in browser / token
npx snyk test          # open-source dependencies
npx snyk code test     # static analysis
```

See [`SNYK_RESULTS.md`](./SNYK_RESULTS.md) for recorded scan attempts.

Do not suppress legitimate findings just to go green — fix or document them.

## Reporting

For hackathon issues, open a GitHub issue on this repository. Do not file real vulnerability reports against simulated demo content.
