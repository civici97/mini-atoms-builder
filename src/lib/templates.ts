import type {
  AgentStep,
  GeneratedFile,
  GenerationResult,
  PreviewSchema
} from "./types";

const fallbackTheme = {
  accent: "#2563eb",
  surface: "#f8fafc",
  ink: "#101828"
};

export function createFallbackBuild(rawPrompt: string): GenerationResult {
  const prompt = rawPrompt.trim();
  const title = createProjectTitle(prompt);
  const domain = title === "AI 产品工作台" ? "产品团队" : title;

  const agentSteps: AgentStep[] = [
    {
      id: "pm",
      role: "PM",
      title: "梳理用户路径",
      summary: `把需求整理成面向「${domain}」的核心工作流。`,
      status: "done",
      detail: "MVP 保留一个主流程、可见进度和清晰的下一步行动。"
    },
    {
      id: "architect",
      role: "Architect",
      title: "确定轻量架构",
      summary: "选择单页应用、持久化项目记录和可编辑预览 Schema。",
      status: "done",
      detail: "生成结果拆分数据、视图区块和操作，方便后续继续迭代。"
    },
    {
      id: "engineer",
      role: "Engineer",
      title: "生成交互界面",
      summary: "生成响应式 TSX、结构化样式和可点击操作。",
      status: "done",
      detail: "界面包含标题区、指标、流程区块和两个用户操作。"
    },
    {
      id: "qa",
      role: "QA",
      title: "检查交付质量",
      summary: "检查真实交互、保存能力和本地兜底是否可用。",
      status: "done",
      detail: "结果保持足够紧凑，便于快速检查、测试和部署。"
    }
  ];

  const preview: PreviewSchema = {
    theme: fallbackTheme,
    hero: {
      kicker: "Mini Atoms 生成",
      title,
      subtitle: prompt
        ? `围绕「${prompt}」生成的可交互产品原型。`
        : "描述一个应用想法，生成可运行的产品蓝图。"
    },
    stats: [
      { label: "智能体", value: "4", tone: "blue" },
      { label: "生成文件", value: "5", tone: "green" },
      { label: "可用流程", value: "2", tone: "violet" }
    ],
    sections: [
      {
        title: "核心流程",
        body: `引导「${domain}」用户从需求进入明确的下一步，流程保持低摩擦、可追踪。`
      },
      {
        title: "持久化工作区",
        body: "保存需求、生成文件、智能体记录和视觉编辑，刷新后仍能恢复上下文。"
      },
      {
        title: "继续迭代",
        body: "把每次修改要求作为新版本生成，同时保留历史版本用于对比。"
      }
    ],
    actions: [
      { label: "开始流程", kind: "primary" },
      { label: "保存版本", kind: "secondary" }
    ]
  };

  const files: GeneratedFile[] = [
    {
      path: "app/page.tsx",
      language: "tsx",
      content: createPageSource(title)
    },
    {
      path: "app/actions.ts",
      language: "ts",
      content:
        "export async function saveProject(input: unknown) {\n  return { ok: true, savedAt: new Date().toISOString(), input };\n}\n"
    },
    {
      path: "lib/preview-schema.ts",
      language: "ts",
      content: `export const preview = ${JSON.stringify(preview, null, 2)};\n`
    },
    {
      path: "README.md",
      language: "md",
      content: `# ${title}\n\n生成来源：${prompt || "空白启动需求"}\n\n运行流程、保存版本，并继续迭代产品想法。\n`
    },
    {
      path: "package.json",
      language: "json",
      content: JSON.stringify(
        {
          scripts: {
            dev: "next dev",
            build: "next build"
          },
          dependencies: {
            next: "16.x",
            react: "19.x",
            "react-dom": "19.x"
          }
        },
        null,
        2
      )
    }
  ];

  return {
    title,
    agentSteps,
    files,
    preview,
    source: "fallback"
  };
}

export function extractGenerationResult(text: string): GenerationResult {
  const json = extractJson(text);

  try {
    const parsed = JSON.parse(json) as Partial<GenerationResult>;
    assertGenerationResult(parsed);

    return {
      ...parsed,
      source: "modelscope"
    };
  } catch (error) {
    throw new Error(
      "Model response did not include a valid generation result",
      error instanceof Error ? { cause: error } : undefined
    );
  }
}

function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start >= 0 && end > start) {
    return text.slice(start, end + 1);
  }

  return text;
}

function assertGenerationResult(
  value: Partial<GenerationResult>
): asserts value is GenerationResult {
  if (
    typeof value.title !== "string" ||
    !Array.isArray(value.agentSteps) ||
    !Array.isArray(value.files) ||
    !value.preview ||
    typeof value.preview.hero?.title !== "string" ||
    !Array.isArray(value.preview.sections) ||
    !Array.isArray(value.preview.actions)
  ) {
    throw new Error("Invalid generation result shape");
  }
}

function createProjectTitle(prompt: string): string {
  if (!prompt) {
    return "AI 产品工作台";
  }

  const compact = prompt
    .replace(/[，。,.!！?？]/g, " ")
    .replace(/^(请|帮我|给|为|做|创建|生成|实现)\s*/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const chineseMatch = compact.match(/[\u4e00-\u9fa5A-Za-z0-9\s-]{2,24}/);
  return (chineseMatch?.[0] || compact || "AI 产品工作台").slice(0, 24);
}

function createPageSource(title: string): string {
  return `export default function Page() {
  return (
    <main>
      <h1>${escapeForTemplate(title)}</h1>
      <button type="button">开始流程</button>
    </main>
  );
}
`;
}

function escapeForTemplate(value: string): string {
  return value.replace(/[{}<>]/g, "");
}
