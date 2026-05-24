# 执行计划

## Phase 0：项目初始化

- [x] 创建项目文档体系（docs/ + dev-log/）
- [x] 编写 CLAUDE.md 指引文件
- [x] 需求细化（个性创作 + 实时互动模块）
- [x] Vite + React + TypeScript 脚手架
- [x] 安装依赖并配置 Tailwind 主题
- [x] 配置 ESLint + Prettier

## Phase 1：UI 框架搭建 ✅

- [x] 首页（模块入口卡片）
- [x] React Router 页面路由
- [x] 个性创作页面骨架
- [x] 实时互动页面骨架
- [x] 敦煌主题 Tailwind 变量落地

## Phase 2：个性创作模块

### 2.1 算法引擎（纯函数，可单测）
- [ ] 敦煌色板定义 (`engine/colors.ts`)
- [ ] Simplex Noise 实现 (`engine/noise.ts`)
- [ ] 流场算法 (`engine/flowField.ts`)
- [ ] 极坐标对称绘制 (`engine/symmetry.ts`)
- [ ] 莲花参数化生成 (`engine/lotus.ts`)

### 2.2 交互层
- [ ] `ParamControls.tsx` — 参数滑块面板
- [ ] `GenerativeCanvas.tsx` — 算法生成画布
- [ ] `useGenerative` Hook — 参数→渲染管线

### 2.3 降级方案
- [ ] `CollageCanvas.tsx` — Fabric.js 拼贴画布
- [ ] SVG 素材准备（九色鹿/祥云/飘带）
- [ ] 模式切换逻辑

## Phase 3：实时互动模块

### 3.1 基础设施
- [ ] MediaPipe Hands 集成与加载
- [ ] `useGesture` Hook — 手部关键点追踪
- [ ] 摄像头权限管理与开关

### 3.2 飞天舞袖
- [ ] 轨迹平滑 (EMA 滤波)
- [ ] 贝塞尔飘带渲染 (`RibbonRenderer.tsx`)
- [ ] 飘带渐隐（透明度衰减）
- [ ] 粒子系统 (`useParticles` + `ParticleSystem.tsx`)

### 3.3 色彩唤醒
- [ ] 壁画轮廓加载与渲染
- [ ] 手势→画布坐标映射
- [ ] 径向渐变晕染效果 (`MuralReveal.tsx`)
- [ ] 离屏 Canvas 累积状态

### 3.4 交互引导
- [ ] `GestureGuide.tsx` — 新手手势提示

## Phase 4：联调与部署

- [ ] 两个模块功能测试
- [ ] 性能优化（Canvas 分层、requestAnimationFrame 管理）
- [ ] 与首页/美育专区/色彩演变模块集成
- [ ] 跨浏览器测试
- [ ] 部署上线

---

## 执行原则

1. **小步快走**：每次只改少量文件，确认无误再继续
2. **随时可运行**：每个阶段结束时 `npm run dev` 必须正常
3. **算法先行**：引擎纯函数独立开发测试，再做 UI 集成
4. **文档同步**：功能变更时同步更新 docs/ 对应文档
5. **日志记录**：每天在 dev-log/ 写入开发日志
