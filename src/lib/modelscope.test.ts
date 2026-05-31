import { describe, expect, it } from "vitest";

import {
  buildGenerationMessages,
  readModelScopeSettings,
  serializeStreamEvent
} from "./modelscope";

describe("readModelScopeSettings", () => {
  it("uses safe defaults and reports when the token is missing", () => {
    const settings = readModelScopeSettings({});

    expect(settings.configured).toBe(false);
    expect(settings.baseURL).toBe("https://api-inference.modelscope.cn/v1");
    expect(settings.model).toBe("Qwen/Qwen2.5-Coder-32B-Instruct");
  });

  it("trims configured values without exposing the token", () => {
    const settings = readModelScopeSettings({
      MODELSCOPE_SDK_TOKEN: "  ms-secret  ",
      MODELSCOPE_BASE_URL: " https://example.test/v1/ ",
      MODELSCOPE_MODEL: " Custom/Model "
    });

    expect(settings.configured).toBe(true);
    expect(settings.apiKey).toBe("ms-secret");
    expect(settings.baseURL).toBe("https://example.test/v1");
    expect(settings.model).toBe("Custom/Model");
  });
});

describe("buildGenerationMessages", () => {
  it("asks the model for strict JSON matching the app blueprint shape", () => {
    const messages = buildGenerationMessages("做一个 AI 招聘看板");

    expect(messages[0].role).toBe("system");
    expect(messages[0].content).toContain("Return only valid JSON");
    expect(messages[0].content).toContain("中文");
    expect(messages[1].content).toContain("做一个 AI 招聘看板");
    expect(messages[1].content).toContain("agentSteps");
    expect(messages[1].content).toContain("preview");
  });
});

describe("serializeStreamEvent", () => {
  it("serializes one newline-delimited JSON event", () => {
    const line = serializeStreamEvent({
      type: "delta",
      role: "Engineer",
      content: "Generating files"
    });

    expect(line.endsWith("\n")).toBe(true);
    expect(JSON.parse(line)).toEqual({
      type: "delta",
      role: "Engineer",
      content: "Generating files"
    });
  });
});
