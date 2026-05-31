# ROOT 全栈岗位笔试提交草稿

## 笔试文档

本地副本：`docs/root-fullstack-submission-draft.md`

## 已部署的可测试链接

待填：`<Vercel public URL>`

## 代码链接

待填：`<GitHub public repository URL>`

## 简要说明

### 实现思路

我实现了一个 ModelScope 驱动的 Mini Atoms Builder。用户输入产品想法后，系统以 PM / Architect / Engineer / QA 四个智能体阶段展示生成过程，并输出一个可交互的网页应用预览、文件列表和项目数据。整体体验贴近 Atoms/MGX 的“描述需求 -> 智能体协作 -> 应用预览 -> 继续迭代”主流程。

### 关键取舍

- LLM 调用使用魔搭 ModelScope 的 OpenAI 兼容接口，默认模型为 `Qwen/Qwen2.5-Coder-32B-Instruct`。
- 为保证评审时可用，即使外部 API 不稳定或未配置 token，也会回退到本地规则生成器。
- 数据持久化优先保证可体验：浏览器 LocalStorage 默认可用；同时提供 Supabase schema 和 API 适配，部署时可切换到 Supabase。
- 当前版本生成的是可视化应用蓝图和代码文件，不直接运行任意模型生成代码，降低安全和稳定性风险。

### 当前完成程度

- 已完成真实 Prompt 输入和生成流程。
- 已完成 Agent Timeline、Live Preview、Generated Files、Project Data 三栏工作台。
- 已完成桌面/移动预览切换。
- 已完成预览内按钮交互反馈。
- 已完成保存、刷新恢复、视觉编辑和 Remix 版本迭代。
- 已完成 ModelScope streaming API 和本地 fallback。
- 已完成 Supabase-ready 的项目持久化接口和表结构。
- 已完成测试、lint 和生产构建验证。

### 继续投入会如何扩展

1. 将生成文件放入安全沙箱直接运行，形成真正的“生成应用即预览”体验。
2. 增加 Git diff / version compare，让每次 Remix 的变化更清晰。
3. 增加登录和分享链接，让候选项目可跨设备访问。
4. 接入 Supabase Auth 和数据库，让项目历史从浏览器本地迁移到云端。
5. 加入自动部署生成应用的能力，把 Demo 从 Builder 扩展成轻量发布平台。

### AI Coding 工具使用说明

使用 Codex 协助完成需求拆解、TDD 测试、Next.js 实现、文档整理与验证。
