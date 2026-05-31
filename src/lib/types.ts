export type AgentRole = "PM" | "Architect" | "Engineer" | "QA";

export type AgentStep = {
  id: string;
  role: AgentRole;
  title: string;
  summary: string;
  status: "queued" | "running" | "done" | "error";
  detail?: string;
};

export type GeneratedFile = {
  path: string;
  language: string;
  content: string;
};

export type PreviewSchema = {
  theme: {
    accent: string;
    surface: string;
    ink: string;
  };
  hero: {
    kicker: string;
    title: string;
    subtitle: string;
  };
  stats: Array<{
    label: string;
    value: string;
    tone: string;
  }>;
  sections: Array<{
    title: string;
    body: string;
  }>;
  actions: Array<{
    label: string;
    kind: "primary" | "secondary";
  }>;
};

export type GenerationResult = {
  title: string;
  agentSteps: AgentStep[];
  files: GeneratedFile[];
  preview: PreviewSchema;
  source?: "modelscope" | "fallback";
  warning?: string;
};

export type GenerationRecord = {
  id: string;
  prompt: string;
  createdAt: string;
  result: GenerationResult;
};

export type ProjectRecord = {
  id: string;
  title: string;
  prompt: string;
  createdAt: string;
  updatedAt: string;
  currentGenerationId: string;
  preview: PreviewSchema;
  generations: GenerationRecord[];
};

export type VisualEdit = {
  title?: string;
  accent?: string;
};

export type GenerateRequest = {
  projectId?: string;
  prompt?: string;
  previousGenerationId?: string;
};

export type GenerateStreamEvent =
  | {
      type: "agent";
      step: AgentStep;
    }
  | {
      type: "delta";
      role: AgentRole;
      content: string;
    }
  | {
      type: "result";
      result: GenerationResult;
    }
  | {
      type: "error";
      message: string;
      fallback: GenerationResult;
    };
