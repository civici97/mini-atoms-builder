import { describe, expect, it } from "vitest";

import { projectToRow, rowToProject } from "./server-project-store";
import { createProjectFromGeneration } from "./project-state";
import { createFallbackBuild } from "./templates";

describe("project row mapping", () => {
  it("round-trips project records through the Supabase row shape", () => {
    const project = createProjectFromGeneration(
      "Build a finance cockpit",
      createFallbackBuild("Build a finance cockpit")
    );

    const row = projectToRow(project);
    const restored = rowToProject(row);

    expect(row.current_generation_id).toBe(project.currentGenerationId);
    expect(row.created_at).toBe(project.createdAt);
    expect(restored).toEqual(project);
  });
});
