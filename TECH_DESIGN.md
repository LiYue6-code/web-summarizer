# 个人展示网站 · 技术设计文档（Tech Design）

> 版本：v1.0　|　配套文档：`PRD.md`（需求）、`AGENTS.md`（开发规范）
> 本文档的作用：让 AI 或开发者明确「用什么技术、代码怎么组织、存什么数据、有哪些技术难点」。

---

## 1. 技术栈选择

### 1.1 总体思路
个人展示网站的**内容大多是静态的**（个人资料、技能、项目、博客文章），适合「静态优先 + 少量服务端能力」的架构：
- 页面与内容在构建期生成静态 HTML，SEO 好、加载快。
- 联系表单需要一小段服务端逻辑，用框架自带的 Serverless 函数即可，无需单独后端服务。

### 1.2 具体选型

| 层 | 选型 | 说明 |
|---|---|---|
| 框架 | **Next.js 15（App Router）** | 文件路由、SSG/SSR、内置图片优化、内置 Route Handlers（处理表单）、开箱即用的 SEO 能力 |
| 语言 | **TypeScript（strict）** | 类型安全，内容数据模型可被 IDE 与 AI 校验 |
| UI 样式 | **Tailwind CSS** | 原子类，深色主题/响应式/圆角/毛玻璃易实现，配合 CSS 变量做主题令牌 |
| 组件 | 自建轻量组件为主 | 避免引入重型 UI 库；图标用 `lucide-react`（统一风格） |
| Markdown 渲染 | **`gray-matter` + `unified/remark/rehype`** | 解析 front-matter 与正文；`rehype-slug` + `rehype-autolink-headings` 生成锚点，供 TOC 使用 |
| 代码高亮 | **`shiki`**（或 `rehype-pretty-code`） | 高质量、主题可切换，与深色主题匹配 |
| TOC 目录 | 基于渲染后的标题自研提取 | 用 `rehype-slug` 输出带 id 的标题，前端遍历生成目录 |
| 星空背景 | **自研 Canvas 2D 组件** | `requestAnimationFrame` 驱动，粒子闪烁 + 视差；无需 three.js（2D 粒子足够） |
| 表单提交 | **Next.js Route Handler** + 邮件服务 | 见 §1.3 |
| 部署 | **Vercel**（或任何支持 Next.js 的平台） | 零配置、内置 Serverless 函数、自动 HTTPS |

### 1.3 后端与数据存储
- **后端**：不单独搭建后端服务。使用 Next.js 的 **Route Handler**（`app/api/...`）处理联系表单。
- **数据库**：
  - **内容数据（个人资料/技能/项目/博客）：不使用数据库**，用**本地文件**作为唯一数据源：
    - 结构化数据 → 配置文件（TS/JSON/YAML），如 `content/site.ts`、`content/projects/*.md`。
    - 博客文章 → `content/blog/*.md`（front-matter + Markdown）。
  - **联系表单消息**：二选一，按需决定：
    - **方案 A（推荐，无需数据库）**：通过邮件服务（如 **Resend**）把表单内容发送到个人邮箱，服务端不落地存储。
    - **方案 B（需要留存）**：写入 **SQLite**（`better-sqlite3`）或托管服务 **Supabase**（Postgres）。
  - 默认采用**方案 A**，并把「邮件服务 + 收件邮箱」做成环境变量，便于后续切换到方案 B。

### 1.4 关键依赖清单（参考）
```
next, react, react-dom, typescript
tailwindcss, postcss, autoprefixer
gray-matter, unified, remark-parse, remark-rehype, rehype-stringify,
rehype-slug, rehype-autolink-headings, shiki (或 rehype-pretty-code)
lucide-react
resend (联系表单邮件)
zod (表单/内容数据校验)
```

---

## 2. 项目结构

```
personal-site/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # 全局布局：导航 + 页脚 + 主题
│   ├── page.tsx                # 首页（单页滚动，聚合各区块）
│   ├── globals.css             # Tailwind + 主题 CSS 变量
│   ├── blog/
│   │   ├── page.tsx            # 博客列表页
│   │   └── [slug]/page.tsx     # 博客详情页
│   ├── projects/
│   │   └── [slug]/page.tsx     # 项目详情页
│   ├── not-found.tsx           # 404
│   └── api/
│       └── contact/route.ts    # 联系表单 Route Handler
├── components/                 # React 组件
│   ├── Navbar.tsx / Footer.tsx
│   ├── Starfield.tsx           # 星空 Canvas 组件
│   ├── hero/ about/ skills/ projects/ blog/ contact/   # 各区块
│   ├── MarkdownRenderer.tsx    # MD 渲染 + 高亮 + TOC
│   └── ui/                     # 基础组件：Button / Card / Tag / Progress
├── content/                    # 内容数据（与代码解耦）
│   ├── site.ts                 # 站点配置：姓名/职位/头像/社交/强调色
│   ├── about.ts                # 简介/经历时间线/教育背景
│   ├── skills.ts               # 技能分类与熟练度
│   ├── projects/               # 项目：每个项目一个 .md（front-matter + 正文）
│   └── blog/                   # 博客：每篇一个 .md
├── lib/
│   ├── content.ts              # 读取/解析 MD 与配置的统一入口
│   ├── markdown.ts             # unified 管线配置（remark/rehype/shiki）
│   └── validation.ts           # zod schema 校验内容数据
├── public/                     # 静态资源：头像、项目封面、简历 PDF
├── types/                      # TS 类型定义（对应数据模型）
├── tests/                      # 单元/集成测试
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── .env.example                # RESEND_API_KEY 等环境变量示例
└── AGENTS.md
```

