# Security

See [`web/SECURITY.md`](./web/SECURITY.md) for the Agent Breakout threat model, controls, and Snyk instructions.

Simulated secrets only (`FLAG{AGENT_TOO_POWERFUL}`). Never commit real credentials.

**Enforcement truth:** the interactive demo uses **local-demo** policy (`source: "local-demo"`). It does **not** perform live Guild enforcement. See `web/SNYK_RESULTS.md` for Snyk auth status.
