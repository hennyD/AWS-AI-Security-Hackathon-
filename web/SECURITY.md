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

## Security controls (Guarded mode)

Implemented in `src/lib/security/policy-engine.ts` as the **Agent Security Control Plane**:

1. Tool allowlist (least privilege)
2. Resource-level scope checks
3. Classification gate (RESTRICTED blocked)
4. External action detection (`email.send`)
5. Human approval requirement for external send

Decisions: `ALLOW` | `BLOCK` | `REQUIRE_APPROVAL` + human-readable explanation.

## Defensive coding practices

- No hardcoded credentials or secrets
- No `eval()`, no `dangerouslySetInnerHTML`
- Attack input sanitized (control chars stripped, length capped)
- No arbitrary filesystem, shell, or network tool execution in the demo
- Environment variables never rendered in the UI
- Strict TypeScript
- Client components only for UI state; policy logic is pure/deterministic

## Guild adapter

`src/lib/security/guild-adapter.ts` provides:

- `DemoGuildAdapter` — local enforcement (default)
- `GuildRemoteAdapter` — placeholder with TODOs (does not invent Guild APIs)
- `createAdapter()` — stays on demo unless Guild mode + credentials are configured

## Snyk scanning instructions

```bash
cd web
npm install
npx snyk auth          # if needed
npx snyk test          # open-source dependencies
npx snyk code test     # static analysis
```

Do not suppress legitimate findings just to go green — fix or document them.

## Reporting

For hackathon issues, open a GitHub issue on this repository. Do not file real vulnerability reports against simulated demo content.
