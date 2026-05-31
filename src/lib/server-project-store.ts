import { createClient } from "@supabase/supabase-js";

import type { ProjectRecord } from "./types";

export type ProjectRow = {
  id: string;
  title: string;
  prompt: string;
  preview: ProjectRecord["preview"];
  generations: ProjectRecord["generations"];
  current_generation_id: string;
  created_at: string;
  updated_at: string;
};

const tableName = "projects";
const memoryProjects = new Map<string, ProjectRecord>();

export function projectToRow(project: ProjectRecord): ProjectRow {
  return {
    id: project.id,
    title: project.title,
    prompt: project.prompt,
    preview: project.preview,
    generations: project.generations,
    current_generation_id: project.currentGenerationId,
    created_at: project.createdAt,
    updated_at: project.updatedAt
  };
}

export function rowToProject(row: ProjectRow): ProjectRecord {
  return {
    id: row.id,
    title: row.title,
    prompt: row.prompt,
    preview: row.preview,
    generations: row.generations,
    currentGenerationId: row.current_generation_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function listServerProjects(): Promise<ProjectRecord[]> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return Array.from(memoryProjects.values()).sort(sortNewestFirst);
  }

  const { data, error } = await supabase
    .from(tableName)
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data as ProjectRow[]).map(rowToProject);
}

export async function getServerProject(
  id: string
): Promise<ProjectRecord | null> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return memoryProjects.get(id) ?? null;
  }

  const { data, error } = await supabase
    .from(tableName)
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(error.message);
  }

  return rowToProject(data as ProjectRow);
}

export async function saveServerProject(
  project: ProjectRecord
): Promise<ProjectRecord> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    memoryProjects.set(project.id, project);
    return project;
  }

  const { data, error } = await supabase
    .from(tableName)
    .upsert(projectToRow(project))
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return rowToProject(data as ProjectRow);
}

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  return createClient(url, key, {
    auth: {
      persistSession: false
    }
  });
}

function sortNewestFirst(a: ProjectRecord, b: ProjectRecord): number {
  return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
}
