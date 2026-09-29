# Agent Breakout

**Escape the AI Office** — an interactive AI-security mini-game for the AWS AI Security Hackathon.

## Problem

AI agents can become dangerous when untrusted instructions combine with excessive tool permissions.

## Solution

Agent Breakout demonstrates attacks against AI agents and shows how policy enforcement changes the outcome for the **same attack**.

## Architecture

```
User
 ↓
Agent (Reckless | Guarded)
 ↓
Tool Request
 ↓
Agent Security Control Plane
 ↓
ALLOW / BLOCK / REQUIRE APPROVAL
 ↓
Tool (simulated)
```

Web app lives in [`web/`](./web). Root retains the Guild.ai TypeScript agent scaffold (`agent.ts`) for future Guild integration.

## Security Concepts

- Prompt injection
- Excessive agency
- Unauthorized tool use
- Sensitive-data leakage
- Tool poisoning
- Least privilege
- Human approval gates
- Auditability

## Installation

```bash
cd web
npm install
```

## Running locally

```bash
cd web
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Production:

```bash
cd web
npm run build
npm start
```

## Demo mode

The game is **fully deterministic**. It does not call an external LLM or Guild API.

- Reckless mode: over-permissioned agent (ALLOW on restricted paths / email).
- Guarded mode: Agent Security Control Plane blocks or requires approval.
- Replay button: re-runs the identical attack against the guarded agent.

## Guild integration architecture

| Piece | Path | Role |
| --- | --- | --- |
| Types | `web/src/lib/security/types.ts` | Shared request/decision contracts |
| Policy engine | `web/src/lib/security/policy-engine.ts` | Deterministic local enforcement |
| Guild adapter | `web/src/lib/security/guild-adapter.ts` | Demo adapter + TODO for real Guild |
| Root Guild agent | `agent.ts` | Guild CLI TypeScript agent scaffold |

`createAdapter()` stays on **DemoGuildAdapter** unless Guild mode is explicitly enabled with credentials. The UI never claims an external Guild evaluation occurred in demo mode.

## Snyk scanning

From `web/`:

```bash
npx snyk test
npx snyk code test
```

From repo root (also scans Guild agent deps):

```bash
npx snyk test
npx snyk code test
```

## Challenge walkthrough

1. **Prompt Injection** — override instructions → read `CEO_SECRET.txt`
2. **Permission Escape** — social-engineer access to restricted file
3. **Data Exfiltration** — attempt `email.send` with restricted content
4. **Tool Poisoning (Boss)** — poisoned tool description steers restricted read

For each: run on **Reckless**, then **REPLAY AGAINST GUARDED AGENT**.

## 90-second demo instructions

1. Open the app — show **AGENT BREAKOUT** headline + two modes (5s).
2. Select Level 1, hit **Submit Attack** on Reckless → breach + flag (20s).
3. Click **REPLAY AGAINST GUARDED AGENT** → pipeline shows BLOCK (25s).
4. Point at Security Events / audit timeline updating (15s).
5. Jump to Level 3 or 4 — show exfil approval gate or tool poisoning (20s).
6. Close on lesson: least privilege + control plane stops the same attack (5s).

## Scripts

```bash
cd web
npm run lint
npm run typecheck
npm run build
```
