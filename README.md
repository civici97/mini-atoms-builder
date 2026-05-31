# Mini Atoms Builder

Mini Atoms Builder 是 ROOT 全栈笔试 Demo。用户输入中文应用需求后，系统用 PM / Architect / Engineer / QA 多智能体流程生成应用原型，并在 Atoms 风格的中文工作台中展示 AI 团队、应用预览、代码文件、项目数据、视觉编辑和历史版本。

## Stack

- Next.js 16, React 19, TypeScript, Tailwind CSS
- ModelScope OpenAI-compatible inference API
- Supabase-ready project persistence
- LocalStorage fallback so the demo stays usable without Supabase

## 本地运行

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

Supabase 可选。如果未配置，项目仍会保存到浏览器本地存储：

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## 已实现

- 通过 `/api/generate` 根据中文需求生成应用
- 魔搭 ModelScope 流式输出，本地模板兜底
- PM / Architect / Engineer / QA 智能体时间线
- 桌面和手机应用预览
- 生成代码文件浏览
- 项目保存、刷新恢复和继续迭代
- 标题与主题色视觉编辑
- 浏览器持久化和 Supabase-ready API

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

## 说明

密钥不提交到仓库。ModelScope 和 Supabase 凭证只放在本地或部署环境变量中。
