# Mini Atoms Builder

Mini Atoms Builder is a ROOT full-stack challenge demo. It turns a product prompt into a small generated app blueprint with an agent timeline, live preview, generated files, visual edits, version history, and persistence.

## Stack

- Next.js 16, React 19, TypeScript, Tailwind CSS
- ModelScope OpenAI-compatible inference API
- Supabase-ready project persistence
- LocalStorage fallback so the demo stays usable without Supabase

## Run Locally

```bash
npm install
npm run dev
```

Create `.env.local` from `.env.example` and set:

```bash
MODELSCOPE_SDK_TOKEN=your_modelscope_sdk_token
MODELSCOPE_BASE_URL=https://api-inference.modelscope.cn/v1
MODELSCOPE_MODEL=Qwen/Qwen2.5-Coder-32B-Instruct
```

Supabase is optional. If these variables are missing, projects still persist in the browser:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## What Is Implemented

- Prompt-driven generation through `/api/generate`
- ModelScope streaming with local fallback
- PM / Architect / Engineer / QA agent timeline
- Live desktop and mobile preview
- Generated file browser
- Project save, reload, and remix flow
- Visual edits for title and accent color
- Browser persistence plus Supabase-ready API routes

## API

- `POST /api/generate`
- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/[id]`
- `PATCH /api/projects/[id]`
- `POST /api/projects/[id]/remix`

## Tests

```bash
npm test
npm run lint
npm run build
```

## Notes

Secrets are not committed. Configure ModelScope and Supabase credentials in local and deployment environment variables only.
