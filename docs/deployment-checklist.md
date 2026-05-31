# Deployment Checklist

## Required Accounts

- GitHub account with permission to create a public repository.
- Vercel account connected to that GitHub repository, or a valid `VERCEL_TOKEN`.

## GitHub

```bash
git remote add origin https://github.com/<your-name>/mini-atoms-builder.git
git push -u origin main
```

Repository visibility must be public before submitting the exam document.

## Vercel

Set these environment variables in Vercel:

```bash
MODELSCOPE_SDK_TOKEN=<rotated_modelscope_token>
MODELSCOPE_BASE_URL=https://api-inference.modelscope.cn/v1
MODELSCOPE_MODEL=Qwen/Qwen2.5-Coder-32B-Instruct
```

Optional Supabase variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=<supabase_project_url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase_anon_key>
SUPABASE_SERVICE_ROLE_KEY=<supabase_service_role_key>
```

Deploy command:

```bash
npx vercel --prod
```

## Post-Deploy Verification

- Open the deployed URL in a private browser window.
- Generate a project from a prompt.
- Confirm the Agent Timeline updates.
- Confirm the preview action buttons respond.
- Save a visual edit, refresh, and confirm the saved project is still available.
- Confirm the GitHub repository is public.
