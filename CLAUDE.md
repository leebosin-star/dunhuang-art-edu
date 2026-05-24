# CLAUDE.md — 敦煌色彩美育网站

## 项目概述

敦煌色彩美育独立网页应用，包含「个性创作」和「实时互动」两大模块。
技术栈：React 18 + TypeScript + Vite + Tailwind CSS。

---

## 标准文件路径

每次开始工作前，读取以下文件以同步最新的项目状态：

| 文件 | 路径 | 说明 |
|------|------|------|
| 产品需求 | `./docs/requirements.md` | 功能需求与项目目标 |
| 技术规范 | `./docs/tech-spec.md` | 技术选型、目录结构、命名规范 |
| 设计规范 | `./docs/design-spec.md` | 敦煌色彩体系、UI 组件原则、字体 |
| 执行计划 | `./docs/execution-plan.md` | 分阶段任务与进度跟踪 |
| 今日日志 | `./dev-log/YYYY-MM-DD.md` | 每日开发记录与待办 |

---

## 工作约定

1. **开始新任务前**：读取 `docs/execution-plan.md` 确认当前阶段
2. **涉及 UI 时**：读取 `docs/design-spec.md`，严格使用敦煌色彩变量
3. **每日收尾**：更新 `dev-log/YYYY-MM-DD.md`，记录完成事项和待办
4. **功能变更**：同步更新 `docs/requirements.md` 中对应描述
5. **技术决策**：记录到 `docs/tech-spec.md`
6. **新增依赖**：先确认必要性，再安装，记录到 tech-spec.md

---

## 编码约定

- 组件使用函数式 + Hooks，类型使用 interface 定义
- 样式优先使用 Tailwind 原子类，自定义敦煌配色通过 `tailwind.config` 扩展
- 避免过度抽象：三个相似组件再考虑抽取公共逻辑
- 不加注释解释代码做了什么——好的命名自解释
- 每个 Phase 结束后确认 `npm run dev` 正常运行

---

## 当前状态

- **当前 Phase**：Phase 0/1 完成 → 即将进入 Phase 2（算法引擎 + 个性创作）
- **阻塞项**：无
