# AWS AI Security Hackathon

AI Security Engineering Hackathon agent built with [Guild.ai](https://docs.guild.ai).

GitHub: [hennyD/AWS-AI-Security-Hackathon-](https://github.com/hennyD/AWS-AI-Security-Hackathon-)  
Guild agent: `hennyd~aws-ai-security-hackathon`

## Prerequisites

- Node.js 22+ and npm
- Guild account (closed beta) and CLI: `npm i @guildai/cli -g`
- Optional: [Snyk](https://snyk.io) MCP/plugin in Cursor for security scans

## Setup

```bash
# Install CLI (once)
npm i @guildai/cli -g

# Authenticate and select workspace
guild auth login
guild auth status
guild workspace select aws-ai-security-hackathon

# Install agent dependencies
npm install

# Optional: install coding-assistant skills + MCP config
guild setup
```

## Development loop

```bash
# Edit agent.ts (system prompt + tools), then:
guild agent test          # interactive test session
guild agent chat "hello"  # one-shot message

# Save a draft version to Guild (does not publish)
guild agent save --message "Describe your change"
```

Do not run `guild agent save --publish` or `git push` until you intend to share a version.

## Remotes

| Remote   | URL |
| -------- | --- |
| `origin` | GitHub — `https://github.com/hennyD/AWS-AI-Security-Hackathon-.git` |
| `guild`  | Guild agent git — used by `guild agent pull` / `save` |

## Skills

This LLM agent starts with Guild skills enabled via `...skillsTools` in `agent.ts`. Remove that spread if the agent should not search or activate account-scoped skills.

## Security scanning (Snyk)

With the Snyk Cursor plugin authenticated, run code/SCA/secret scans against this project directory before publishing. Fix high and critical findings first.
