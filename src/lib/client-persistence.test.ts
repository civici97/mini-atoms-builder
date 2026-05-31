import { beforeEach, describe, expect, it } from "vitest";

import {
  readProjectsFromStorage,
  saveProjectToStorage,
  writeProjectsToStorage
} from "./client-persistence";
import { createProjectFromGeneration } from "./project-state";
import { createFallbackBuild } from "./templates";

describe("client persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("writes and reads project records from localStorage", () => {
    const project = createProjectFromGeneration(
      "Build an ops dashboard",
      createFallbackBuild("Build an ops dashboard")
    );

    writeProjectsToStorage(localStorage, [project]);

    expect(readProjectsFromStorage(localStorage)).toEqual([project]);
  });

  it("upserts a project and keeps the newest project first", () => {
    const first = createProjectFromGeneration("First app", createFallbackBuild("First app"));
    const second = {
      ...createProjectFromGeneration("Second app", createFallbackBuild("Second app")),
      updatedAt: "2099-01-01T00:00:00.000Z"
    };

    saveProjectToStorage(localStorage, first);
    saveProjectToStorage(localStorage, second);
    saveProjectToStorage(localStorage, { ...first, title: "First app edited" });

    const projects = readProjectsFromStorage(localStorage);
    expect(projects).toHaveLength(2);
    expect(projects[0].id).toBe(second.id);
    expect(projects[1].title).toBe("First app edited");
  });

  it("returns an empty list when stored data is corrupt", () => {
    localStorage.setItem("mini-atoms-projects", "{bad json");

    expect(readProjectsFromStorage(localStorage)).toEqual([]);
  });
});
