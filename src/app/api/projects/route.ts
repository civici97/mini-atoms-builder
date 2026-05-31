import { saveServerProject, listServerProjects } from "@/lib/server-project-store";
import type { ProjectRecord } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const projects = await listServerProjects();
    return Response.json({ projects });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to list projects" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { project?: ProjectRecord };
    if (!body.project?.id) {
      return Response.json({ error: "Missing project payload" }, { status: 400 });
    }

    const project = await saveServerProject(body.project);
    return Response.json({ project });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to save project" },
      { status: 500 }
    );
  }
}