---

## 3. 数据模型

> 所有内容数据通过 `lib/validation.ts` 的 zod schema 校验，非法数据在构建期报错。

### 3.1 站点配置（`content/site.ts`）
```ts
interface SiteConfig {
  name: string;              // 姓名
  title: string;             // 职位/头衔
  tagline: string;           // 一句话介绍
  avatar: string;            // 头像路径
  email: string;             // 联系邮箱
  resumeUrl?: string;        // 简历 PDF 路径
  accentColor: string;       // 强调色（主题令牌，可配置）
  socials: { label: string; icon: string; url: string }[];
  nav: { label: string; href: string }[];
}
```

### 3.2 个人介绍（`content/about.ts`）
```ts
interface About {
  summary: string[];                        // 简介段落
  timeline: { period: string; title: string; org: string; desc: string; tags?: string[] }[];
  education: { school: string; degree: string; period: string; note?: string }[];
}
```

### 3.3 技能（`content/skills.ts`）
```ts
interface Skill {
  name: string;
  icon: string;             // 图标标识
  level: 1 | 2 | 3 | 4 | 5; // 熟练度
}
interface SkillCategory {
  category: string;
  items: Skill[];
}
```

### 3.4 项目（`content/projects/*.md` 的 front-matter）
```ts
interface Project {
  slug: string;             // 文件名派生
  title: string;
  summary: string;          // 卡片一句话描述
  cover: string;            // 封面图路径
  tags: string[];           // 技术标签
  links: { label: string; url: string }[]; // GitHub / Demo
  date: string;
  featured?: boolean;       // 是否在首页置顶
  // 正文（Markdown）：背景、方案、亮点、成果
}
```

### 3.5 博客（`content/blog/*.md` 的 front-matter）
```ts
interface Post {
  slug: string;             // 文件名派生
  title: string;
  excerpt: string;          // 摘要（列表展示）
  date: string;             // ISO 日期
  tags: string[];
  draft?: boolean;          // 草稿（构建时不发布）
  // 正文（Markdown）
}
```

### 3.6 联系表单（提交体）
```ts
interface ContactMessage {
  name: string;
  email: string;            // zod email 校验
  subject?: string;
  content: string;
}
```

---

## 4. 关键技术点

### 4.1 星空背景性能（重点难点）
- 用单个 `<canvas>` 铺满视口，`requestAnimationFrame` 渲染粒子（位置 + 透明度闪烁）。
- **移动端降级**：根据视口宽度动态降低粒子数（如桌面 200、移动 60）。
- **视差**：监听滚动/鼠标，给粒子一个极小的位移系数；用 `passive` 监听、节流。
- **省电/无障碍**：`prefers-reduced-motion: reduce` 时停用闪烁与视差，粒子静态；页面不可见（`document.hidden`）时暂停动画。
- **避免重排**：所有计算在 JS 层完成，仅操作 canvas，不触发 DOM 布局。

### 4.2 博客「新增 MD 自动更新」
- 博客列表与详情都在**构建期**读取 `content/blog/*.md`（Next.js `generateStaticParams` + `generateMetadata`）。
- 新增/修改 MD 后重新构建即可生效；若希望「内容更新不重新部署代码」，可把内容放在独立仓库/对象存储并在运行时读取，或使用 CMS（P1 阶段再评估，默认构建期读取足够）。

### 4.3 Markdown 渲染 + 代码高亮 + TOC
- 用 `unified` 管线：`remark-parse → remark-rehype → rehype-slug（标题加 id）→ rehype-autolink-headings → shiki 高亮 → rehype-stringify`。
- TOC：遍历渲染后的标题节点生成目录；桌面端侧栏固定，移动端折叠。
- **安全**：渲染前对 HTML 做 sanitize（不信任原始 HTML），防止 XSS。
- 代码块主题与站点深色主题统一。

### 4.4 响应式与设计令牌
- Tailwind 断点与 PRD 一致：默认（移动）单列 / `sm` 两列 / `lg` 三列。
- 配色通过 CSS 变量暴露：`--bg`、`--text`、`--accent`、`--muted`、`--border`，强调色改动只需改 `--accent` 一处。
- 内容容器 `max-width: 1200px`，水平居中。

### 4.5 联系表单
- 前端 `zod` 做实时校验；提交中禁用按钮；提交后成功/失败反馈。
- 服务端 Route Handler 再次校验（不信任前端），调用 Resend 发送邮件；失败返回结构化错误。
- 防垃圾：honeypot 隐藏字段 + 简单限流（如每 IP 每分钟 N 次）。

### 4.6 SEO
- 每页输出 `title` / `description` / Open Graph / `canonical`。
- 博客与项目详情用 `generateMetadata` 按内容动态生成。
- 生成 `sitemap.xml` 与 `robots.txt`；图片使用 Next.js `Image` 优化。

### 4.7 无障碍
- 焦点样式清晰；汉堡菜单支持键盘（Esc 关闭、焦点陷阱）。
- 对比度达 WCAG AA；纯装饰元素（如星空 canvas）设 `aria-hidden`。
- 图标按钮带 `aria-label`；表单 label 关联 input。

---

## 5. 环境变量（`.env`）

```
RESEND_API_KEY=          # 联系表单邮件服务
CONTACT_EMAIL=           # 收件邮箱
NEXT_PUBLIC_SITE_URL=    # 站点地址（SEO/OG 用）
```
