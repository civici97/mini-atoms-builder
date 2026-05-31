"use client";

import React, { useMemo, useState } from "react";
import {
  Bot,
  Check,
  Code2,
  Database,
  FileCode2,
  History,
  Loader2,
  Monitor,
  Paintbrush,
  Play,
  RefreshCcw,
  Save,
  Send,
  Smartphone,
  Sparkles
} from "lucide-react";

import {
  readProjectsFromStorage,
  saveProjectToStorage
} from "@/lib/client-persistence";
import {
  applyVisualEdit,
  createProjectFromGeneration,
  upsertGeneration
} from "@/lib/project-state";
import { createFallbackBuild } from "@/lib/templates";
import type {
  AgentStep,
  GeneratedFile,
  GenerateStreamEvent,
  GenerationResult,
  ProjectRecord
} from "@/lib/types";
import { PreviewPane } from "./PreviewPane";

const defaultPrompt =
  "做一个 AI 招聘进度看板：能跟踪候选人、面试阶段、风险提醒，并给 HR 一键生成下一步行动。";

const accentSwatches = ["#2563eb", "#0f766e", "#7c3aed", "#dc2626", "#c2410c"];

export function BuilderWorkspace() {
  const starterResult = useMemo(
    () => createFallbackBuild("Build an AI product operations console"),
    []
  );
  const starterProject = useMemo(
    () => createProjectFromGeneration(defaultPrompt, starterResult),
    [starterResult]
  );
  const initialProjects = useMemo(() => readInitialProjects(), []);
  const initialProject = initialProjects[0] ?? starterProject;
  const initialGeneration =
    getActiveGeneration(initialProject)?.result ?? starterResult;

  const [projects, setProjects] = useState<ProjectRecord[]>(initialProjects);
  const [currentProject, setCurrentProject] =
    useState<ProjectRecord>(initialProject);
  const [prompt, setPrompt] = useState(initialProject.prompt);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [agentSteps, setAgentSteps] = useState<AgentStep[]>(
    initialGeneration.agentSteps
  );
  const [files, setFiles] = useState<GeneratedFile[]>(initialGeneration.files);
  const [selectedPath, setSelectedPath] = useState(
    initialGeneration.files[0].path
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState("Ready");
  const [streamText, setStreamText] = useState("");
  const [editTitle, setEditTitle] = useState(initialProject.title);
  const [editAccent, setEditAccent] = useState(
    initialProject.preview.theme.accent
  );

  const currentFiles =
    currentProject.generations.find(
      (generation) => generation.id === currentProject.currentGenerationId
    )?.result.files ?? files;
  const selectedFile =
    currentFiles.find((file) => file.path === selectedPath) ?? currentFiles[0];

  async function handleGenerate(mode: "new" | "remix") {
    if (isGenerating) {
      return;
    }

    setIsGenerating(true);
    setStatus(mode === "new" ? "Generating" : "Remixing");
    setStreamText("");
    setAgentSteps([]);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          projectId: mode === "remix" ? currentProject.id : undefined,
          previousGenerationId:
            mode === "remix" ? currentProject.currentGenerationId : undefined,
          prompt
        })
      });

      if (!response.ok || !response.body) {
        throw new Error(`Generation request failed with ${response.status}`);
      }

      const result = await consumeGenerationStream(response.body);
      if (!result) {
        throw new Error("Generation ended without a result");
      }

      const nextProject =
        mode === "remix"
          ? upsertGeneration(currentProject, prompt, result)
          : createProjectFromGeneration(prompt, result);

      persistProject(nextProject);
      loadProject(nextProject);
      setStatus(result.warning ? "Fallback used" : "Generated");
    } catch (error) {
      const fallback = createFallbackBuild(prompt);
      const nextProject =
        mode === "remix"
          ? upsertGeneration(currentProject, prompt, {
              ...fallback,
              warning:
                error instanceof Error ? error.message : "Generation failed"
            })
          : createProjectFromGeneration(prompt, fallback);

      persistProject(nextProject);
      loadProject(nextProject);
      setStatus("Local fallback");
    } finally {
      setIsGenerating(false);
    }
  }

  function consumeGenerationStream(
    body: ReadableStream<Uint8Array>
  ): Promise<GenerationResult | null> {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let finalResult: GenerationResult | null = null;

    const read = async (): Promise<GenerationResult | null> => {
      const { done, value } = await reader.read();
      buffer += decoder.decode(value ?? new Uint8Array(), { stream: !done });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.trim()) {
          continue;
        }

        const event = JSON.parse(line) as GenerateStreamEvent;
        if (event.type === "agent") {
          setAgentSteps((steps) => upsertAgentStep(steps, event.step));
        }
        if (event.type === "delta") {
          setStreamText((text) => `${text}${event.content}`);
        }
        if (event.type === "result") {
          finalResult = event.result;
        }
        if (event.type === "error") {
          finalResult = event.fallback;
          setStatus(event.message);
        }
      }

      return done ? finalResult : read();
    };

    return read();
  }

  function persistProject(project: ProjectRecord) {
    const nextProjects = saveProjectToStorage(window.localStorage, project);
    setProjects(nextProjects);
    fetch(project.id ? `/api/projects/${project.id}` : "/api/projects", {
      method: project.id ? "PATCH" : "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ project })
    }).catch(() => undefined);
  }

  function loadProject(project: ProjectRecord) {
    const generation =
      project.generations.find(
        (item) => item.id === project.currentGenerationId
      ) ?? project.generations[project.generations.length - 1];

    setCurrentProject(project);
    setPrompt(project.prompt);
    setEditTitle(project.title);
    setEditAccent(project.preview.theme.accent);
    setAgentSteps(generation?.result.agentSteps ?? []);
    setFiles(generation?.result.files ?? []);
    setSelectedPath(generation?.result.files[0]?.path ?? "");
  }

  function saveVisualEdit() {
    const edited = applyVisualEdit(currentProject, {
      title: editTitle,
      accent: editAccent
    });
    persistProject(edited);
    loadProject(edited);
    setStatus("Saved");
  }

  return (
    <main className="min-h-screen">
      <header className="border-b border-[#d9e2ec] bg-white">
        <div className="flex min-h-16 items-center justify-between gap-4 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#111827] text-white">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-[#172033]">
                Mini Atoms Builder
              </h1>
              <p className="text-xs text-[#667085]">
                ModelScope Qwen / Supabase-ready
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <StatusPill label={status} busy={isGenerating} />
            <button
              type="button"
              title="Save project"
              onClick={saveVisualEdit}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-[#d9e2ec] bg-white px-3 text-sm font-semibold text-[#172033] hover:bg-[#f6f8fb]"
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              Save
            </button>
          </div>
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-65px)] grid-cols-1 gap-4 p-4 xl:grid-cols-[360px_minmax(520px,1fr)_360px]">
        <aside className="grid gap-4 xl:max-h-[calc(100vh-97px)] xl:overflow-auto">
          <Panel title="Prompt" icon={<Bot className="h-4 w-4" />}>
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              className="min-h-36 w-full resize-none rounded-lg border border-[#d9e2ec] bg-white p-3 text-sm leading-6 text-[#172033]"
              maxLength={4000}
            />
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleGenerate("new")}
                disabled={isGenerating}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#2563eb] px-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Send className="h-4 w-4" aria-hidden="true" />
                )}
                Generate
              </button>
              <button
                type="button"
                onClick={() => handleGenerate("remix")}
                disabled={isGenerating}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[#d9e2ec] bg-white px-3 text-sm font-semibold text-[#172033] disabled:opacity-60"
              >
                <RefreshCcw className="h-4 w-4" aria-hidden="true" />
                Remix
              </button>
            </div>
          </Panel>

          <Panel title="Agent Timeline" icon={<Sparkles className="h-4 w-4" />}>
            <ol className="space-y-3">
              {agentSteps.map((step) => (
                <li
                  key={step.id}
                  className="rounded-lg border border-[#d9e2ec] bg-white p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase text-[#2563eb]">
                        {step.role}
                      </p>
                      <h3 className="mt-1 text-sm font-semibold text-[#172033]">
                        {step.title}
                      </h3>
                    </div>
                    <span className="rounded-md bg-[#eef6ff] px-2 py-1 text-xs font-medium text-[#1d4ed8]">
                      {step.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#667085]">
                    {step.summary}
                  </p>
                </li>
              ))}
            </ol>
            {streamText ? (
              <pre className="mt-3 max-h-40 overflow-auto rounded-lg bg-[#111827] p-3 text-xs leading-5 text-white">
                {streamText}
              </pre>
            ) : null}
          </Panel>

          <Panel title="Projects" icon={<History className="h-4 w-4" />}>
            <div className="space-y-2">
              {projects.length === 0 ? (
                <p className="text-sm text-[#667085]">No saved projects yet.</p>
              ) : null}
              {projects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => loadProject(project)}
                  className="w-full rounded-lg border border-[#d9e2ec] bg-white p-3 text-left hover:bg-[#f6f8fb]"
                >
                  <span className="block text-sm font-semibold text-[#172033]">
                    {project.title}
                  </span>
                  <span className="mt-1 block text-xs text-[#667085]">
                    {project.generations.length} versions
                  </span>
                </button>
              ))}
            </div>
          </Panel>
        </aside>

        <section className="grid min-h-[720px] gap-4">
          <div className="flex items-center justify-between gap-3 rounded-lg border border-[#d9e2ec] bg-white p-3">
            <div className="flex items-center gap-2">
              <Play className="h-4 w-4 text-[#0f766e]" aria-hidden="true" />
              <h2 className="text-sm font-semibold text-[#172033]">
                Live Preview
              </h2>
            </div>
            <div className="flex rounded-md border border-[#d9e2ec] bg-[#f6f8fb] p-1">
              <DeviceButton
                active={device === "desktop"}
                label="Desktop"
                onClick={() => setDevice("desktop")}
                icon={<Monitor className="h-4 w-4" />}
              />
              <DeviceButton
                active={device === "mobile"}
                label="Mobile"
                onClick={() => setDevice("mobile")}
                icon={<Smartphone className="h-4 w-4" />}
              />
            </div>
          </div>
          <PreviewPane preview={currentProject.preview} device={device} />
        </section>

        <aside className="grid gap-4 xl:max-h-[calc(100vh-97px)] xl:overflow-auto">
          <Panel title="Visual Edit" icon={<Paintbrush className="h-4 w-4" />}>
            <label className="text-xs font-semibold uppercase text-[#667085]">
              Title
            </label>
            <input
              value={editTitle}
              onChange={(event) => setEditTitle(event.target.value)}
              className="mt-2 h-10 w-full rounded-md border border-[#d9e2ec] px-3 text-sm"
            />
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase text-[#667085]">
                Accent
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {accentSwatches.map((color) => (
                  <button
                    key={color}
                    type="button"
                    title={color}
                    onClick={() => setEditAccent(color)}
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-[#d9e2ec]"
                    style={{ background: color }}
                  >
                    {editAccent === color ? (
                      <Check className="h-4 w-4 text-white" aria-hidden="true" />
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={saveVisualEdit}
              className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#0f766e] px-3 text-sm font-semibold text-white"
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              Apply edit
            </button>
          </Panel>

          <Panel title="Generated Files" icon={<FileCode2 className="h-4 w-4" />}>
            <div className="grid gap-2">
              {currentFiles.map((file) => (
                <button
                  key={file.path}
                  type="button"
                  onClick={() => setSelectedPath(file.path)}
                  className={[
                    "flex items-center gap-2 rounded-md border px-3 py-2 text-left text-sm",
                    selectedFile?.path === file.path
                      ? "border-[#2563eb] bg-[#eef6ff] text-[#1d4ed8]"
                      : "border-[#d9e2ec] bg-white text-[#172033]"
                  ].join(" ")}
                >
                  <Code2 className="h-4 w-4" aria-hidden="true" />
                  <span className="truncate">{file.path}</span>
                </button>
              ))}
            </div>
            {selectedFile ? (
              <pre className="mt-3 max-h-80 overflow-auto rounded-lg bg-[#111827] p-3 text-xs leading-5 text-white">
                {selectedFile.content}
              </pre>
            ) : null}
          </Panel>

          <Panel title="Project Data" icon={<Database className="h-4 w-4" />}>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <DataPoint label="Versions" value={`${currentProject.generations.length}`} />
              <DataPoint label="Files" value={`${currentFiles.length}`} />
              <DataPoint label="Source" value={currentProject.generations.at(-1)?.result.source ?? "local"} />
              <DataPoint label="Updated" value={formatTime(currentProject.updatedAt)} />
            </dl>
            {currentProject.generations.at(-1)?.result.warning ? (
              <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
                {currentProject.generations.at(-1)?.result.warning}
              </p>
            ) : null}
          </Panel>
        </aside>
      </div>
    </main>
  );
}

function upsertAgentStep(steps: AgentStep[], step: AgentStep): AgentStep[] {
  const exists = steps.some((item) => item.id === step.id);
  return exists
    ? steps.map((item) => (item.id === step.id ? step : item))
    : [...steps, step];
}

function readInitialProjects(): ProjectRecord[] {
  if (typeof window === "undefined") {
    return [];
  }

  return readProjectsFromStorage(window.localStorage);
}

function getActiveGeneration(project: ProjectRecord) {
  return (
    project.generations.find(
      (generation) => generation.id === project.currentGenerationId
    ) ?? project.generations[project.generations.length - 1]
  );
}

function StatusPill({ label, busy }: { label: string; busy: boolean }) {
  return (
    <span className="inline-flex h-10 items-center gap-2 rounded-md border border-[#d9e2ec] bg-[#f6f8fb] px-3 text-sm font-semibold text-[#172033]">
      {busy ? (
        <Loader2 className="h-4 w-4 animate-spin text-[#2563eb]" aria-hidden="true" />
      ) : (
        <span className="h-2 w-2 rounded-full bg-[#0f766e]" />
      )}
      {label}
    </span>
  );
}

function Panel({
  title,
  icon,
  children
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-[#d9e2ec] bg-white p-4 shadow-panel">
      <div className="mb-3 flex items-center gap-2 text-[#172033]">
        {icon}
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function DeviceButton({
  active,
  label,
  icon,
  onClick
}: {
  active: boolean;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      className={[
        "inline-flex h-9 items-center gap-2 rounded px-3 text-sm font-semibold",
        active ? "bg-white text-[#172033] shadow-sm" : "text-[#667085]"
      ].join(" ")}
    >
      {icon}
      {label}
    </button>
  );
}

function DataPoint({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#d9e2ec] bg-[#f6f8fb] p-3">
      <dt className="text-xs font-medium text-[#667085]">{label}</dt>
      <dd className="mt-1 truncate text-sm font-semibold text-[#172033]">
        {value}
      </dd>
    </div>
  );
}

function formatTime(value: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}
