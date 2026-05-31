import type {
  GenerationRecord,
  GenerationResult,
  PreviewSchema,
  ProjectRecord,
  VisualEdit
} from "./types";

export function createProjectFromGeneration(
  prompt: string,
  result: GenerationResult
): ProjectRecord {
  const now = new Date().toISOString();
  const generation = createGenerationRecord(prompt, result, now);

  return {
    id: createId("project"),
    title: result.title,
    prompt,
    createdAt: now,
    updatedAt: now,
    currentGenerationId: generation.id,
    preview: result.preview,
    generations: [generation]
  };
}

export function upsertGeneration(
  project: ProjectRecord,
  prompt: string,
  result: GenerationResult
): ProjectRecord {
  const now = new Date().toISOString();
  const generation = createGenerationRecord(prompt, result, now);

  return {
    ...project,
    title: result.title,
    prompt,
    updatedAt: now,
    currentGenerationId: generation.id,
    preview: result.preview,
    generations: [...project.generations, generation]
  };
}

export function applyVisualEdit(
  project: ProjectRecord,
  edit: VisualEdit
): ProjectRecord {
  const preview: PreviewSchema = {
    ...project.preview,
    theme: {
      ...project.preview.theme,
      accent: edit.accent ?? project.preview.theme.accent
    },
    hero: {
      ...project.preview.hero,
      title: edit.title ?? project.preview.hero.title
    }
  };

  return {
    ...project,
    title: edit.title ?? project.title,
    preview,
    updatedAt: new Date().toISOString()
  };
}

function createGenerationRecord(
  prompt: string,
  result: GenerationResult,
  createdAt: string
): GenerationRecord {
  return {
    id: createId("generation"),
    prompt,
    createdAt,
    result
  };
}

function createId(prefix: string): string {
  const random = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${random}`;
}
