import type { ProjectRecord } from "./types";

export const projectStorageKey = "mini-atoms-projects";

export function readProjectsFromStorage(storage: Storage): ProjectRecord[] {
  const raw = storage.getItem(projectStorageKey);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isProjectRecord).sort(sortNewestFirst);
  } catch {
    return [];
  }
}

export function writeProjectsToStorage(
  storage: Storage,
  projects: ProjectRecord[]
): void {
  storage.setItem(projectStorageKey, JSON.stringify(projects.sort(sortNewestFirst)));
}

export function saveProjectToStorage(
  storage: Storage,
  project: ProjectRecord
): ProjectRecord[] {
  const projects = readProjectsFromStorage(storage);
  const next = [
    project,
    ...projects.filter((existing) => existing.id !== project.id)
  ].sort(sortNewestFirst);

  writeProjectsToStorage(storage, next);
  return next;
}

function sortNewestFirst(a: ProjectRecord, b: ProjectRecord): number {
  return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
}

function isProjectRecord(value: unknown): value is ProjectRecord {
  const project = value as Partial<ProjectRecord>;
  return Boolean(
    project &&
      typeof project.id === "string" &&
      typeof project.title === "string" &&
      typeof project.prompt === "string" &&
      typeof project.currentGenerationId === "string" &&
      Array.isArray(project.generations) &&
      project.preview
  );
}
