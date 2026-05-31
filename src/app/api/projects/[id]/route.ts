import {
  getServerProject,
  saveServerProject
} from "@/lib/server-project-store";
import { applyVisualEdit } from "@/lib/project-state";
import type { ProjectRecord, VisualEdit } from "@/lib/types";

export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const project = await getServerProject(id);

  if (!project) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  return Response.json({ project });
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = (await request.json()) as {
    project?: ProjectRecord;
    edit?: VisualEdit;
  };

  const existing = await getServerProject(id);
  const incoming = body.project;
  const project = incoming?.id
    ? incoming
    : existing && body.edit
      ? applyVisualEdit(existing, body.edit)
      : null;

  if (!project) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  const saved = await saveServerProject(project);
  return Response.json({ project: saved });
}
