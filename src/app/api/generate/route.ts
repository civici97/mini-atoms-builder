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
      { error: "Prompt is too long. Keep it under 4000 characters." },
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
  const normalizedPrompt = prompt || "Create a compact AI product workspace";

  sendAgent(send, {
    id: "pm",
    role: "PM",
    title: "Understand the product intent",
    summary: "Extracting the core user, workflow, and success criteria.",
    status: "running"
  });

  if (!settings.configured) {
    const fallback = withWarning(
      createFallbackBuild(prompt),
      "MODELSCOPE_SDK_TOKEN is not configured, so Mini Atoms used a local fallback generator."
    );
    send({ type: "result", result: fallback });
    return;
  }

  sendAgent(send, {
    id: "architect",
    role: "Architect",
    title: "Plan the generated app structure",
    summary: "Asking Qwen Coder for files, preview schema, and delivery notes.",
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
      title: "Generate the prototype",
      summary: "Streaming implementation details from ModelScope.",
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
      title: "Validate generated JSON",
      summary: "Checking the model output and preparing the visual preview.",
      status: "running"
    });

    const result = extractGenerationResult(raw);
    send({ type: "result", result });
  } catch (error) {
    const fallback = withWarning(
      createFallbackBuild(prompt),
      `ModelScope generation failed: ${error instanceof Error ? error.message : "unknown error"}`
    );
    send({
      type: "error",
      message: fallback.warning ?? "ModelScope generation failed.",
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
