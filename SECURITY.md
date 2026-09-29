# Security

See [`web/SECURITY.md`](./web/SECURITY.md) for the Agent Breakout threat model, controls, and Snyk instructions.

Simulated demo flag only (`FLAG{AGENT_TOO_POWERFUL}`). Never commit real credentials.

**Secrets:** real Guild tokens (if configured) live only in gitignored `.env` / `web/.env.local`. Placeholders in `.env.example`. Snyk `.snyk` excludes those paths — not real vulns.

**Enforcement truth:** the interactive demo uses **local-demo** policy (`source: "local-demo"`). It does **not** perform live Guild enforcement even when `GUILD_API_TOKEN` is set. See `web/SNYK_RESULTS.md` for Snyk auth status.
