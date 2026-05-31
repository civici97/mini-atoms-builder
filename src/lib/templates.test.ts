import { describe, expect, it } from "vitest";

import { createFallbackBuild, extractGenerationResult } from "./templates";

describe("createFallbackBuild", () => {
  it("creates a usable app blueprint with four agent steps and generated files", () => {
    const result = createFallbackBuild("给咖啡店做一个会员积分小程序");

    expect(result.title).toContain("咖啡店");
    expect(result.agentSteps.map((step) => step.role)).toEqual([
      "PM",
      "Architect",
      "Engineer",
      "QA"
    ]);
    expect(result.files.map((file) => file.path)).toContain("app/page.tsx");
    expect(result.preview.sections.length).toBeGreaterThanOrEqual(3);
    expect(result.preview.actions.length).toBeGreaterThanOrEqual(2);
  });

  it("normalizes empty prompts into a stable starter project", () => {
    const result = createFallbackBuild("   ");

    expect(result.title).toBe("AI 产品工作台");
    expect(result.preview.hero.kicker).toBe("Mini Atoms 生成");
    expect(result.files.length).toBeGreaterThan(2);
  });
});

describe("extractGenerationResult", () => {
  it("extracts strict JSON from a fenced model response", () => {
    const parsed = extractGenerationResult(`
      Here is the build:
      \`\`\`json
      {
        "title": "Ops Console",
        "agentSteps": [
          {"id":"pm","role":"PM","title":"Scope","summary":"Define the workflow.","status":"done"}
        ],
        "files": [
          {"path":"app/page.tsx","language":"tsx","content":"export default function Page() { return null }"}
        ],
        "preview": {
          "theme": {"accent":"#2563eb","surface":"#ffffff","ink":"#101828"},
          "hero": {"kicker":"运营","title":"Ops Console","subtitle":"Run the work"},
          "stats": [{"label":"任务","value":"24","tone":"blue"}],
          "sections": [{"title":"队列","body":"Prioritize incoming work."}],
          "actions": [{"label":"创建任务","kind":"primary"}]
        }
      }
      \`\`\`
    `);

    expect(parsed.title).toBe("Ops Console");
    expect(parsed.files[0].path).toBe("app/page.tsx");
    expect(parsed.preview.hero.title).toBe("Ops Console");
  });

  it("throws a readable error when the model response does not contain a valid result", () => {
    expect(() => extractGenerationResult("not json")).toThrow(
      "Model response did not include a valid generation result"
    );
  });
});
