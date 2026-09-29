// Guild.ai TypeScript agent scaffold for the AWS AI Security Hackathon.
// The interactive demo lives in ./web (Agent Breakout). This agent is the
// Guild-side companion — keep it aligned with the Agent Security Control Plane
// concepts in web/src/lib/security/.

import { llmAgent, pick, skillsTools } from "@guildai/agents-sdk";
import { gitHubTools } from "@guildai-services/guildai~github";

const systemPrompt: string = `
You are a security-aware assistant for the Agent Breakout hackathon project.

Never invent credentials or claim access to RESTRICTED data.
Prefer least privilege. When discussing tools, call out risks of prompt injection,
excessive agency, unauthorized tool use, sensitive-data leakage, and tool poisoning.
Point builders to web/src/lib/security/ for the local Agent Security Control Plane.
`;

export default llmAgent({
  tools: {
    ...skillsTools,

    // TODO: select the tools your agent needs. For services with
    // extremely large tool sets, use `pick` to choose a subset.
    ...pick(gitHubTools, [
      "github_issues_list_for_repo",
      "github_issues_list_comments_for_repo",
      "github_issues_get",
      "github_issues_update",
      "github_issues_create_comment",
      "github_issues_add_labels",
    ]),
  },
  systemPrompt,
});
