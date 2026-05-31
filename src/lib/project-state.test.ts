import { describe, expect, it } from "vitest";

import {
  applyVisualEdit,
  createProjectFromGeneration,
  upsertGeneration
} from "./project-state";
import type { GenerationResult, ProjectRecord } from "./types";

const generation: GenerationResult = {
  title: "Learning OS",
  agentSteps: [
    {
      id: "pm",
      role: "PM",
      title: "Map users",
      summary: "Identify learners and mentors.",
      status: "done"
    }
  ],
  files: [
    {
      path: "app/page.tsx",
      language: "tsx",
      content: "export default function Page() { return null }"
    }
  ],
  preview: {
    theme: {
      accent: "#0f766e",
      surface: "#ffffff",
      ink: "#101828"
    },
    hero: {
      kicker: "Learning",
      title: "Learning OS",
      subtitle: "Plan study work"
    },
    stats: [{ label: "Courses", value: "8", tone: "green" }],
    sections: [{ title: "Plan", body: "Organize weekly work." }],
    actions: [{ label: "Start plan", kind: "primary" }]
  }
};

describe("createProjectFromGeneration", () => {
  it("creates a project with one current generation and persisted prompt", () => {
    const project = createProjectFromGeneration("Build a learning app", generation);

    expect(project.title).toBe("Learning OS");
    expect(project.prompt).toBe("Build a learning app");
    expect(project.currentGenerationId).toBe(project.generations[0].id);
    expect(project.generations[0].result.preview.hero.title).toBe("Learning OS");
  });
});

describe("upsertGeneration", () => {
  it("adds a new generation and makes it current without losing history", () => {
    const project = createProjectFromGeneration("Build a learning app", generation);
    const next = upsertGeneration(project, "Make it mobile first", {
      ...generation,
      title: "Mobile Learning OS"
    });

    expect(next.generations).toHaveLength(2);
    expect(next.currentGenerationId).toBe(next.generations[1].id);
    expect(next.generations[0].result.title).toBe("Learning OS");
    expect(next.generations[1].prompt).toBe("Make it mobile first");
  });
});

describe("applyVisualEdit", () => {
  it("updates preview title and accent while preserving generations", () => {
    const project: ProjectRecord = createProjectFromGeneration(
      "Build a learning app",
      generation
    );
    const edited = applyVisualEdit(project, {
      title: "Mentor Hub",
      accent: "#7c3aed"
    });

    expect(edited.title).toBe("Mentor Hub");
    expect(edited.preview.hero.title).toBe("Mentor Hub");
    expect(edited.preview.theme.accent).toBe("#7c3aed");
    expect(edited.generations).toHaveLength(1);
  });
});
