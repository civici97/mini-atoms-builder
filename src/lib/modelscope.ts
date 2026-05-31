import type { GenerateStreamEvent } from "./types";

export type ModelScopeSettings = {
  apiKey?: string;
  baseURL: string;
  model: string;
  configured: boolean;
};

export type ChatMessage = {
  role: "system" | "user";
  content: string;
};

const defaultBaseURL = "https://api-inference.modelscope.cn/v1";
const defaultModel = "Qwen/Qwen2.5-Coder-32B-Instruct";

export function readModelScopeSettings(
  env: Partial<Record<string, string | undefined>> = process.env
): ModelScopeSettings {
  const apiKey = env.MODELSCOPE_SDK_TOKEN?.trim();
  const baseURL = trimTrailingSlash(
    env.MODELSCOPE_BASE_URL?.trim() || defaultBaseURL
  );
  const model = env.MODELSCOPE_MODEL?.trim() || defaultModel;

  return {
    apiKey,
    baseURL,
    model,
    configured: Boolean(apiKey)
  };
}

export function buildGenerationMessages(prompt: string): ChatMessage[] {
  return [
    {
      role: "system",
      content: [
        "You are an AI native full-stack product builder.",
        "All user-facing copy in title, agentSteps, files, preview, stats, sections, and actions must be concise Simplified Chinese 中文.",
        "Return only valid JSON. Do not wrap the JSON in markdown.",
        "The JSON must match this shape:",
        "{ title: string, agentSteps: AgentStep[], files: GeneratedFile[], preview: PreviewSchema }.",
        "AgentStep roles must be PM, Architect, Engineer, QA.",
        "Generated files should be concise but realistic for a Next.js prototype.",
        "PreviewSchema must include theme, hero, stats, sections, and actions."
      ].join(" ")
    },
    {
      role: "user",
      content: [
        `Product idea: ${prompt}`,
        "Create a usable, interactive web app blueprint with a Chinese product interface.",
        "Include exactly four completed agentSteps: PM, Architect, Engineer, QA.",
        "Include at least five generated files, including app/page.tsx and README.md.",
        "Use preview.theme.accent as a hex color, and make preview.actions include one primary and one secondary action.",
        "Return JSON keys: title, agentSteps, files, preview."
      ].join("\n")
    }
  ];
}

export function serializeStreamEvent(event: GenerateStreamEvent): string {
  return `${JSON.stringify(event)}\n`;
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}
