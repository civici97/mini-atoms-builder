import {
  getServerProject,
  saveServerProject
} from "@/lib/server-project-store";
import { upsertGeneration } from "@/lib/project-state";
import { createFallbackBuild } from "@/lib/templates";

export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as { prompt?: string };
  const prompt = body.prompt?.trim();
  const project = await getServerProject(id);

  if (!project) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  if (!prompt) {
    return Response.json({ error: "Missing remix prompt" }, { status: 400 });
  }

  const result = createFallbackBuild(prompt);
  const next = upsertGeneration(project, prompt, result);
  const saved = await saveServerProject(next);

  return Response.json({ project: saved, result });
}
