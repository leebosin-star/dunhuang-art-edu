# 技术规范

## 技术栈

| 层级 | 选型 | 说明 |
|------|------|------|
| 框架 | React 18 + TypeScript | 成熟稳定，生态丰富 |
| 构建 | Vite | 快速 HMR |
| 样式 | Tailwind CSS | 原子化 CSS，主题定制灵活 |
| 路由 | React Router v6 | 页面路由管理 |
| 手势识别 | MediaPipe Hands | Google 出品，浏览器端运行，21点手部关键点 |
| 画布渲染 | 原生 Canvas 2D API | 手势飘带、粒子系统需要直接像素控制 |
| 画布操作 | Fabric.js | 拼贴模式下的元素拖拽/缩放/旋转 |
| 实时通信 | Socket.IO（预留） | 未来多用户协作扩展 |
| 状态管理 | Zustand | 轻量，TypeScript 友好 |
| 代码规范 | ESLint + Prettier | 统一代码风格 |

---

## 模块一技术方案：参数化算法生成

### 核心算法

| 效果 | 技术方案 | 说明 |
|------|---------|------|
| 敦煌几何纹样 | 极坐标对称绘图 | 基于圆形藻井结构，N 重对称旋转 |
| 莲花变体 | 参数化曲线 | 贝塞尔曲线控制花瓣形态 |
| 飞天波浪线 | 流场 (Flow Field) | Perlin/Simplex Noise 驱动粒子轨迹 |
| 斑驳肌理 | Canvas globalCompositeOperation | 叠加噪点纹理层 |
| 色彩映射 | 敦煌色板 LUT | 参数值映射到预定义敦煌色域 |

### 组件架构
```
Creation.tsx (页面)
├── ParamControls.tsx     # 参数滑块/控制器面板
├── GenerativeCanvas.tsx  # 算法生成画布
└── CollageCanvas.tsx     # 拼贴备用画布（Fabric.js）
```

### 参数 → 算法映射
```
风的方向 (0-1) → 流场角度偏移量
时间的痕迹 (0-1) → 噪点透明度 + 随机扰动幅度
乐律 (0-1) → 粒子密度 + 递归深度
矿物主色 (enum) → 预定义敦煌色板索引
```

---

## 模块二技术方案：手势实时交互

### 飞天舞袖 — 技术流水线

```
摄像头帧 → MediaPipe Hands → 手部21点关键点 → 
  轨迹平滑(指数移动平均) → 贝塞尔曲线生成飘带 →
    Canvas 多层渲染(飘带层 + 粒子层 + 背景壁画层)
```

| 环节 | 技术细节 |
|------|---------|
| 关键点追踪 | MediaPipe Hands，取手腕+指尖+指关节坐标 |
| 轨迹平滑 | 指数移动平均 (EMA)，α=0.3~0.5，去抖 |
| 飘带渲染 | 二次贝塞尔曲线，控制点为历史轨迹点 |
| 飘带渐隐 | 透明度随轨迹年龄衰减，模拟丝绸消散 |
| 粒子系统 | 从飘带边缘随机发射，重力+随机漂移，生命周期 1~2s |
| 色彩 | 飘带主体浅赭+藕荷，粒子淡金+青绿 |

### 色彩唤醒 — 技术流水线

```
摄像头帧 → MediaPipe Hands → 食指指尖坐标 →
  映射到壁画轮廓区域 → Canvas 蒙版渐变填充 →
    该区域透明度降低，色彩显现
```

| 环节 | 技术细节 |
|------|---------|
| 壁画轮廓 | 预先加载 SVG/PNG，绘制到 Canvas 底层 |
| 手势映射 | 指尖坐标归一化到画布坐标系 |
| 色彩晕染 | 以指尖为中心，径向渐变区域，叠加混合模式 |
| 累积效果 | 使用离屏 Canvas 记录「已唤醒」区域 |

### 组件架构
```
Interaction.tsx (页面)
├── CameraView.tsx        # 摄像头画面（背景）
├── RibbonRenderer.tsx    # 飞天舞袖飘带渲染
├── MuralReveal.tsx       # 色彩唤醒壁画层
├── ParticleSystem.tsx    # 粒子特效层
└── GestureGuide.tsx      # 手势引导提示
```

---

## 目录结构

```
src/
├── components/
│   ├── ui/               # 基础 UI 组件
│   ├── layout/           # 布局组件
│   ├── creation/         # 个性创作组件
│   │   ├── ParamControls.tsx
│   │   ├── GenerativeCanvas.tsx
│   │   └── CollageCanvas.tsx
│   └── interaction/      # 实时互动组件
│       ├── CameraView.tsx
│       ├── RibbonRenderer.tsx
│       ├── MuralReveal.tsx
│       ├── ParticleSystem.tsx
│       └── GestureGuide.tsx
├── pages/
│   ├── Creation.tsx
│   └── Interaction.tsx
├── hooks/
│   ├── useGesture.ts     # MediaPipe 手势识别 Hook
│   ├── useParticles.ts   # 粒子系统 Hook
│   └── useGenerative.ts  # 参数化生成 Hook
├── engine/               # 算法引擎（纯函数）
│   ├── flowField.ts      # 流场算法
│   ├── symmetry.ts       # 极坐标对称绘制
│   ├── lotus.ts          # 莲花参数化生成
│   ├── noise.ts          # Simplex Noise 实现
│   └── colors.ts         # 敦煌色板定义与映射
├── stores/
│   ├── creationStore.ts
│   └── interactionStore.ts
├── styles/
│   └── dunhuang-theme.ts # Tailwind 主题配置
├── assets/
│   ├── svg/              # 拼贴用 SVG 素材
│   └── murals/           # 壁画轮廓图
├── App.tsx
└── main.tsx
```

---

## 命名规范

- **组件文件**：PascalCase（`RibbonRenderer.tsx`）
- **工具函数**：camelCase（`flowField.ts`）
- **目录**：kebab-case（`dev-log/`）
- **算法引擎**：纯函数，无副作用，可独立测试

---

## 关键依赖版本

```json
{
  "react": "^18.3",
  "react-dom": "^18.3",
  "react-router-dom": "^6.26",
  "typescript": "^5.5",
  "tailwindcss": "^3.4",
  "fabric": "^6.0",
  "@mediapipe/tasks-vision": "^0.10",
  "zustand": "^4.5"
}
```
