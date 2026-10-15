# AGENTS.md — 个人展示网站开发规范

> 本文件是给 AI 编程代理（Cursor Agent / Claude Code 等）的**项目开发规范**。
> 开发任何功能前先读本文件；与 `PRD.md`（需求）和 `TECH_DESIGN.md`（技术设计）保持一致。

---

## 1. 项目概述

- **项目**：个人展示网站（深色星空主题、简洁现代、多端适配）。
- **核心模块**：Hero、个人介绍、技能展示、项目展示、博客、联系、全局导航/页脚。
- **技术栈**：Next.js 15（App Router）+ TypeScript（strict）+ Tailwind CSS；Markdown 用 `unified` 生态渲染；联系表单用 Route Handler + Resend；部署 Vercel。
- **内容与代码解耦**：个人资料/技能/项目/博客全部放在 `content/` 下，**改内容不改代码**。

---

## 2. 开发前必读

1. 先读 `PRD.md` 了解需求与验收标准，再读 `TECH_DESIGN.md` 了解架构与数据模型。
2. 新增依赖前评估必要性，保持依赖精简（不引入重型 UI 库）。
3. 不确定某个库的 API/版本时，**先用 Context7 查官方文档**，不要凭记忆猜。

---

## 3. 项目结构约定

```
app/           # 路由与页面（layout / page / [slug] / api）
components/    # React 组件，按区块组织（hero/ about/ skills/ ...）
content/       # 内容数据（site.ts / about.ts / skills.ts / projects/*.md / blog/*.md）
lib/           # 内容读取、markdown 管线、zod 校验
types/         # TS 类型定义
public/        # 静态资源（头像、封面、简历 PDF）
tests/         # 测试
```

- 页面放在 `app/`；可复用 UI 放 `components/`；**业务逻辑不进组件**，放到 `lib/`。

---

## 4. 开发规范

### 4.1 组件规范
- 组件用**函数组件 + Hooks**；一个文件一个组件，文件名与组件名一致（PascalCase）。
- 组件保持单一职责：展示组件不直接读文件系统，数据由 `lib/content.ts` 统一提供。
- 服务端组件（默认）与客户端组件分离；需要交互（星空、汉堡菜单、表单、TOC）才加 `"use client"`。
- 星空背景组件（`Starfield.tsx`）必须是客户端组件，且不得阻塞首屏渲染。

### 4.2 内容数据规范
- 所有内容数据（`content/` 下）必须能被 `lib/validation.ts` 的 zod schema 校验通过。
- 博客/项目使用 Markdown：front-matter 用 YAML，字段与 `types/` 中的类型一致。
- 新增文章：在 `content/blog/` 加一个 `.md`，front-matter 写 `title`、`excerpt`、`date`、`tags`；草稿设 `draft: true`。
- 时间统一用 ISO 格式（`YYYY-MM-DD`）。

### 4.3 样式规范
- 使用 Tailwind 原子类；主题色、背景、文字等统一走 CSS 变量（`--bg`、`--text`、`--accent` 等），不写死颜色值。
- 圆角遵循 12–16px；动效统一缓动（`ease-out`，150–250ms）。
- 内容容器 `max-width: 1200px`；响应式断点：移动单列 / `sm` 两列 / `lg` 三列。
- 新增颜色/尺寸先考虑是否应作为设计令牌（CSS 变量），避免散落的魔法值。

### 4.4 TypeScript 规范
- 开启 `strict`；禁止 `any`（确有需要时显式说明并尽量收窄）。
- 数据模型在 `types/` 定义，`content/` 与 `lib/` 复用同一类型，保证单一事实来源。

---

## 5. 代码风格

- 使用 **ESLint + Prettier**（Next.js 默认规则即可），提交前格式化、无 lint 报错。
- 命名：组件 PascalCase；函数/变量 camelCase；常量 UPPER_SNAKE_CASE；类型/接口 PascalCase。
- 注释：关键逻辑、非显然的处理（如性能优化、无障碍处理）加简短中文注释；不写废话注释。
- 每个导出函数/组件添加必要说明（JSDoc），说明用途与关键参数。

---

## 6. 测试要求

- 关键纯逻辑（`lib/content.ts` 内容解析、`lib/validation.ts` 校验、TOC 提取、表单校验）必须有单元测试。
- 测试框架：**Vitest**（配合 React Testing Library 测试组件交互）。
- 提交功能时，相关测试须通过；修复 bug 时先补能复现的测试。
- 验证命令：`npm run lint`、`npm run typecheck`、`npm run test`、`npm run build` 全部通过才算完成。

---

## 7. 验收清单（每条开发必须对照）

1. 375px 宽度无横向滚动。
2. 移动端星空帧率 ≥ 50fps（粒子数降级）。
3. 新增 MD 文件后博客列表自动更新（构建期读取）。
4. 表单提交有成功/失败反馈，且防重复提交。
5. 深色主题对比度达 WCAG AA。
6. 全站键盘可导航、焦点可见；图片有 `alt`；装饰元素 `aria-hidden`。

---

## 8. 注意事项（易踩坑）

- **星空性能**：只操作 canvas、用 `requestAnimationFrame`、移动端降粒子、`prefers-reduced-motion` 与页面不可见时暂停；严禁在动画循环里触发 DOM 重排。
- **Markdown 安全**：渲染前 sanitize，防 XSS；代码高亮主题要与深色主题匹配。
- **表单安全**：服务端必须二次校验（zod），做 honeypot + 限流，不信任前端。
- **SEO**：博客/项目详情用 `generateMetadata` 动态输出 meta；图片用 Next.js `Image`。
- **无障碍**：汉堡菜单焦点管理；`prefers-reduced-motion` 全局生效。
- **不要**：为星空引入 three.js（2D 粒子足够）；为简单表单引入状态管理库；硬编码颜色与尺寸。

---

## 9. 常用命令

```bash
npm run dev        # 本地开发
npm run build      # 生产构建
npm run lint       # 代码检查
npm run typecheck  # 类型检查
npm run test       # 运行测试
```
