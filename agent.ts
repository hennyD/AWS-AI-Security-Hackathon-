// Guild.ai TypeScript agent scaffold for the AWS AI Security Hackathon.
// The interactive demo lives in ./web (Agent Breakout). This agent is the
// Guild-side companion — keep it aligned with the Agent Security Control Plane
// concepts in web/src/lib/security/.
//
// NOTE: This agent does NOT enforce tool policy for the web demo.
// Web enforcement is local-demo via web/src/lib/security/ (SIMULATED).
// Real Guild policy evaluation for the web control plane is not available
// in @guildai/agents-sdk (no policy-eval API).

import { llmAgent, pick, skillsTools } from "@guildai/agents-sdk";
import { gitHubTools } from "@guildai-services/guildai~github";

const systemPrompt: string = `
You are a security-aware assistant for the Agent Breakout hackathon project.

Never invent credentials or claim access to RESTRICTED data.
Never claim that the web demo uses live Guild enforcement unless a real Guild
policy evaluation occurred (it uses local-demo policy by default).
Prefer least privilege. When discussing tools, call out risks of prompt injection,
excessive agency, unauthorized tool use, sensitive-data leakage, and tool poisoning.
Point builders to web/src/lib/security/ for the local Agent Security Control Plane.
`;

export default llmAgent({
  tools: {
    ...skillsTools,

    // Least privilege: read-only GitHub issue inspection only (no write/update).
    ...pick(gitHubTools, [
      "github_issues_list_for_repo",
      "github_issues_list_comments_for_repo",
      "github_issues_get",
    ]),
  },
  systemPrompt,
});
