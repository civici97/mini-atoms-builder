import OpenAI from "openai";

import {
  buildGenerationMessages,
  readModelScopeSettings,
  serializeStreamEvent
} from "@/lib/modelscope";
import { createFallbackBuild, extractGenerationResult } from "@/lib/templates";
import type { AgentStep, GenerateRequest, GenerationResult } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const encoder = new TextEncoder();

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as GenerateRequest;
  const prompt = body.prompt?.trim() || "";

  if (prompt.length > 4000) {
    return Response.json(
      { error: "需求太长，请控制在 4000 个字符以内。" },
      { status: 400 }
    );
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: Parameters<typeof serializeStreamEvent>[0]) => {
        controller.enqueue(encoder.encode(serializeStreamEvent(event)));
      };

      try {
        await streamGeneration(prompt, send);
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

async function streamGeneration(
  prompt: string,
  send: (event: Parameters<typeof serializeStreamEvent>[0]) => void
) {
  const settings = readModelScopeSettings();
  const normalizedPrompt = prompt || "创建一个紧凑的 AI 产品工作台";

  sendAgent(send, {
    id: "pm",
    role: "PM",
    title: "理解产品意图",
    summary: "提取核心用户、关键流程和成功标准。",
    status: "running"
  });

  if (!settings.configured) {
    const fallback = withWarning(
      createFallbackBuild(prompt),
      "未配置 MODELSCOPE_SDK_TOKEN，Mini Atoms 已使用本地模板生成。"
    );
    send({ type: "result", result: fallback });
    return;
  }

  sendAgent(send, {
    id: "architect",
    role: "Architect",
    title: "规划应用结构",
    summary: "请求 Qwen Coder 生成文件、预览 Schema 和交付说明。",
    status: "running"
  });

  let raw = "";

  try {
    const client = new OpenAI({
      apiKey: settings.apiKey,
      baseURL: settings.baseURL
    });

    const completion = await client.chat.completions.create({
      model: settings.model,
      messages: buildGenerationMessages(normalizedPrompt),
      temperature: 0.35,
      max_tokens: 2400,
      stream: true
    });

    sendAgent(send, {
      id: "engineer",
      role: "Engineer",
      title: "生成应用原型",
      summary: "正在从魔搭流式接收实现细节。",
      status: "running"
    });

    for await (const chunk of completion) {
      const content = chunk.choices[0]?.delta?.content ?? "";
      if (!content) {
        continue;
      }

      raw += content;
      send({ type: "delta", role: "Engineer", content });
    }

    sendAgent(send, {
      id: "qa",
      role: "QA",
      title: "校验生成结果",
      summary: "检查模型输出并准备可视化预览。",
      status: "running"
    });

    const result = extractGenerationResult(raw);
    send({ type: "result", result });
  } catch (error) {
    const fallback = withWarning(
      createFallbackBuild(prompt),
      `魔搭生成失败：${error instanceof Error ? error.message : "未知错误"}`
    );
    send({
      type: "error",
      message: fallback.warning ?? "魔搭生成失败。",
      fallback
    });
  }
}

function sendAgent(
  send: (event: Parameters<typeof serializeStreamEvent>[0]) => void,
  step: AgentStep
) {
  send({ type: "agent", step });
}

function withWarning(result: GenerationResult, warning: string): GenerationResult {
  return {
    ...result,
    warning,
    source: result.source ?? "fallback"
  };
}
